var NODEJS = typeof module !== 'undefined' && module.exports;

var config        = require('../common/config.js');
var gameloop      = require('node-gameloop');
var Zorbio        = require('../common/zorbio.js');
var Validators    = require('./Validators.js');
var UTIL          = require('../common/util.js');
var Drain         = require('../common/Drain.js');
var WebSocket     = require('ws');
var BotController = require('./BotController.js');
var ServerPlayer  = require('./ServerPlayer.js');
var Schemas       = require('../common/schemas.js');
var perfNow       = require("performance-now");
var uuid          = require("node-uuid");
var cookie        = require("cookie");

/**
 * This module contains all of the app logic and state,
 * @param id
 * @param app
 * @constructor
 */
var AppServer = function (id, app) {
    //  Scope
    var self = this;

    // ID of this game instance generated by the AppProxy
    self.id = id;

    /**
     * Console.log wrapper so we can include instance id for filtering
     */
    self.log = function appLog() {
        // prepend instance id to message
        arguments[0] = '[' + self.id + '] ' + arguments[0];

        console.log.apply(null, arguments);
    };

    self.log("Creating game instance with ID: ", self.id);

    /**
     * Send message to all connected clients
     * @param data
     */
    self.broadcast = function appBroadcast(data) {
        var propNames = Object.getOwnPropertyNames(self.clients);
        for (var i = 0, l = propNames.length; i < l; i++) {
            var socket_uuid = propNames[i];
            var ws = self.clients[socket_uuid];
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        }
    };

    self.app = app; // express

    // Game state
    self.model = new Zorbio.Model();
    self.model.init(config.WORLD_SIZE, config.FOOD_DENSITY);
    self.socket_uuid_map = {};  // Maps a player ID to a socket uuid
    self.clients = {};  // Client websockets with a uuid key
    self.serverMsg = '';

    self.out = {
        clients: 0,
        players: 0,
        socket_uuid_map: 0,
        tick_time_metric: new Zorbio.PlayerMetric(50),
        au_send_metric: new Zorbio.PlayerMetric(100),
    };

    self.addClient = function appAddClient(ws) {
        var headers = JSON.stringify(ws.upgradeReq.headers);
        var NB_SRVID = self.parseNbSrvIdCookie(ws.upgradeReq.headers.cookie);
        var socket_uuid = uuid.v4();
        self.clients[socket_uuid] = ws;

        self.log('Client connection headers:', headers);
        self.log('Socket UUID: ', socket_uuid);

        self.sendInitGame(ws, NB_SRVID);

        // Player properties
        var currentPlayer;
        var player_id;
        var type;
        var name;
        var color;
        var skin;
        var key;

        // Pool variables for speed
        var rapidBuffer  = new ArrayBuffer(20);
        var rapidView = new Float32Array(rapidBuffer);

        ws.on('message', function wsMessage(msg) {
            if (typeof msg === "string") {
                var message;

                try {
                    message = JSON.parse(msg);
                } catch(e) {
                    if (config.DEBUG) {
                        console.error("error parsing json on message in wss: ", e);
                    }
                    return;  // ignore
                }

                switch (message.op) {
                    case 'enter_game':
                        handle_enter_game(message);
                        break;
                    case 'respawn':
                        handle_msg_respawn();
                        break;
                    case 'player_ready':
                        handle_msg_player_ready();
                        break;
                    case 'zor_ping':
                        handle_msg_zor_ping(message);
                        break;
                    case 'speed_boost_start':
                        handle_msg_speed_boost_start();
                        break;
                    case 'speed_boost_stop':
                        handle_msg_speed_boost_stop();
                        break;
                }
            }
            else {
                // Read binary data
                var op = msg.readFloatLE(0);
                if (op === Schemas.ops.CLIENT_POSITION_RAPID) {
                    handle_client_position_rapid(msg);
                }
                else {
                    // Route binary message
                    handle_msg_player_update(msg);
                }
            }
        });

        ws.on('close', function wsClose() {
            handle_close();
        });

        ws.on('error', function(e) {
            console.error("WebSocket error occured for player_id", player_id, e);
        });

        function handle_enter_game(msg) {
            player_id = Zorbio.IdGenerator.get_next_id();
            type  = msg.type;
            name  = msg.name;
            color = msg.color;
            skin  = config.SKINS[msg.skin] ? msg.skin : 'default';  // validate skin name
            key   = msg.key;

            // Sanitize player name
            name = UTIL.filterName(name);

            self.log("Player enter request: ", player_id, type, name, color, skin, key);

            // spawn the player
            handle_msg_respawn();
        }

        function handle_msg_respawn() {
            var position = UTIL.safePlayerPosition();

            if (currentPlayer && self.isPlayerInGame(currentPlayer.id)) {
                // make sure this player isn't already connected and playing
                self.log("Respawn error: Player is already in game");
                self.kickPlayer(currentPlayer.id, "Forced respawn.");
                return;
            }

            // Create the Player
            currentPlayer = new ServerPlayer(player_id, name, color, skin, type, position, ws);
            currentPlayer.headers = headers;
            currentPlayer.socket_uuid = socket_uuid;

            // Send welcome message
            var msg = {
                0: Schemas.ops.WELCOME,
                player: currentPlayer.reduce(),
            };
            var buffer = Schemas.welcomeSchema.encode(msg);
            ws.send(buffer);

            self.log('User ' + currentPlayer.id + ' spawning into the game');
        }

        function handle_msg_player_ready() {
            self.log('Player ' + currentPlayer.id + ' client ready');

            if (Validators.is_profane(currentPlayer.name)) {
                console.error('Kicking for profane name:', currentPlayer.name, JSON.stringify(headers));
                ws.send(JSON.stringify({op: 'kick', reason: 'Invalid username'}));
                ws.close(config.CLOSE_NO_RESTART, "close but don't reload client page");
            }
            else if (!Validators.validAlphaKey(key)) {
                console.error('ALPHA KEY INVALID');
                ws.send(JSON.stringify({op: 'kick', reason: 'Invalid alpha key'}));
                ws.close();
            }
            else {
                // Save mapping of player_id to socket uuid
                self.socket_uuid_map[currentPlayer.id] = socket_uuid;

                // Set initial times
                currentPlayer.lastHeartbeat = Date.now();
                currentPlayer.spawnTime = Date.now();

                if (self.model.getPlayerById(currentPlayer.id)) {
                    // if current player is already in the players remove them
                    self.model.removePlayer(currentPlayer.id);
                }

                // Pass any data to the for final setup
                ws.send(JSON.stringify({op: 'game_setup'}));

                // give the client player time to load the game before notifying other players to add them
                setTimeout(function playerJoinDelay() {
                    // Notify other clients that player has joined
                    self.broadcast(JSON.stringify({op: 'player_join', player: currentPlayer}));

                    // Add the player to the model
                    self.model.players.push(currentPlayer);
                    self.model.addActor(currentPlayer.sphere);

                    var playerCount = self.model.getRealPlayers().length;
                    self.log('Player ' + currentPlayer.id + ' joined game!');
                    self.log('Total players: ' + playerCount);

                    // see if we need to remove a bot
                    if (self.botController.hasBots() && playerCount > config.MAX_BOTS) {
                        var bot = self.botController.removeBot();

                        // notify other players that this bot was removed
                        self.broadcast(JSON.stringify({op: 'remove_player', playerId: bot.player.id}));
                    }
                }, 200);
            }
        }

        function handle_msg_zor_ping(msg) {
            currentPlayer.lastHeartbeat = Date.now();

            // save recent pings and fps
            currentPlayer.ping_metric.add(msg.lastPing);
            currentPlayer.fps_metric.add(msg.fps);

            ws.send(JSON.stringify({op: "zor_pong"}));
        }

        function handle_client_position_rapid(buffer) {
            if (!config.ENABLE_RAPID_UPDATES) return;

            var viewIndex = 0;
            for (var bufferIndex = 0, l = buffer.length; bufferIndex < l; bufferIndex += 4) {
                rapidView[viewIndex] = buffer.readFloatLE(bufferIndex);
                viewIndex++;
            }

            //TODO: implement caching for getActorById()
            var actor = self.model.getActorById(rapidView[1]);
            if (actor) {
                actor.position.set(rapidView[2], rapidView[3], rapidView[4]);
                self.broadcast(rapidBuffer);
            }
        }

        function handle_msg_player_update(buffer) {
            if (!currentPlayer) return;

            currentPlayer.lastHeartbeat = Date.now();

            // record timing
            var nowTime = Date.now();
            var receive_gap = nowTime - currentPlayer.pp_receive_metric.last_time;
            currentPlayer.pp_receive_metric.last_time = nowTime;

            // Decode the buffer
            var msg = Schemas.playerUdateSchema.decode(buffer);

            // Save the client metrics
            currentPlayer.pp_send_metric.add(msg.pp_gap);
            currentPlayer.pp_receive_metric.add(receive_gap);
            currentPlayer.au_receive_metric.add(msg.au_gap);
            currentPlayer.buffered_amount_metric.add(msg.buffered_mount);

            // Build the validation object
            var latestPosition = msg.latest_position;
            var sphere = {
                id: msg.sphere_id,
                oldestPosition: msg.oldest_position,
                latestPosition: latestPosition,
                scale: latestPosition.radius,
            };

            // Fixes bug #145 the client may send one last position update before they are removed from the game
            var err;
            var actor = self.model.getActorById(sphere.id);
            if (!actor) {
                err = Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
            } else {
                err = Validators.movementSampled(sphere, actor, self.model);
            }

            if (!err) {
                // update the players position in the model
                actor.position.set( latestPosition.position.x, latestPosition.position.y, latestPosition.position.z);

                // Recent positions
                actor.pushRecentPosition(msg.prev_position_3);
                actor.pushRecentPosition(msg.prev_position_2);
                actor.pushRecentPosition(msg.prev_position_1);
                actor.pushRecentPosition(latestPosition);

                // Iterate over pending food captures
                msg.food_capture_queue.forEach(function captureEachFood(food_entry) {
                    self.foodCapture(currentPlayer, food_entry.fi, actor, food_entry.radius);
                });

            } else {
                switch (err) {
                    case Validators.ErrorCodes.SPEED_TO_FAST:
                        ws.send(JSON.stringify({op: 'speeding_warning'}));
                        self.model.getPlayerById(currentPlayer.id).infractions_speed++;
                        break;
                    case Validators.ErrorCodes.PLAYER_NOT_IN_MODEL:
                        self.log("Recieved 'player_update' from player not in model!", sphere.id);
                        break;
                }
            }
        }

        function handle_close() {
            self.removePlayerSocket(socket_uuid);

            if (player_id) {
                self.log('Player connection closed for player_id:', player_id);

                // notify other clients to remove this player
                self.broadcast(JSON.stringify({op: 'remove_player', playerId: player_id}));

                self.removePlayerFromModel(player_id);

                // remove the map of the player id to the socket uuid
                if (self.socket_uuid_map[player_id]) {
                    delete self.socket_uuid_map[player_id];
                }

                self.replenishBot();
            }
            else {
                self.log("Menu socket connection closed: ", headers);
            }
        }

        function handle_msg_speed_boost_start() {
            self.log("Speed boost request received for player: ", currentPlayer.id);

            if (currentPlayer.abilities.speed_boost.activate(currentPlayer)) {

                self.log("Speed boost START for player: ", currentPlayer.id);

                // Tell client to activate speed boost
                ws.send(JSON.stringify({op: "speed_boost_res", is_valid: true}));

            }
        }

        function handle_msg_speed_boost_stop() {
            self.log("Speed boost STOP for player: ", currentPlayer.id);

            currentPlayer.abilities.speed_boost.deactivate();
        }
    };

    /**
     * Safe method to parse Linode NB_SRVID cookie if it exists.  the NB_SRVID is the id of the nodebalancer node
     * this client will be routed too.
     * @param cookie_header
     * @returns {string}
     */
    self.parseNbSrvIdCookie = function appParseNbSrvIdCookie(cookie_header) {
        var nb_srv_id = '';  // default to empty string

        if (!cookie_header) return nb_srv_id;

        try {
            var cookies = cookie.parse(cookie_header);
            //noinspection JSUnresolvedVariable
            nb_srv_id = cookies.NB_SRVID ? cookies.NB_SRVID : '';
        } catch (e) {
            return nb_srv_id;
        }

        return nb_srv_id;
    };

    self.updateActorDrains = function appUpdateActorDrains(drainers) {
        // update drains
        var drainer;
        var drainee;
        var drain_target;
        var drainee_id;
        var player_id;
        var player;
        var drain_amount;

        var i = self.model.players.length;

        // iterate over players and set their drain targets
        while ( i-- ) {
            player = self.model.players[i];
            player_id = player.id;
            drainer = player.sphere;
            drainer.drain_target_id = 0;  // reset

            drain_target = drainers[player_id][0];

            if (drain_target && drain_target.id > 0) {

                drainee_id = drain_target.id;

                drainer.drain_target_id = drainee_id;
                var drainee_player = self.model.getPlayerById(drainee_id);
                drainee = drainee_player.sphere;

                // Bots can't drain eachother
                if (player.type != Zorbio.PlayerTypes.BOT || drainee_player.type != Zorbio.PlayerTypes.BOT) {
                    drain_amount = Drain.amount(drain_target.dist);

                    drainer.growExpected(+drain_amount);
                    drainee.growExpected(-drain_amount);

                    player.drainAmount += +drain_amount;  // save drain amount stat

                    // if the drain caused the drainer to get bigger than the drainee,
                    // correct so that they're the same size.  drain shouldn't be able
                    // to make a player larger than another because it leads to
                    // infinite back and forth draining.
                    if (drainer.scale > drainee.scale) {
                        drainer.scale = drainee.scale = ( drainer.scale + drainee.scale ) / 2;
                    }
                }
            }
        }
    };

    self.playerUpdates = function appPlayerUpdates() {
        // call update() on all the player model objects
        self.model.players.forEach(function updateEachPlayer(player) {
            player.update();
        });
    };

    self.sendInitGame = function appSendInitGame(ws, NB_SRVID) {
        var initialModel = self.model.reduce();
        var initGameMessage = {
            0: Schemas.ops.INIT_GAME,
            NB_SRVID: NB_SRVID,
            model: initialModel,
        };
        var buffer = Schemas.initGameSchema.encode(initGameMessage);
        ws.send(buffer);
    };

    self.sendActorUpdates = function appSendActorUpdates() {
        var tinyActors = self.model.reduceActors(true);
        var actorUpdatesMessage = {0: Schemas.ops.ACTOR_UPDATES, actors: tinyActors};
        var buffer = Schemas.actorUpdatesSchema.encode(actorUpdatesMessage);
        self.broadcast(buffer);

        // record timing
        var nowTime = Date.now();
        var send_gap = nowTime - self.out.au_send_metric.last_time;
        self.out.au_send_metric.last_time = nowTime;
        self.out.au_send_metric.add(send_gap);
    };

    self.foodCapture = function appFoodCapture (player, fi, actor, origRadius) {
        var food_value = config.FOOD_GET_VALUE(origRadius);

        var err = Validators.foodCapture(self.model, fi, actor, origRadius);

        if (!err) {
            self.model.food_respawning[fi] = config.FOOD_RESPAWN_TIME;

            // Increment the players food captures
            player.foodCaptures++;

            // grow player on the server to track growth validation
            player.sphere.growExpected( food_value );

            // Queue to notify clients of food capture so they can update their food view
            self.model.food_captured_queue.push(fi);
        } else {
            switch (err) {
                case Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR:
                    // inform client of invalid capture, and make them shrink, mark infraction
                    self.model.getPlayerById(player.id).infractions_food++;
                    break;
                case Validators.ErrorCodes.PLAYER_NOT_IN_MODEL:
                    self.log("Recieved 'foodCapture' from player not in model!", actor.id);
                    break;
            }
        }
    };

    /**
     * Checks all players for captures
     */
    self.updatePlayerCaptures = function appUpdatePlayerCaptures() {
        var players_array = self.model.players;
        var p1;
        var p2;
        var distance;

        var j = 0;
        var i = players_array.length;

        while (i--) {
            j = i + 1;

            p1 = players_array[i];

            while (j--) {

                if (i === j) continue; // don't compare player to itself

                // find the distance between these two players
                p2 = players_array[j];

                // See if these players are close enough for capture checking
                distance = p1.sphere.position.distanceTo(p2.sphere.position);
                if (distance > p1.getCaptureRange() && distance > p2.getCaptureRange()) continue;  // players to far apart for capture checking

                // Check if player capture should happen between these two players
                var result = self.checkPlayerCapture(p1, p2);
                if (result && result.targetPlayerId === p1.id) {
                    // p1 got captured so move to the next player
                    break;
                }
            }
        }
    };

    /**
     * Compares two players to see if a capture should occur and captues if true
     * @param p1
     * @param p2
     * @returns {*} returns folse if no capture, other wise the ids of attacking and target players
     */
    self.checkPlayerCapture = function appCheckPlayerCapture(p1, p2) {
        var p1_scale;
        var p2_scale;
        var distance;
        var p1_rp = p1.sphere.recentPositions;
        var p2_rp = p2.sphere.recentPositions;

        if (p1_rp.length < 4 || p2_rp.length < 4) return; // give brand new players time to load positions

        for (var i = p1_rp.length - 4; i < p1_rp.length; i++) {
            for (var j = p2_rp.length - 4; j < p2_rp.length; j++) {
                var rp1 = p1_rp[i];
                var rp2 = p2_rp[j];

                distance = rp1.position.distanceTo(rp2.position);

                p1_scale = rp1.radius;
                p2_scale = rp2.radius;

                // if distance is less than radius of p1 and p1 larger than p2, p1 captures p2
                // if distance is less than radius of p2 and p2 larger than p1, p2 captures p1

                if (distance < (p1_scale + config.PLAYER_CAPTURE_EXTRA_TOLERANCE) && p1_scale > p2_scale) {
                    self.capturePlayer(p1.id, p2.id);
                    return {attackingPlayerId: p1.id, targetPlayerId: p2.id};
                }
                else if (distance < (p2_scale + config.PLAYER_CAPTURE_EXTRA_TOLERANCE) && p2_scale > p1_scale) {
                    self.capturePlayer(p2.id, p1.id);
                    return {attackingPlayerId: p2.id, targetPlayerId: p1.id};
                }
            }
        }

        return false;
    };

    self.capturePlayer = function appCapturePlayer(attackingPlayerId, targetPlayerId) {

        var attackingPlayer = self.model.getPlayerById(attackingPlayerId);
        var targetPlayer = self.model.getPlayerById(targetPlayerId);

        if (!attackingPlayer || !targetPlayer) {
            self.log("ERROR: player capture attacking or target player undefined.");
            return;
        }

        if (attackingPlayer.type === Zorbio.PlayerTypes.BOT && targetPlayer.type === Zorbio.PlayerTypes.BOT) {
            // Don't allow bots to capture each other
            return;
        }

        self.log("Capture player: ", attackingPlayerId, targetPlayerId);

        // Increment player captures for the attacking player
        attackingPlayer.playerCaptures++;

        // grow the attacking player the expected amount
        var attackingSphere = attackingPlayer.sphere;
        var targetSphere = targetPlayer.sphere;
        attackingSphere.growExpected( config.PLAYER_CAPTURE_VALUE( targetSphere.radius() ) );

        if (attackingPlayer.type != Zorbio.PlayerTypes.BOT) {
            // Inform the attacking player that they captured target player
            self.clients[self.socket_uuid_map[attackingPlayerId]].send(JSON.stringify({op: 'captured_player', targetPlayerId: targetPlayerId}));
        }

        if (targetPlayer.type != Zorbio.PlayerTypes.BOT) {
            // Inform the target player that they died
            var time_alive = Math.floor((Date.now() - targetPlayer.spawnTime) / 1000);
            var score = config.PLAYER_GET_SCORE( targetPlayer.sphere.scale );
            var drain_amount = config.PLAYER_GET_SCORE( targetPlayer.drainAmount );

            var msgObj = {
                0: Schemas.ops.YOU_DIED,
                attacking_player_id: attackingPlayerId,
                food_captures: targetPlayer.foodCaptures,
                player_captures: targetPlayer.playerCaptures,
                drain_ammount: drain_amount,
                time_alive: time_alive,
                score: score,
            };

            var buffer = Schemas.youDied.encode(msgObj);

            self.clients[self.socket_uuid_map[targetPlayerId]].send(buffer);
        }
        else {
            self.replenishBot();
        }

        self.removePlayerFromModel(targetPlayerId);

        // Inform other clients that target player died
        msgObj = {op: "player_died", attackingPlayerId: attackingPlayerId, targetPlayerId: targetPlayerId};
        self.broadcast(JSON.stringify(msgObj));
    };

    self.isPlayerInGame = function appIsPlayerInGame(player_id) {
        return (self.model.getPlayerById(player_id) && self.clients[self.socket_uuid_map[player_id]]);
    };

    self.kickPlayer = function appKickPlayer(playerId, reason) {
        self.log('kicking player: ', playerId, reason);

        // notify player
        if (self.clients[self.socket_uuid_map[playerId]]) {
            self.clients[self.socket_uuid_map[playerId]].send(JSON.stringify({op: 'kick', reason: reason}));
        }

        // notify other clients
        self.broadcast(JSON.stringify({op: 'remove_player', playerId: playerId}));

        self.removePlayerFromModel(playerId);
    };

    self.removePlayerFromModel = function appRemovePlayerFromModel(playerId) {
        self.model.removePlayer(playerId);
        self.log('Removed player:', playerId);
    };

    self.removePlayerSocket = function appRemovePlayerSocket(uuid) {
        if (self.clients[uuid]) {
            if (self.clients[uuid].readyState === WebSocket.OPEN) {
                self.clients[uuid].close();
            }
            delete self.clients[uuid];
            self.log("Deleted client socket: ", uuid);
        }
    };

    self.checkHeartbeats = function appCheckHeartbeats() {
        if (!config.HEARTBEAT_ENABLE) return;

        var time = Date.now();

        self.model.players.forEach(function checkPlayerHeartbeats(player) {
            if (player && player.type != Zorbio.PlayerTypes.BOT && player.lastHeartbeat) {
                if ((time - player.lastHeartbeat) > config.HEARTBEAT_TIMEOUT) {
                    var msg = "You were kicked because last heartbeat was over " + (config.HEARTBEAT_TIMEOUT / 1000) + " seconds ago.";
                    self.kickPlayer(player.id, msg);
                }
            }
        });
    };

    self.updateFoodRespawns = function appUpdateFoodRespawns() {
        // keep a current reference of which food indexes are respawning
        self.model.food_respawning_indexes = [];

        for (var i = 0, l = self.model.food_respawning.length; i < l; ++i) {
            if (self.model.food_respawning[i] > 0) {
                self.model.food_respawning[i] = Math.max(  self.model.food_respawning[i] - config.TICK_SLOW_INTERVAL, 0 );

                if (self.model.food_respawning[i] === 0) {
                    // queue up food respawn to send to clients
                    self.model.food_respawn_ready_queue.push(i);
                } else {
                    self.model.food_respawning_indexes.push(i);
                }
            }
        }
    };

    /**
     * Any player checks that need to be done during serverTick, put here.
     */
    self.playersChecks = function appPlayersChecks() {
        self.model.leaders = [];

        // Iterate over all players and perform checks
        self.model.players.forEach(function performPlayerChecks(player) {
            var id = player.id;

            // Check for infractions
            if (player.infractions_food > config.INFRACTION_TOLERANCE_FOOD) {
                self.log("INFRACTION: Player reached food infraction tolerance:", id, player.infractions_food, config.INFRACTION_TOLERANCE_FOOD);
                player.infractions_food = 0;
            }
            else if (player.infractions_pcap > config.INFRACTION_TOLERANCE_PCAP) {
                self.log("INFRACTION: Player reached player capture infraction tolerance:", id, player.infractions_pcap, config.INFRACTION_TOLERANCE_PCAP);
                player.infractions_pcap = 0;
            }
            else if (player.infractions_speed > config.INFRACTION_TOLERANCE_SPEED) {
                self.kickPlayer(id, "You were removed because you had too many speed infractions.");
            }
            else if (player.infractions_scale > config.INFRACTION_TOLERANCE_SCALE) {
                self.log("INFRACTION: Player reached scale infraction tolerance:", id, player.infractions_scale, config.INFRACTION_TOLERANCE_SCALE);
                player.infractions_scale = 0;
            }

            // Add players to leaders array in sorted order by score
            var score = player.getScore();
            var leader = {
                player_id: id,
                score: score
            };
            UTIL.sortedObjectPush(self.model.leaders, leader, 'score');
        });

        // Prepare leaders array
        self.model.leaders.reverse();  // reverse for descending order
        if (self.model.leaders.length > config.LEADERS_LENGTH) {
            self.model.leaders.length = config.LEADERS_LENGTH;
        }
    };

    /**
     * Send any updates to client per server tick
     */
    self.sendServerTickData = function appSendServerTickData() {
        var serverTickData = {
            fr: self.model.food_respawn_ready_queue,
            fc: self.model.food_captured_queue,
            sm: self.serverMsg,
            leaders: self.model.leaders
        };

        var tickSlowMessage = {0: Schemas.ops.TICK_SLOW, tick_data: serverTickData};
        var buffer = Schemas.tickSlowSchema.encode(tickSlowMessage);
        self.broadcast(buffer);

        // Reset queues
        self.model.food_respawn_ready_queue = [];
        self.model.food_captured_queue = [];
    };

    function logServerStatus(start) {
        var tick_time = perfNow() - start;
        self.out.tick_time_metric.add(tick_time);
        self.out.clients = self.getClientCount();
        self.out.players = self.model.getRealPlayers();
        self.out.socket_uuid_map = Object.getOwnPropertyNames(self.socket_uuid_map).length;

        self.log('Tick: ' + tick_time.toFixed(3) + ', Clients: ' + self.out.clients + ', Players: ' + self.out.players.length + ', socket_uuid_map: ' + self.out.socket_uuid_map);
    }

    var logServerStatusNth = UTIL.nth(logServerStatus, Math.floor(config.STATUS_LOG_DELAY / config.TICK_FAST_INTERVAL));

    /**
     * Main server loop for general updates to the client that should be as fast as
     * possible, eg movement and player capture.
     */
    self.serverTickFast = function appServerTickFast() {
        var start = perfNow();
        self.playerUpdates();
        self.botController.update();
        self.updatePlayerCaptures();
        self.updateActorDrains( Drain.findAll( self.model.players ) );
        self.sendActorUpdates();
        logServerStatusNth(start);
    };

    /**
     * Main server loop for general updates to the client that don't have to be
     * real-time, e.g. food respawns
     */
    self.serverTickSlow = function appServerTickSlow() {
        self.checkHeartbeats();
        self.updateFoodRespawns();
        self.playersChecks();
        self.sendServerTickData();
        Zorbio.expireLocks();
    };

    self.getClientCount = function appGetClientCount() {
        return Object.getOwnPropertyNames(self.clients).length;
    };

    /**
     * Returns the count of players based on type
     * @param type
     * @returns {number}
     */
    self.getPlayerCount = function appGetPlayerCount(type) {
        var player_count = 0;
        self.model.players.forEach(function eachPlayer(player) {
            if (player.type === type) {
                player_count++;
            }
        });
        return player_count;
    };

    self.isFull = function appIsFull() {
        return self.getClientCount() >= config.MAX_PLAYERS_PER_INSTANCE;
    };

    /**
     * Adds a bot to the game if the population is to low
     */
    self.replenishBot = function appReplenishBot() {
        // bot was captured, lets see if we need to spawn another to replace it
        if (self.model.players.length < config.MAX_BOTS) {
            var bot = self.botController.spawnBot();

            // Notify other clients that bot has joined
            self.broadcast(JSON.stringify({op: 'player_join', player: bot.player}));
        }
    };

    self.setServerMessage = function appSetServerMessage(msg) {
        self.log("Setting server message: ", msg);
        self.serverMsg = msg;
    };

    // Start game loops
    gameloop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
    gameloop.setGameLoop(self.serverTickSlow, config.TICK_SLOW_INTERVAL);

    self.botController = new BotController(self.model);

    // Spawn Bots
    for (var i = 0; i < config.MAX_BOTS; i++) {
        self.botController.spawnBot();
    }

};

if (NODEJS) module.exports = AppServer;
