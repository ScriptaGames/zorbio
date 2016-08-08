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
    self.model = new Zorbio.Model(config.WORLD_SIZE, config.FOOD_DENSITY);
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

                if (self.model.players[currentPlayer.id]) {
                    // if current player is already in the players remove them
                    delete self.model.players[currentPlayer.id];
                }

                // Add the player to the players object
                self.model.players[currentPlayer.id] = currentPlayer;

                self.model.addActor(currentPlayer.sphere);

                // Pass any data to the for final setup
                ws.send(JSON.stringify({op: 'game_setup'}));

                // Notify other clients that player has joined
                var msgObj = JSON.stringify({op: 'player_join', player: currentPlayer});
                setTimeout(self.wss.broadcast, 2000, msgObj);  // give player time to load the game

                var playerCount = Object.getOwnPropertyNames(self.model.players).length;
                console.log('Player ' + currentPlayer.id + ' joined game!');
                console.log('Total players: ' + playerCount);

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

            var nowTime = Date.now();
            var receive_gap = nowTime - currentPlayer.pp_receive_metric.last_time;
            currentPlayer.pp_receive_metric.last_time = nowTime;

            // Read binary data
            var bufArr  = new ArrayBuffer(buffer.length);
            var bufView = new Float32Array(bufArr);
            var viewIndex = 0;
            for (var bufferIndex = 0, l = buffer.length; bufferIndex < l; bufferIndex = bufferIndex + 4) {
                bufView[viewIndex] = buffer.readFloatLE(bufferIndex);
                viewIndex++;
            }

            // Pull out the data
            var index     = 0;
            var sphere_id = bufView[index++];
            var gap       = bufView[index++];
            var au_gap    = bufView[index++];
            var ba        = bufView[index++];
            var old_x     = bufView[index++];
            var old_y     = bufView[index++];
            var old_z     = bufView[index++];
            var old_r     = bufView[index++];
            var old_t     = bufView[index++];
            var prev_3_x  = bufView[index++];
            var prev_3_y  = bufView[index++];
            var prev_3_z  = bufView[index++];
            var prev_3_r  = bufView[index++];
            var prev_3_t  = bufView[index++];
            var prev_2_x  = bufView[index++];
            var prev_2_y  = bufView[index++];
            var prev_2_z  = bufView[index++];
            var prev_2_r  = bufView[index++];
            var prev_2_t  = bufView[index++];
            var prev_1_x  = bufView[index++];
            var prev_1_y  = bufView[index++];
            var prev_1_z  = bufView[index++];
            var prev_1_r  = bufView[index++];
            var prev_1_t  = bufView[index++];
            var new_x     = bufView[index++];
            var new_y     = bufView[index++];
            var new_z     = bufView[index++];
            var new_r     = bufView[index++];
            var new_t     = bufView[index];

            // Save the client metrics
            currentPlayer.pp_send_metric.add(gap);
            currentPlayer.pp_receive_metric.add(receive_gap);
            currentPlayer.au_receive_metric.add(au_gap);
            currentPlayer.buffered_amount_metric.add(ba);

            // Build the sphere object
            var oldestPosition = {position: {x: old_x, y: old_y, z: old_z}, radius: old_r, time: old_t};
            var latestPosition = {position: {x: new_x, y: new_y, z: new_z}, radius: new_r, time: new_t};
            var sphere = {id: sphere_id, oldestPosition: oldestPosition, latestPosition: latestPosition, "scale": new_r};

            // Fixes bug #145 the client may send one last position update before they are removed from the game
            var err;
            var actor = self.model.actors[sphere.id];
            if (!actor) {
                err = Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
            } else {
                err = Validators.movementSampled(sphere, actor, self.model);
            }

            if (!err) {
                // update the players position in the model
                actor.position.set( latestPosition.position.x, latestPosition.position.y, latestPosition.position.z);

                // Recent positions
                actor.pushRecentPosition({position: new THREE.Vector3(prev_3_x, prev_3_y, prev_3_z), radius: prev_3_r, time: prev_3_t});
                actor.pushRecentPosition({position: new THREE.Vector3(prev_2_x, prev_2_y, prev_2_z), radius: prev_2_r, time: prev_2_t});
                actor.pushRecentPosition({position: new THREE.Vector3(prev_1_x, prev_1_y, prev_1_z), radius: prev_1_r, time: prev_1_t});
                actor.pushRecentPosition({position: actor.position, radius: actor.scale, time: latestPosition.time});

                // Pull out the food captures if there are any
                var foodCapLength = bufView.length - config.BIN_PP_POSITIONS_LENGTH;
                if (foodCapLength > 1 && (foodCapLength % 2 === 0)) { // prevent buffer overflow
                    // Iterate over food capture fi, radius pairs
                    for (var i = config.BIN_PP_POSITIONS_LENGTH; i < bufView.length; i += 2) {
                        var fi         = bufView[ i ];
                        var origRadius = bufView[ i + 1 ];

                        self.foodCapture(currentPlayer, fi, actor, origRadius);
                    }
                }
            } else {
                switch (err) {
                    case Validators.ErrorCodes.SPEED_TO_FAST:
                        ws.send(JSON.stringify({op: 'speeding_warning'}));
                        self.model.players[currentPlayer.id].infractions_speed++;
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

        var player_ids = Object.getOwnPropertyNames(self.model.players);
        var drainer;
        var drainee;
        var drain_target;
        var drainee_id;
        var player_id;
        var player;
        var drain_amount;

        var i = player_ids.length;

        // iterate over players and set their drain targets
        while ( i-- ) {
            player_id = player_ids[i];
            player = self.model.players[player_id];
            drainer = player.sphere;
            drainer.drain_target_id = 0;  // reset

            drain_target = drainers[player_id][0];

            if (drain_target && drain_target.id > 0) {

                drainee_id = drain_target.id;

                drainer.drain_target_id = drainee_id;
                var drainee_player = self.model.players[drainee_id];
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
        var playerIds = Object.getOwnPropertyNames(self.model.players);
        for (var i = 0, l = playerIds.length; i < l; i++) {
            var id = +playerIds[i];  // make sure id is a number
            var player = self.model.players[id];
            player.update();
        }
    };

    self.sendInitGame = function appSendInitGame(ws) {
        // Send the bare minimum to init the game on the client
        var initialModel = {
            actors: {},
            food: self.model.food,
            foodCount: self.model.foodCount,
            foodDensity: self.model.foodDensity,
            food_respawning: self.model.food_respawning,
            food_respawn_ready_queue: self.model.food_respawn_ready_queue,
            food_respawning_indexes: self.model.food_respawning_indexes,
            leaders: self.model.leaders,
            players: self.model.players,
            worldSize: self.model.worldSize,
        };

        // iterate over actors and reduce them
        var actorIds = Object.getOwnPropertyNames(self.model.actors);
        for (var i = 0, l = actorIds.length; i < l; i++) {
            var actorId = +actorIds[i];  // make sure id is a number
            var actor = self.model.actors[actorId];
            initialModel.actors[actorId] = actor.reduce();
        }

        ws.send(JSON.stringify({op: 'init_game', model: initialModel}));
    };

    self.sendActorUpdates = function appSendActorUpdates() {
        var actorIds = Object.getOwnPropertyNames(self.model.actors);
        if (actorIds.length === 0) return;  // nothing to do if there's no actors

        const NUM_ACTORS = actorIds.length;
        const ACTOR_PARTS = 7;

        var bufferView = new Float32Array(ACTOR_PARTS * NUM_ACTORS);

        var id;
        var actor;
        var position;

        var drainers = Drain.findAll( self.model.players );
        self.updateActorDrains( drainers );

        // Iterate over all actors. Make the payload as small as possible, send only what's needed on the client
        var offset = 0;
        for (var i = 0, l = NUM_ACTORS; i < l; ++i) {
            id = +actorIds[i];  // make sure id is a number
            actor = self.model.actors[id];
            position = actor.position;

            // update actor data

            bufferView[ offset ] = id;
            bufferView[ offset + 1 ] = position.x;
            bufferView[ offset + 2 ] = position.y;
            bufferView[ offset + 3 ] = position.z;
            bufferView[ offset + 4 ] = actor.scale;
            bufferView[ offset + 5 ] = actor.drain_target_id;
            bufferView[ offset + 6 ] = actor.speed_boosting ? 1 : 0;

            offset += ACTOR_PARTS;
        }

        // Send actors updates to all clients
        self.wss.broadcast(bufferView.buffer, {binary: true, mask: true});
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
                    self.model.players[player.id].infractions_food++;
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
        var players_array = _.values(self.model.players);
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

        var attackingPlayer = self.model.players[attackingPlayerId];
        var targetPlayer = self.model.players[targetPlayerId];

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
        return (self.model.players[player_id] && self.sockets[player_id]);
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
        var actorId = 0;
        if (self.model.players[playerId]) {
            // remove player from model
            actorId = self.model.players[playerId].sphere.id;
            delete self.model.players[playerId];
        }
        if (self.model.actors[actorId]) {
            delete self.model.actors[actorId];
        }
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

        var playerIds = Object.getOwnPropertyNames(self.model.players);
        for (var i = 0, l = playerIds.length; i < l; i++) {
            var id = +playerIds[i];  // make sure id is a number
            var player = self.model.players[id];
            if (player && player.type != Zorbio.PlayerTypes.BOT && player.lastHeartbeat) {
                if ((time - player.lastHeartbeat) > config.HEARTBEAT_TIMEOUT) {
                    var msg = "You were kicked because last heartbeat was over " + (config.HEARTBEAT_TIMEOUT / 1000) + " seconds ago.";
                    self.kickPlayer(id, msg);
                }
            }
        }
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
        var playerIds = Object.getOwnPropertyNames(self.model.players);
        for (var i = 0, l = playerIds.length; i < l; i++) {
            var id = +playerIds[i];  // make sure id is a number
            var player = self.model.players[id];

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
        }

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
        var playerIds = Object.getOwnPropertyNames(self.model.players);
        if (playerIds.length < config.MAX_BOTS) {
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
