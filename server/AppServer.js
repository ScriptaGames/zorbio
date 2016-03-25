var NODEJS = typeof module !== 'undefined' && module.exports;

var URL        = require('url');
var config     = require('../common/config.js');
var request    = require('request');
var gameloop   = require('node-gameloop');
var _          = require('lodash');
var Zorbio     = require('../common/zorbio.js');
var Validators = require('./Validators.js');
var UTIL       = require('../common/util.js');
var Drain      = require('../common/Drain.js');

/**
 * This module contains all of the app logic and state,
 * @param wss
 * @constructor
 */
var AppServer = function (wss) {
    //  Scope
    var self = this;

    self.wss = wss;
    self.wss.broadcast = function broadcast(data) {
        self.wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    // Game state
    self.model = new Zorbio.Model(config.WORLD_SIZE, config.FOOD_DENSITY);
    self.sockets = {};
    self.serverRestartMsg = '';


    self.wss.on('connection', function wssConnection(ws) {
        var headers = ws.upgradeReq.headers;

        console.log('Client connection headers:', JSON.stringify(headers));

        // parse query string
        var queryString = URL.parse(ws.upgradeReq.url, true).query;

        // Handle new connection
        var player_id = Zorbio.IdGenerator.get_next_id();
        var type  = queryString.type;
        var name  = queryString.name;
        var color = queryString.color;
        var key   = queryString.key;

        // Sanitize player name
        if (UTIL.isBlank(name)) {
            name = "Player_" + player_id;
        }
        else if (name.length > config.MAX_PLAYER_NAME_LENGTH) {
            name = name.substr(0, config.MAX_PLAYER_NAME_LENGTH);
        }

        var currentPlayer;

        console.log("player_id, type, name, color, key", player_id, type, name, color, key);

        self.wss.broadcast(JSON.stringify("Client joined"));

        ws.on('message', function wsMessage(msg, flags) {
            if (flags.binary) {
                // Route binary message
                handle_msg_player_update(msg)
            }
            else {
                console.log(msg);

                var message = JSON.parse(msg);

                switch (message.op) {
                    case 'respawn':
                        handle_msg_respawn(message);
                        break;
                    case 'player_ready':
                        handle_msg_player_ready(message);
                        break;
                    case 'player_in_game':
                        handle_msg_player_in_game();
                        break;
                    case 'zor_ping':
                        handle_msg_zor_ping(message);
                        break;
                }
            }
        });

        ws.on('close', function wsClose() {
            self.wss.broadcast(JSON.stringify("Client left"));
            console.log('Client connection closed');
        });

        function handle_msg_respawn(msg) {
            var position = UTIL.safePlayerPosition();

            if (currentPlayer && self.isPlayerInGame(currentPlayer.id)) {
                // make sure this player isn't already connected and playing
                console.log("Respawn error: Player is already in game");
                self.kickPlayer(currentPlayer.id, "Forced respawn.");
                return;
            }

            // Create the Player
            currentPlayer = new Zorbio.Player(player_id, name, color, type, position);
            currentPlayer.headers = headers;

            ws.send(JSON.stringify({op: 'welcome', currentPlayer: currentPlayer, isFirstSpawn: msg.isFirstSpawn}));

            console.log('User ' + currentPlayer.id + ' spawning into the game');
        }

        function handle_msg_player_ready(msg) {
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
                ws.send(JSON.stringify({op: 'game_setup', model: self.model, isFirstSpawn: msg.isFirstSpawn}));

                console.log('Player loading game');
            }
        }

        function handle_msg_player_in_game() {
            // Notify other clients that player has joined
            self.wss.broadcast(JSON.stringify({op: 'player_join', player: currentPlayer}));
            console.log('Player ' + currentPlayer.id + ' joined game!');
            console.log('Total players: ' + Object.getOwnPropertyNames(self.model.players).length);
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
            for (var bufferIndex = 0, l = buffer.length; bufferIndex < l; bufferIndex = bufferIndex + 4)            {
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
                actor.recentPositions.push({position: actor.position, radius: actor.scale, time: latestPosition.time});
                if (actor.recentPositions.length > config.PLAYER_POSITIONS_WINDOW) {
                    actor.recentPositions.shift();  // remove the oldest position
                }

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

                // validate the new scale
                if (Validators.playerSphereScale(actor) === Validators.ErrorCodes.PLAYER_SCALE_TO_BIG) {
                    // Adjust scale to what the server expects it to be, and mark it for update
                    actor.scale = actor.expectedScale;
                    actor.serverAdjust = 1;
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
    });

    self.updateActorDrains = function appUpdateActorDrains( model, drainers ) {
        // update drains

        var drainer_ids = Object.getOwnPropertyNames(drainers);
        var drainees;
        var drainer;
        var drainee;
        var drainee_id;
        var drainer_id;
        var drain_amount;

        var i = drainer_ids.length;
        var j;

        while ( i-- ) {
            drainer_id = drainer_ids[i];
            drainees = drainers[drainer_id];
            j = drainees.length;
            while ( j-- ) {
                drainee_id = drainees[j].id;

                drainer = model.actors[drainer_id];
                drainee = model.actors[drainee_id];

                drain_amount = Drain.amount( drainees[j].dist );

                drainer.growExpected( +drain_amount );
                drainee.growExpected( -drain_amount );

                // if the drain caused the drainer to get bigger than the drainer,
                // correct so that they're the same size.  drain shouldn't be able
                // to make a player larger than another because it leads to
                // infinite back and forth draining.
                if (drainer.scale > drainee.scale) {
                    drainer.scale = drainee.scale = ( drainer.scale + drainee.scale ) / 2;
                }
            }
        }
    };

    self.sendActorUpdates = function appSendActorUpdates() {
        var actorIds = Object.getOwnPropertyNames(self.model.actors);
        if (actorIds.length === 0) return;  // nothing to do if there's no actors

        const NUM_PLAYERS = actorIds.length;

        const ACTOR_PARTS = 6;
        const ACTORS_ARRAY_LENGTH = ACTOR_PARTS * 32;

        // for each player, save the id's of each player they are draining.  the
        // space for those id's is one byte per other player.  for example, if
        // MAX_PLAYERS is 50, drain array size will be 49 bytes.
        const DRAIN_ARRAY_LENGTH = config.MAX_PLAYERS - 1;

        const PLAYER_ARRAY_LENGTH = UTIL.fourPad( ACTORS_ARRAY_LENGTH + DRAIN_ARRAY_LENGTH );

        var buffer = new ArrayBuffer(PLAYER_ARRAY_LENGTH * NUM_PLAYERS);

        var actorsArray;
        var drainArray;
        var id;
        var actor;
        var position;
        var di;  // drain index
        var did; // drain id

        var drainers = Drain.findAll( self.model.players );
        self.updateActorDrains( self.model, drainers );

        // make the payload as small as possible, send only what's needed on the client
        var offset = 0;
        var i = actorIds.length;
        while( i-- ) {
            id = +actorIds[i];  // make sure id is a number
            actor = self.model.actors[id];
            position = actor.position;

            actorsArray = new Float32Array(buffer, offset, ACTOR_PARTS);
            drainArray  = new Uint8Array(buffer, offset + ACTORS_ARRAY_LENGTH, DRAIN_ARRAY_LENGTH);

            // update actor data

            actorsArray[0] = id;
            actorsArray[1] = position.x;
            actorsArray[2] = position.y;
            actorsArray[3] = position.z;
            actorsArray[4] = actor.scale;
            actorsArray[5] = actor.serverAdjust;

            actor.serverAdjust = 0;

            // update active drains

            di = drainArray.length;
            while ( di-- ) {
                did = drainers[id][di];
                drainArray[di] = (did && did.id) || 0;
            }

            offset += PLAYER_ARRAY_LENGTH;
        }

        // Send actors updates to all clients
        self.wss.broadcast(buffer, {binary: true, mask: true});
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

    self.checkPlayerCaptures = function appCheckPlayerCaptures()  {
        var players_array = _.values( self.model.players );
        var p1;
        var p2;
        var p1_scale;
        var p2_scale;
        var distance;

        var j = 0;
        var i = players_array.length;

        while ( i-- ) {
            j = i + 1;

            p1 = players_array[i];

            while ( j-- ) {

                if (i === j) continue; // don't compare player to itself

                // find the distance between these two players
                p2 = players_array[j];
                distance = p1.sphere.position.distanceTo( p2.sphere.position );

                p1_scale = p1.sphere.scale;
                p2_scale = p2.sphere.scale;

                // if distance is less than radius of p1 and p1 larger than p2, p1 captures p2
                // if distance is less than radius of p2 and p2 larger than p1, p2 captures p1

                if ( distance < p1_scale && p1_scale > p2_scale ) {
                    self.capturePlayer( p1.id, p2.id );
                }
                else if ( distance < p2_scale && p2_scale > p1_scale ) {
                    self.capturePlayer( p2.id, p1.id );
                }

            }
        }
    };

    self.capturePlayer = function appCapturePlayer(attackingPlayerId, targetPlayerId) {
        console.log("Capture player: ", attackingPlayerId, targetPlayerId);

        var attackingPlayer = self.model.players[attackingPlayerId];
        var targetPlayer = self.model.players[targetPlayerId];

        // Increment player captures for the attacking player
        attackingPlayer.playerCaptures++;

        // grow the attacking player the expected amount
        var attackingSphere = attackingPlayer.sphere;
        var targetSphere = targetPlayer.sphere;
        attackingSphere.growExpected( config.PLAYER_CAPTURE_VALUE( targetSphere.radius() ) );

        // Inform the attacking player that they captured target player
        self.sockets[attackingPlayerId].send(JSON.stringify({op: 'captured_player', targetPlayerId: targetPlayerId}));

        // Inform the target player that they died
        targetPlayer.deathTime = Date.now();
        targetPlayer.score = config.PLAYER_GET_SCORE( targetPlayer.sphere.scale );
        var msgObj = {op: 'you_died', attackingPlayerId: attackingPlayerId, targetPlayer: targetPlayer};
        self.sockets[targetPlayerId].send(JSON.stringify(msgObj));

        // Inform other clients that target player died
        msgObj = {op: "player_died", attackingPlayerId: attackingPlayerId, targetPlayerId: targetPlayerId};
        self.wss.broadcast(JSON.stringify(msgObj));

        self.removePlayerFromModel(targetPlayerId);
    };

    //TODO: test
    self.isPlayerInGame = function appIsPlayerInGame(player_id) {
        return (self.model.players[player_id] && self.sockets[player_id]);
    };

    //TODO: test
    self.kickPlayer = function appKickPlayer(playerId, reason) {
        console.log('kicking player: ', playerId, reason);

        // notify player
        if (self.sockets[playerId]) {
            self.sockets[playerId].send(JSON.stringify({op: 'kick', reason: reason}));
        }

        // notify other clients
        self.wss.broadcast(JSON.stringify({op: 'removePlayer', playerId: playerId}));

        self.removePlayerFromModel(playerId);
    };

    //TODO: test
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

    /**
     * Main server loop for general updates to the client that should be as fast as
     * possible, eg movement and player capture.
     */
    self.serverTickFast = function appServerTickFast() {
        self.checkPlayerCaptures();
        self.sendActorUpdates();
    };

    /**
     * Main server loop for general updates to the client that don't have to be
     * real-time, e.g. food respawns
     */
    self.serverTickSlow = function appServerTickSlow() {
        //checkHeartbeats();
        //updateFoodRespawns();
        //playersChecks();
        //sendServerTickData();
    };

    // Start game loops
    gameloop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
    gameloop.setGameLoop(self.serverTickSlow, config.TICK_SLOW_INTERVAL);
};

if (NODEJS) module.exports = AppServer;
