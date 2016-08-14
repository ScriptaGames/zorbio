var NODEJS = typeof module !== 'undefined' && module.exports;

var config        = require('../common/config.js');
var pjson         = require('../package.json');
var request       = require('request');
var gameloop      = require('node-gameloop');
var _             = require('lodash');
var Zorbio        = require('../common/zorbio.js');
var Validators    = require('./Validators.js');
var ZorApi        = require('./ZorApi.js');
var UTIL          = require('../common/util.js');
var Drain         = require('../common/Drain.js');
var WebSocket     = require('ws');
var BotController = require('./BotController.js');
var ServerPlayer  = require('./ServerPlayer.js');
var Schemas       = require('../common/schemas.js');
var sp            = require('schemapack');

/**
 * This module contains all of the app logic and state,
 * @param wss
 * @param app
 * @constructor
 */
var AppServer = function (wss, app) {
    //  Scope
    var self = this;

    self.wss = wss;
    self.wss.broadcast = function broadcast(data) {
        self.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    };

    self.app = app; // express

    // Game state
    self.model = new Zorbio.Model();
    self.model.init(config.WORLD_SIZE, config.FOOD_DENSITY);
    self.sockets = {};
    self.serverRestartMsg = '';

    // Api
    self.api = new ZorApi(self.app, self.model, self.sockets);

    self.wss.on('connection', function wssConnection(ws) {
        var headers = ws.upgradeReq.headers;

        console.log('Client connection headers:', JSON.stringify(headers));

        self.sendInitGame(ws);

        // Player properties
        var currentPlayer;
        var player_id;
        var type;
        var name;
        var color;
        var key;

        ws.on('message', function wsMessage(msg) {
            if (typeof msg === "string") {
                var message = JSON.parse(msg);

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
                // Route binary message
                handle_msg_player_update(msg);
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
            key   = msg.key;

            // Sanitize player name
            if (UTIL.isBlank(name)) {
                name = "Player_" + player_id;
            }
            else if (name.length > config.MAX_PLAYER_NAME_LENGTH) {
                name = name.substr(0, config.MAX_PLAYER_NAME_LENGTH);
            }

            console.log("Player enter request: ", player_id, type, name, color, key);

            // spawn the player
            handle_msg_respawn();
        }

        function handle_msg_respawn() {
            var position = UTIL.safePlayerPosition();

            if (currentPlayer && self.isPlayerInGame(currentPlayer.id)) {
                // make sure this player isn't already connected and playing
                console.log("Respawn error: Player is already in game");
                self.kickPlayer(currentPlayer.id, "Forced respawn.");
                return;
            }

            // Create the Player
            currentPlayer = new ServerPlayer(player_id, name, color, type, position, ws);
            currentPlayer.headers = headers;

            ws.send(JSON.stringify({op: 'welcome', currentPlayer: currentPlayer}));

            console.log('User ' + currentPlayer.id + ' spawning into the game');
        }

        function handle_msg_player_ready() {
            console.log('Player ' + currentPlayer.id + ' client ready');

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
                self.sockets[currentPlayer.id] = ws;
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
                    self.wss.broadcast(JSON.stringify({op: 'player_join', player: currentPlayer}));

                    // Add the player to the model
                    self.model.players.push(currentPlayer);
                    self.model.addActor(currentPlayer.sphere);

                    var playerCount = self.model.players.length;
                    console.log('Player ' + currentPlayer.id + ' joined game!');
                    console.log('Total players: ' + playerCount);
                }, 200);


                // see if we need to remove a bot
                if (self.botController.hasBots() && playerCount > config.MAX_BOTS) {
                    var bot = self.botController.removeBot();

                    // notify other players that this bot was removed
                    self.wss.broadcast(JSON.stringify({op: 'remove_player', playerId: bot.player.id}));
                }
            }
        }

        function handle_msg_zor_ping(msg) {
            currentPlayer.lastHeartbeat = Date.now();

            // save recent pings and fps
            currentPlayer.ping_metric.add(msg.lastPing);
            currentPlayer.fps_metric.add(msg.fps);

            ws.send(JSON.stringify({op: "zor_pong"}));
        }

        function handle_msg_player_update(buffer) {
            if (currentPlayer) currentPlayer.lastHeartbeat = Date.now();

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
                        console.log("Recieved 'player_update' from player not in model!", sphere.id);
                        break;
                }
            }
        }

        function handle_close() {
            console.log('Player connection closed for player_id:', player_id);

            // notify other clients to remove this player
            self.wss.broadcast(JSON.stringify({op: 'remove_player', playerId: player_id}));

            self.removePlayerFromModel(player_id);
            self.removePlayerSocket(player_id);

            self.replenishBot();
        }

        function handle_msg_speed_boost_start() {
            console.log("Speed boost request received for player: ", currentPlayer.id);

            if (currentPlayer.abilities.speed_boost.activate(currentPlayer)) {

                console.log("Speed boost START for player: ", currentPlayer.id);

                // Tell client to activate speed boost
                ws.send(JSON.stringify({op: "speed_boost_res", is_valid: true}));

            }
        }

        function handle_msg_speed_boost_stop() {
            console.log("Speed boost STOP for player: ", currentPlayer.id);

            currentPlayer.abilities.speed_boost.deactivate();
        }
    });

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

    self.sendInitGame = function appSendInitGame(ws) {
        var initialModel = self.model.reduce();
        var initGameMessage = {0: Schemas.ops.INIT_GAME, model: initialModel};
        var buffer = Schemas.initGameSchema.encode(initGameMessage);
        ws.send(buffer);
    };

    self.sendActorUpdates = function appSendActorUpdates() {
        var actors = self.model.reduceActors();
        var actorUpdatesMessage = {0: Schemas.ops.ACTOR_UPDATES, actors: actors};
        var buffer = Schemas.actorUpdatesSchema.encode(actorUpdatesMessage);
        self.wss.broadcast(buffer);
    };

    self.foodCapture = function appFoodCapture (player, fi, actor, origRadius) {
        //TODO: Refactor this to use the current radius of the player on the server not what is sent from the client
        var food_value = config.FOOD_GET_VALUE(origRadius);

        var err = Validators.foodCapture(self.model, fi, actor, origRadius);

        if (!err) {
            self.model.food_respawning[fi] = config.FOOD_RESPAWN_TIME;

            // Increment the players food captures
            player.foodCaptures++;

            // grow player on the server to track growth validation
            player.sphere.growExpected( food_value );

            // notify clients of food capture so they can update their food view
            // TODO: queue this into the actorUpdate message from the server
            self.wss.broadcast(JSON.stringify({op: 'food_captured', fi: fi}));
        } else {
            switch (err) {
                case Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR:
                    // inform client of invalid capture, and make them shrink, mark infraction
                    self.model.getPlayerById(player.id).infractions_food++;
                    break;
                case Validators.ErrorCodes.PLAYER_NOT_IN_MODEL:
                    console.log("Recieved 'foodCapture' from player not in model!", actor.id);
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
            console.log("ERROR: player capture attacking or target player undefined.");
            return;
        }

        if (attackingPlayer.type === Zorbio.PlayerTypes.BOT && targetPlayer.type === Zorbio.PlayerTypes.BOT) {
            // Don't allow bots to capture each other
            return;
        }

        console.log("Capture player: ", attackingPlayerId, targetPlayerId);

        // Increment player captures for the attacking player
        attackingPlayer.playerCaptures++;

        // grow the attacking player the expected amount
        var attackingSphere = attackingPlayer.sphere;
        var targetSphere = targetPlayer.sphere;
        attackingSphere.growExpected( config.PLAYER_CAPTURE_VALUE( targetSphere.radius() ) );

        if (attackingPlayer.type != Zorbio.PlayerTypes.BOT) {
            // Inform the attacking player that they captured target player
            self.sockets[attackingPlayerId].send(JSON.stringify({op: 'captured_player', targetPlayerId: targetPlayerId}));
        }

        self.removePlayerFromModel(targetPlayerId);

        if (targetPlayer.type != Zorbio.PlayerTypes.BOT) {
            // Inform the target player that they died
            targetPlayer.deathTime = Date.now();
            targetPlayer.score = config.PLAYER_GET_SCORE( targetPlayer.sphere.scale );
            var msgObj = {op: 'you_died', attackingPlayerId: attackingPlayerId, targetPlayer: targetPlayer};
            self.sockets[targetPlayerId].send(JSON.stringify(msgObj));
        }
        else {
            self.replenishBot();
        }

        // Inform other clients that target player died
        msgObj = {op: "player_died", attackingPlayerId: attackingPlayerId, targetPlayerId: targetPlayerId};
        self.wss.broadcast(JSON.stringify(msgObj));
    };

    self.isPlayerInGame = function appIsPlayerInGame(player_id) {
        return (self.model.getPlayerById(player_id) && self.sockets[player_id]);
    };

    self.kickPlayer = function appKickPlayer(playerId, reason) {
        console.log('kicking player: ', playerId, reason);

        // notify player
        if (self.sockets[playerId]) {
            self.sockets[playerId].send(JSON.stringify({op: 'kick', reason: reason}));
        }

        // notify other clients
        self.wss.broadcast(JSON.stringify({op: 'remove_player', playerId: playerId}));

        self.removePlayerFromModel(playerId);
    };

    self.removePlayerFromModel = function appRemovePlayerFromModel(playerId) {
        self.model.removePlayer(playerId);
        console.log('Removed player:', playerId);
    };

    self.removePlayerSocket = function appRemovePlayerSocket(playerId) {
        if (self.sockets[playerId]) {
            if (self.sockets[playerId].readyState === WebSocket.OPEN) {
                self.sockets[playerId].close();
            }
            delete self.sockets[playerId];
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
                console.log("INFRACTION: Player reached food infraction tolerance:", id, player.infractions_food, config.INFRACTION_TOLERANCE_FOOD);
                player.infractions_food = 0;
            }
            else if (player.infractions_pcap > config.INFRACTION_TOLERANCE_PCAP) {
                console.log("INFRACTION: Player reached player capture infraction tolerance:", id, player.infractions_pcap, config.INFRACTION_TOLERANCE_PCAP);
                player.infractions_pcap = 0;
            }
            else if (player.infractions_speed > config.INFRACTION_TOLERANCE_SPEED) {
                self.kickPlayer(id, "You were removed because you had too many speed infractions.");
            }
            else if (player.infractions_scale > config.INFRACTION_TOLERANCE_SCALE) {
                console.log("INFRACTION: Player reached scale infraction tolerance:", id, player.infractions_scale, config.INFRACTION_TOLERANCE_SCALE);
                player.infractions_scale = 0;
            }

            // Add players to leaders array in sorted order by score
            var score = player.getScore();
            var leader = {
                name: player.name,
                score: score,
                color: player.sphere.color
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
        var serverTickData = {
            "fr": self.model.food_respawn_ready_queue,
            "sm": self.serverRestartMsg,
            "leaders": self.model.leaders
        };
        self.wss.broadcast(JSON.stringify({op: 'server_tick_slow', serverTickData: serverTickData}));
        self.model.food_respawn_ready_queue = [];
    };

    /**
     * Main server loop for general updates to the client that should be as fast as
     * possible, eg movement and player capture.
     */
    self.serverTickFast = function appServerTickFast() {
        self.playerUpdates();
        self.botController.update();
        self.updatePlayerCaptures();
        self.updateActorDrains( Drain.findAll( self.model.players ) );
        self.sendActorUpdates();
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

    self.versionCheck = function appVersionCheck() {
        var options = {
            url: 'https://zoruser:wk-4<a<9ASW!J{ae@mcp.zor.bio/zapi/version',
            agentOptions: {
                rejectUnauthorized: false
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var res = JSON.parse(body);

                if (pjson.version !== res.version || pjson.build !== res.build) {
                    console.log("version out of date, old version:", pjson.version, pjson.build);
                    console.log("version out of date, new version:", res.version, res.build);
                    self.serverRestartMsg = "Server restart imminent!";
                }
            }
        })
    };


    /**
     * Adds a bot to the game if the population is to low
     */
    self.replenishBot = function appReplenishBot() {
        // bot was captured, lets see if we need to spawn another to replace it
        if (self.model.players.length < config.MAX_BOTS) {
            var bot = self.botController.spawnBot();

            // Notify other clients that bot has joined
            self.wss.broadcast(JSON.stringify({op: 'player_join', player: bot.player}));
        }
    };

    // Start game loops
    gameloop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
    gameloop.setGameLoop(self.serverTickSlow, config.TICK_SLOW_INTERVAL);

    if (config.CHECK_VERSION) {
        gameloop.setGameLoop(self.versionCheck, config.CHECK_VERSION_INTERVAL);
    }


    self.botController = new BotController(self.model);

    // Spawn Bots
    for (var i = 0; i < config.MAX_BOTS; i++) {
        self.botController.spawnBot();
    }

};

if (NODEJS) module.exports = AppServer;
