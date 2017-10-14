let config        = require('../common/config.js');
let gameloop      = require('node-gameloop');
let Zorbio        = require('../common/zorbio.js');
let Validators    = require('./Validators.js');
let UTIL          = require('../common/util.js');
let Drain         = require('../common/Drain.js');
let WebSocket     = require('ws');
let BotController = require('./BotController.js');
let ServerPlayer  = require('./ServerPlayer.js');
let Schemas       = require('../common/schemas.js');
let perfNow       = require("performance-now");
let uuid          = require("node-uuid");
let cookie        = require("cookie");
let Backend       = require("./Backend.js");

/**
 * This module contains all of the app logic and state,
 * @param id
 * @param app
 * @param server_label
 * @param port
 * @constructor
 */
let AppServer = function (id, app, server_label, port) {
    //  Scope
    let self = this;

    // ID of this game instance generated by the AppProxy
    self.id = id;

    self.server_label = server_label;
    self.port = port;
    self.uuid = self.server_label + ':' + self.port + '-' + self.id;

    self.backend = new Backend();

    // Leaderboards
    self.leaders_1_day  = [];
    self.leaders_7_day  = [];
    self.leaders_30_day = [];

    self.app = app; // express

    // Game state
    self.model = new Zorbio.Model();
    self.model.init(config.WORLD_SIZE, config.FOOD_DENSITY);
    self.socket_uuid_map = {};  // Maps a player ID to a socket uuid
    self.clients = {};  // Client websockets with a uuid key
    self.serverMsg = '';

    /**
     * Status object to send to a remote data store for monitoring and analytics
     */
    self.status = {
        doctype: 'game_instance_status',
        uuid: self.uuid,
        clients: 0,
        real_player_count: 0,
        players_metrics: [],
        socket_uuid_map: 0,
        tick_time_metric: new Zorbio.Metric(50),
        au_send_metric: new Zorbio.Metric(100),
    };

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
        let propNames = Object.getOwnPropertyNames(self.clients);
        for (let i = 0, l = propNames.length; i < l; i++) {
            let socket_uuid = propNames[i];
            let ws = self.clients[socket_uuid];
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        }
    };

    /**
     * Sends a websocket message to a specific websocket by player id
     * @param player_id the id of the player ot send to
     * @param msg
     */
    self.sendToPlayer = function appSendToPlayer(player_id, msg) {
        let ws = self.clients[self.socket_uuid_map[player_id]];

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(msg);
        }
    };

    self.addClient = function appAddClient(ws, req) {
        let headers = JSON.stringify(req.headers);
        let NB_SRVID = self.parseNbSrvIdCookie(req.headers.cookie);
        let socket_uuid = uuid.v4();
        self.clients[socket_uuid] = ws;

        self.log('Client connection headers:', headers);
        self.log('Socket UUID: ', socket_uuid);

        self.sendInitGame(ws, NB_SRVID);

        // Player properties
        let currentPlayer;
        let player_id;
        let type;
        let name;
        let color;
        let skin;
        let key;

        // Pool variables for speed
        let rapidBuffer = new ArrayBuffer(20);
        let rapidView = new Float32Array(rapidBuffer);

        let player_not_in_model_count = 0;

        ws.on('message', function wsMessage(msg) {
            if (typeof msg === "string") {
                let message;

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
                // Read firs byte from buffer
                let op = msg.readUInt8(0);
                if (op === Schemas.ops.PLAYER_UPDATE) {
                    handle_msg_player_update(msg);
                }
                else if (op === Schemas.ops.LEADERBOARDS_REQUEST) {
                    handle_leaderboard_request();
                }
                else {
                    op = msg.readFloatLE(0);
                    if (op === Schemas.ops.CLIENT_POSITION_RAPID) {
                        handle_client_position_rapid(msg);
                    }
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
            let position = self.model.getSafeSpawnPosition(10);

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
            let msg = {
                0: Schemas.ops.WELCOME,
                player: currentPlayer.reduce(),
            };
            let buffer = Schemas.welcomeSchema.encode(msg);
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

                // Pass any data to the for final setup
                ws.send(JSON.stringify({op: 'game_setup'}));

                // give the client player time to load the game before notifying other players to add them
                setTimeout(function playerJoinDelay() {
                    // Notify other clients that player has joined
                    self.broadcast(JSON.stringify({op: 'player_join', player: currentPlayer}));

                    // Add the player to the model
                    self.model.addPlayer(currentPlayer, true);

                    let playerCount = self.model.players.length;
                    self.log('Player ' + currentPlayer.id + ' joined game!');
                    self.log('Total real players: ' + self.model.getRealPlayers().length);

                    // see if we need to remove a bot
                    if (self.botController.hasBots() && playerCount > config.MAX_BOTS) {
                        let bot = self.botController.removeBot();

                        // notify other players that this bot was removed
                        self.broadcast(JSON.stringify({op: 'remove_player', playerId: bot.player.id}));
                    }
                }, 200);
            }
        }

        function handle_msg_zor_ping(msg) {
            currentPlayer.lastHeartbeat = Date.now();

            // save recent pings and fps
            if (msg.lastPing >= 0) {
                currentPlayer.ping_metric.add(msg.lastPing);
            }

            currentPlayer.fps_metric.add(msg.fps);

            ws.send(JSON.stringify({op: "zor_pong"}));
        }

        function handle_client_position_rapid(buffer) {
            if (!config.ENABLE_RAPID_UPDATES) return;

            let viewIndex = 0;
            for (let bufferIndex = 0, l = buffer.length; bufferIndex < l; bufferIndex += 4) {
                rapidView[viewIndex] = buffer.readFloatLE(bufferIndex);
                viewIndex++;
            }

            let actor = self.model.getActorById(rapidView[1]);
            if (actor) {
                actor.position.set(rapidView[2], rapidView[3], rapidView[4]);
                // TODO: figure out something better that's scalable
                // self.broadcast(rapidBuffer);
            }
        }

        function handle_leaderboard_request() {
            self.sendLeaderboardsUpdate(ws);
        }

        function handle_msg_player_update(buffer) {
            if (!currentPlayer) return;

            currentPlayer.lastHeartbeat = Date.now();

            // record timing
            let nowTime = Date.now();
            let receive_gap = nowTime - currentPlayer.pp_receive_metric.last_time;
            currentPlayer.pp_receive_metric.last_time = nowTime;

            // Decode the buffer
            let msg = Schemas.playerUdateSchema.decode(buffer);

            // Save the client metrics
            currentPlayer.pp_send_metric.add(msg.pp_gap);
            currentPlayer.pp_receive_metric.add(receive_gap);
            currentPlayer.au_receive_metric.add(msg.au_gap);
            currentPlayer.buffered_amount_metric.add(msg.buffered_mount);

            // Build the validation object
            let latestPosition = msg.latest_position;
            let sphere = {
                id: msg.sphere_id,
                oldestPosition: msg.oldest_position,
                latestPosition: latestPosition,
                scale: latestPosition.radius,
            };

            // Fixes bug #145 the client may send one last position update before they are removed from the game
            let err;
            let actor = self.model.getActorById(sphere.id);
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
                        player_not_in_model_count++;
                        if (player_not_in_model_count > config.MAX_NOT_IN_MODEL_ERRORS) {
                            self.log("Player had to many not-in-model errors", player_not_in_model_count);
                            self.kickPlayer(currentPlayer.id, "Disconnected from server");
                            // self.removePlayerSocket(socket_uuid);
                        }
                        self.log("Recieved 'player_update' from player not in model!", sphere.id);
                        break;
                }
            }
        }

        function handle_close() {
            self.removePlayerSocket(socket_uuid);

            if (player_id) {
                self.log('Player connection closed for player_id:', player_id);

                // Save their score to leaderboard if they were in game and got any points
                if (currentPlayer && self.model.getPlayerById(player_id)) {
                    self.savePlayerScore(currentPlayer.name, currentPlayer.getScore());
                }

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
            if (currentPlayer.abilities.speed_boost.activate(currentPlayer)) {
                // Tell client to activate speed boost
                ws.send(JSON.stringify({op: "speed_boost_res", is_valid: true}));
            }
        }

        function handle_msg_speed_boost_stop() {
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
        let nb_srv_id = '';  // default to empty string

        if (!cookie_header) return nb_srv_id;

        try {
            let cookies = cookie.parse(cookie_header);
            //noinspection JSUnresolvedVariable
            nb_srv_id = cookies.NB_SRVID ? cookies.NB_SRVID : '';
        } catch (e) {
            return nb_srv_id;
        }

        return nb_srv_id;
    };

    self.updateActorDrains = function appUpdateActorDrains(drainers) {
        // update drains
        let drainer;
        let drainee;
        let drain_target;
        let drainee_id;
        let player_id;
        let player;
        let drain_amount;

        let i = self.model.players.length;

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
                let drainee_player = self.model.getPlayerById(drainee_id);
                drainee = drainee_player.sphere;

                // Bots can't drain eachother
                if (player.type != Zorbio.PlayerTypes.BOT || drainee_player.type != Zorbio.PlayerTypes.BOT) {
                    drain_amount = Drain.amount(drain_target.dist) * Drain.bonusAmount(drainer.scale, drainee.scale);

                    // Grow the drainer and add to their score
                    player.score += drainer.growExpected(+drain_amount);

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
        let initialModel = self.model.reduce();
        let initGameMessage = {
            0: Schemas.ops.INIT_GAME,
            NB_SRVID: NB_SRVID,
            model: initialModel,
        };
        let buffer = Schemas.initGameSchema.encode(initGameMessage);
        ws.send(buffer);
    };

    self.sendLeaderboardsUpdate = function appSendLeaderboardsUpdate(ws) {
        let responseMsg = {
            0: Schemas.ops.LEADERBOARDS_UPDATE,
            leaders_1_day: self.leaders_1_day,
            leaders_7_day: self.leaders_7_day,
            leaders_30_day: self.leaders_30_day,
        };

        let responseBuffer = Schemas.leaderboardUpdateSchema.encode( responseMsg );

        console.log("Sending leaderboards update");

        ws.send(responseBuffer);
    };

    self.sendActorUpdates = function appSendActorUpdates() {
        let tinyActors = self.model.reduceActors(true);
        let actorUpdatesMessage = {0: Schemas.ops.ACTOR_UPDATES, actors: tinyActors};
        let buffer = Schemas.actorUpdatesSchema.encode(actorUpdatesMessage);
        self.broadcast(buffer);

        // record timing
        let nowTime = Date.now();
        let send_gap = nowTime - self.status.au_send_metric.last_time;
        self.status.au_send_metric.last_time = nowTime;
        self.status.au_send_metric.add(send_gap);
    };

    self.foodCapture = function appFoodCapture (player, fi, actor, origRadius) {
        let food_value = config.FOOD_GET_VALUE(origRadius);

        let err = Validators.foodCapture(self.model, fi, actor, origRadius);

        if (!err) {
            self.model.food_respawning[fi] = config.FOOD_RESPAWN_TIME;

            // Increment the players food captures
            player.foodCaptures++;

            // grow player and add to their score
            player.score += player.sphere.growExpected( food_value );

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
        let players_array = self.model.players;
        let p1;
        let p2;
        let distance;

        let j = 0;
        let i = players_array.length;

        while (i--) {
            j = i + 1;

            p1 = players_array[i];

            while (j--) {

                if (i === j) continue; // don't compare player to itself

                // find the distance between these two players
                p2 = players_array[j];

                // See if these players are close enough for capture checking
                distance = p1.sphere.position.distanceTo(p2.sphere.position);

                // players to far apart for capture checking
                if (distance > p1.getCaptureRange() && distance > p2.getCaptureRange()) continue;

                // Check if player capture should happen between these two players
                let result = self.checkPlayerCapture(p1, p2);
                if (result) {
                    self.capturePlayer(result.attackingPlayerId, result.targetPlayerId);

                    // p1 got captured so move to the next player
                    if (result.targetPlayerId === p1.id) {
                        break;
                    }
                }
            }
        }
    };

    /**
     * Compares two players to see if a capture should occur
     * @param p1
     * @param p2
     * @returns {*} returns folse if no capture, other wise the ids of attacking and target players
     */
    self.checkPlayerCapture = function appCheckPlayerCapture(p1, p2) {
        let p1_scale;
        let p2_scale;
        let distance;
        let p1_rp = p1.sphere.recentPositions;
        let p2_rp = p2.sphere.recentPositions;

        if (p1_rp.length < 4 || p2_rp.length < 4) return; // give brand new players time to load positions

        for (let i = p1_rp.length - 4; i < p1_rp.length; i++) {
            for (let j = p2_rp.length - 4; j < p2_rp.length; j++) {
                let rp1 = p1_rp[i];
                let rp2 = p2_rp[j];

                distance = rp1.position.distanceTo(rp2.position);

                p1_scale = rp1.radius;
                p2_scale = rp2.radius;

                // if distance is less than radius of p1 and p1 larger than p2, p1 captures p2
                // if distance is less than radius of p2 and p2 larger than p1, p2 captures p1

                if (distance < (p1_scale + config.PLAYER_CAPTURE_EXTRA_TOLERANCE) && p1_scale > p2_scale) {
                    return {attackingPlayerId: p1.id, targetPlayerId: p2.id};
                }
                else if (distance < (p2_scale + config.PLAYER_CAPTURE_EXTRA_TOLERANCE) && p2_scale > p1_scale) {
                    return {attackingPlayerId: p2.id, targetPlayerId: p1.id};
                }
            }
        }

        return false;
    };

    self.capturePlayer = function appCapturePlayer(attackingPlayerId, targetPlayerId) {

        let attackingPlayer = self.model.getPlayerById(attackingPlayerId);
        let targetPlayer = self.model.getPlayerById(targetPlayerId);

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
        let attackingSphere = attackingPlayer.sphere;
        let targetSphere = targetPlayer.sphere;
        let amount = config.PLAYER_CAPTURE_VALUE( targetSphere.radius() );

        // Grow the capturing player and add to their score
        attackingPlayer.score += attackingSphere.growExpected( amount );

        if (attackingPlayer.type != Zorbio.PlayerTypes.BOT) {
            // Inform the attacking player that they captured target player
            self.sendToPlayer(attackingPlayerId, JSON.stringify({op: 'captured_player', targetPlayerId: targetPlayerId}));
        }

        if (targetPlayer.type != Zorbio.PlayerTypes.BOT) {
            // Inform the target player that they died
            let time_alive = Math.floor((Date.now() - targetPlayer.spawnTime) / 1000);
            let score = targetPlayer.getScore();
            let size = config.GET_PADDED_INT( targetSphere.scale );
            let drain_amount = config.GET_PADDED_INT( targetPlayer.drainAmount );

            const msgObj = {
                0: Schemas.ops.YOU_DIED,
                attacking_player_id: attackingPlayerId,
                food_captures: targetPlayer.foodCaptures,
                player_captures: targetPlayer.playerCaptures,
                drain_ammount: drain_amount,
                time_alive: time_alive,
                score: score,
                size: size,
            };

            let buffer = Schemas.youDied.encode(msgObj);

            // Notify the target player that they died
            self.sendToPlayer(targetPlayerId, buffer);

            // Save score to leaderboard if they got any points
            self.savePlayerScore(targetPlayer.name, score, self.clients[self.socket_uuid_map[targetPlayerId]]);
        }
        else {
            self.replenishBot();
        }

        self.removePlayerFromModel(targetPlayerId);

        // Inform other clients that target player died
        const msgObj = {op: "player_died", attackingPlayerId: attackingPlayerId, targetPlayerId: targetPlayerId};
        self.broadcast(JSON.stringify(msgObj));
    };

    self.isPlayerInGame = function appIsPlayerInGame(player_id) {
        return (self.model.getPlayerById(player_id) && self.clients[self.socket_uuid_map[player_id]]);
    };

    self.kickPlayer = function appKickPlayer(playerId, reason) {
        self.log('kicking player: ', playerId, reason);

        // notify player that they are kicked
        self.sendToPlayer(playerId, JSON.stringify({op: 'kick', reason: reason}));

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

        let time = Date.now();

        self.model.players.forEach(function checkPlayerHeartbeats(player) {
            if (player && player.type != Zorbio.PlayerTypes.BOT && player.lastHeartbeat) {
                if ((time - player.lastHeartbeat) > config.HEARTBEAT_TIMEOUT) {
                    let msg = "You were kicked because last heartbeat was over " + (config.HEARTBEAT_TIMEOUT / 1000) + " seconds ago.";
                    self.kickPlayer(player.id, msg);
                }
            }
        });
    };

    self.updateFoodRespawns = function appUpdateFoodRespawns() {
        // keep a current reference of which food indexes are respawning
        self.model.food_respawning_indexes = [];

        for (let i = 0, l = self.model.food_respawning.length; i < l; ++i) {
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
            let id = player.id;

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
            let score = player.getScore();
            let leader = {
                player_id: id,
                score: score,
            };
            UTIL.sortedObjectPush(self.model.leaders, leader, 'score');
        });

        // Prepare leaders array
        self.model.leaders.reverse();  // reverse for descending order
    };

    /**
     * Send any updates to client per server tick
     */
    self.sendServerTickData = function appSendServerTickData() {
        let serverTickData = {
            fr: self.model.food_respawn_ready_queue,
            fc: self.model.food_captured_queue,
            sm: self.serverMsg,
            leaders: self.model.leaders,
        };

        let tickSlowMessage = {0: Schemas.ops.TICK_SLOW, tick_data: serverTickData};
        let buffer = Schemas.tickSlowSchema.encode(tickSlowMessage);
        self.broadcast(buffer);

        // Reset queues
        self.model.food_respawn_ready_queue = [];
        self.model.food_captured_queue = [];
    };

    function logServerStatus(start) {
        let tick_time = perfNow() - start;
        let realPlayers = self.model.getRealPlayers();

        self.status.real_player_count = realPlayers.length;
        self.status.players_metrics = [];
        self.status.tick_time_metric.add(tick_time);
        self.status.clients = self.getClientCount();
        self.status.socket_uuid_map = Object.getOwnPropertyNames(self.socket_uuid_map).length;

        for (let i = 0, l = realPlayers.length; i < l; i++) {
            self.status.players_metrics.push( realPlayers[i].getMetrics() );
        }

        // Save game status to remote data store
        // self.backend.saveGameInstanceStatus(self.uuid, self.status);

        self.log('Tick: ' + tick_time.toFixed(3) +
            ', Clients: ' + self.status.clients +
            ', Players: ' + self.status.real_player_count +
            ', socket_uuid_map: ' + self.status.socket_uuid_map);
    }
    self.logServerStatusNth = UTIL.nth(logServerStatus, Math.floor(config.STATUS_LOG_DELAY / config.TICK_FAST_INTERVAL));

    /**
     * Main server loop for general updates to the client that should be as fast as
     * possible, eg movement and player capture.
     */
    self.serverTickFast = function appServerTickFast() {
        let start = perfNow();
        self.playerUpdates();
        self.botController.update();
        self.updatePlayerCaptures();
        self.updateActorDrains( Drain.findAll( self.model.players ) );
        self.sendActorUpdates();
        self.logServerStatusNth(start);
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
        let player_count = 0;
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
            let bot = self.botController.spawnBot();

            // Notify other clients that bot has joined
            self.broadcast(JSON.stringify({op: 'player_join', player: bot.player}));
        }
    };

    self.setServerMessage = function appSetServerMessage(msg) {
        self.log("Setting server message: ", msg);
        self.serverMsg = msg;
    };

    self.botController = new BotController(self.model);

    // Start game loops
    gameloop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
    gameloop.setGameLoop(self.serverTickSlow, config.TICK_SLOW_INTERVAL);

    // Spawn Bots
    for (let i = 0; i < config.MAX_BOTS; i++) {
        self.botController.spawnBot();
    }

    self.savePlayerScore = function appSavePlayerScore(name, score, ws) {
        ws = ws || false;

        if (score > config.INITIAL_PLAYER_SCORE) {
            self.backend.saveScore('zorbio', name, score, function saveScoreCallback() {
                if (self.isNewHighScore(name, score)) {
                    // Player score made it on the leaderboard so refresh and send a leaderboard update
                    self.refreshLeaderboards(function leaderSuccessCallback() {
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            self.sendLeaderboardsUpdate(ws);
                        }
                    });
                }
            });
        }
    };

    self.isNewHighScore = function appIsNewHIghScore(name, score) {
        let allLeaderboards = [].concat(self.leaders_1_day, self.leaders_7_day, self.leaders_30_day);
        let isHighScore = false;
        let foundIndex = _.findIndex(allLeaderboards, ['name', name]);

        if (foundIndex >= 0) {
            // Username already has a high score, see if this one is greater
            if (score > allLeaderboards[foundIndex].score) {
                isHighScore = true;
            }
        }
        else {
            // New username see if it's greater than the smallest high score
            allLeaderboards = _.sortBy(allLeaderboards, ['score']);

            if (score > allLeaderboards[0].score) {
                isHighScore = true;
            }
        }

        return isHighScore;
    };

    self.refreshLeaderboards = function appRefreshLeaderboards(successCallback) {
        // Get leaderboards from backend
        self.backend.getLeadersByDate('zorbio', config.LEADERBOARD_LENGTH, 'today', 'now', function todayLeaders(leaders, success) {
            if (leaders && leaders.length > 0) self.leaders_1_day = leaders;
            console.log("Retrieved 1 day leaderboard successfully?", success, self.leaders_1_day.length);

            self.backend.getLeadersByDate('zorbio', config.LEADERBOARD_LENGTH, '-7 days', 'now', function sevenDayLeaders(leaders, success) {
                if (leaders && leaders.length > 0) self.leaders_7_day = leaders;
                console.log("Retrieved 7 day leaderboard successfully?", success, self.leaders_7_day.length);

                self.backend.getLeadersByDate('zorbio', config.LEADERBOARD_LENGTH, '-30 days', 'now', function sevenDayLeaders(leaders, success) {
                    if (leaders && leaders.length > 0) self.leaders_30_day = leaders;
                    console.log("Retrieved 30 day leaderboard successfully?", success, self.leaders_30_day.length);

                    if (typeof successCallback === 'function') {
                        // success call back once all leaderboards are refreshed
                        successCallback();
                    }
                });
            });
        });
    };

    // Load leaderboards on server start up
    self.refreshLeaderboards();

    // Keep leaderboards refreshed on an interval
    gameloop.setGameLoop(self.refreshLeaderboards, config.LEADERBOARD_REFRESH_INTERVAL);
};

module.exports = AppServer;
