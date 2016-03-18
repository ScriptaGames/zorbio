var express = require('express');
var app = express();
var basicAuth = require('basic-auth');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require('../common/config.js');
var pjson = require('../package.json');
var request = require('request');
var gameloop = require('node-gameloop');
var _ = require('lodash');

// Load ThreeJS, so we have access to the same vector and matrix functions the
// client uses
global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
var THREE = require('three');

var Zorbio = require('../common/zorbio.js');
var Validators = require('./Validators.js');
var UTIL = require('../common/util.js');
var Drain = require('../common/Drain.js');

var model = new Zorbio.Model(config.WORLD_SIZE, config.FOOD_DENSITY);

// Define sockets as a hash so we can use string indexes
var sockets = {};

// server message
var serverRestartMsg = '';

app.use(express.static(__dirname + '/../' + (process.argv[2] || 'client')));

// set the allowed origin to prevent other domains from hosting a working
// version of our game client.  with CORS enabled, http://zor.bio is the only
// origin allowed to connect to the websocket server.  or http://localhost:3000
// for development :)
io.set('origins', config.ORIGIN);

// Basic Auth
var auth = function (req, res, next) {
    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }

    if (user.name === 'zoruser' && user.pass === 'Z0r-b!0') {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
    }
};
app.all("/api/*", auth);

/**
 * API to return the current count of players on this server
 */
app.get('/api/players/count', function (req, res) {
    var playerIds = Object.getOwnPropertyNames(model.players);
    var count = typeof playerIds.length !== 'undefined' ? playerIds.length : 0;
    res.setHeader('content-type', 'application/json');
    res.send( "{\"count\": " + count + "}" );
});

/**
 * API to return all the player objects on this server
 */
app.get('/api/players', function (req, res) {
    res.setHeader('content-type', 'application/json');
    res.send( JSON.stringify(model.players) );
});

/**
 * API to return all the actor objects on this server
 */
app.get('/api/actors', function (req, res) {
    res.setHeader('content-type', 'application/json');
    res.send( JSON.stringify(model.actors) );
});

/**
 * API to return all the actor objects on this server
 */
app.get('/api/food', function (req, res) {
    var foodModel = {};
    foodModel.foodDensity = model.foodDensity;
    foodModel.foodCount = model.foodCount;
    foodModel.food_respawning_indexes = model.food_respawning_indexes;
    foodModel.food_respawn_ready_queue = model.food_respawn_ready_queue;

    res.setHeader('content-type', 'application/json');
    res.send( JSON.stringify(foodModel) );
});

/**
 * API to number of socket connections
 */
app.get('/api/sockets/count', function (req, res) {
    var socketIds = Object.getOwnPropertyNames(sockets);
    var count = typeof socketIds.length !== 'undefined' ? socketIds.length : 0;
    res.setHeader('content-type', 'application/json');
    res.send( "{\"count\": " + count + "}" );
});

io.on('connection', function (socket) {
    console.log("Player connected: ", JSON.stringify(socket.handshake));

    // Handle new connection
    var player_id = Zorbio.IdGenerator.get_next_id();
    var type = socket.handshake.query.type;
    var name = socket.handshake.query.name;
    var color = socket.handshake.query.color;
    var key = socket.handshake.query.key;

    // Sanitize player name
    if (UTIL.isBlank(name)) {
        name = socket.handshake.query.name = "Player_" + player_id;
    }
    else if (name.length > config.MAX_PLAYER_NAME_LENGTH) {
        name = name.substr(0, config.MAX_PLAYER_NAME_LENGTH);
    }

    var currentPlayer;

    socket.on('respawn', function (isFirstSpawn) {
        var position = UTIL.safePlayerPosition();

        if (currentPlayer && isPlayerInGame(currentPlayer.id)) {
            // <ake sure this player isn't already connected and playing
            console.log("Respawn error: Player is already in game");
            kickPlayer(currentPlayer.id, "Forced respawn.");
            return;
        }

        // Create the Player
        currentPlayer = new Zorbio.Player(player_id, name, color, type, position);
        currentPlayer.handshake = socket.handshake;

        socket.emit('welcome', currentPlayer, isFirstSpawn);

        console.log('User ' + currentPlayer.id + ' spawning into the game');
    });

    socket.on('gotit', function (player, isFirstSpawn) {
        console.log('Player ' + player.id + ' connecting');

        //TODO: move profanity filter to client side
        if (Validators.is_profane(player.name)) {
            socket.emit('kick', 'Invalid username');
            socket.disconnect({ restart: false });
        }
        else if (!Validators.validAlphaKey(key)) {
            console.log('ALPHA KEY INVALID');
            socket.emit('kick', 'Invalid alpha key');
            socket.disconnect({ restart: true });
        }
        else {
            console.log('Player ' + player.id + ' connected!');
            sockets[player.id] = socket;
            currentPlayer.lastHeartbeat = Date.now();
            currentPlayer.spawnTime = Date.now();

            if (model.players[player.id]) {
                // if current player is already in the players remove them
                delete model.players[player.id];
            }

            // Add the player to the players object
            model.players[player.id] = currentPlayer;

            model.addActor(currentPlayer.sphere);

            io.emit('playerJoin', currentPlayer);

            // Pass any data to the for final setup
            socket.emit('gameSetup', model, isFirstSpawn);

            console.log('Total players: ' + Object.getOwnPropertyNames(model.players).length);
        }
    });

    /**
     * pp "Player Position" This message is sent by all clients every 40ms so keep this function as fast and light as possible
     */
    socket.on('pp', function (buffer) {
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
        var actor = model.actors[sphere.id];
        if (!actor) {
            err = Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
        } else {
            err = Validators.movementSampled(sphere, actor, model);
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

                    foodCapture(currentPlayer, fi, actor, origRadius);
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
                    socket.emit('speedingWarning');
                    model.players[currentPlayer.id].infractions_speed++;
                    break;
                case Validators.ErrorCodes.PLAYER_NOT_IN_MODEL:
                    console.log("Recieved 'myPosition' from player not in model!", sphere.id);
                    break;
            }
        }
    });

    var foodCapture = function iofoodCapture (player, fi, actor, origRadius) {
        var food_value = config.FOOD_GET_VALUE(origRadius);

        var err = Validators.foodCapture(model, fi, actor, origRadius);

        if (!err) {
            model.food_respawning[fi] = config.FOOD_RESPAWN_TIME;

            // Increment the players food captures
            player.foodCaptures++;

            // grow player on the server to track growth validation
            player.sphere.growExpected( food_value );

            // notify clients of food capture so they can update their food view
            // TODO: queue this into the actorUpdate message from the server
            io.emit('foodCaptureComplete', fi);
        } else {
            switch (err) {
                case Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR:
                    // inform client of invalid capture, and make them shrink, mark infraction
                    model.players[player.id].infractions_food++;
                    break;
                case Validators.ErrorCodes.PLAYER_NOT_IN_MODEL:
                    console.log("Recieved 'foodCapture' from player not in model!", actor.id);
                    break;
            }
        }
    };

    socket.on('zorServerPing', function (data) {
        currentPlayer.lastHeartbeat = Date.now();

        // save recent pings and fps
        currentPlayer.ping_metric.add(data.lastPing);
        currentPlayer.fps_metric.add(data.fps);

        socket.emit("zorServerPong", "zor_pong");
    });

    socket.on('error', function (err) {
        if (err && err.stack) {
            console.error("SOCKET ERROR: ", err.stack);
        }
        else {
            console.error("SOCKET ERROR: unknown");
        }
    });

    socket.on('disconnect', function () {
        if (currentPlayer && currentPlayer.id) {
            // remove player from the game
            console.log('User ' + currentPlayer.id + ' disconnected');
            kickPlayer(currentPlayer.id, 'disconnected');
        }
    });
});

function updateActorDrains() {
    // update drains

    var drainers = Drain.findAll( model.players );
    var drainer_ids = Object.getOwnPropertyNames(drainers);
    var drainees;
    var drainee;
    var drainee_id;
    var drainer_id;

    var i = drainer_ids.length;
    var j;
    while ( i-- ) {
        drainer_id = drainer_ids[i];
        drainees = drainers[drainer_id];
        j = drainees.length;
        while ( j-- ) {
            drainee_id = drainees[j];

            drainer = model.actors[drainer_id];
            drainee = model.actors[drainee_id];

            // log_sometimes(`${drainer_id} is draining ${drainee_id}`);

            drainer.growExpected(0.01);
            drainee.growExpected(-0.01);
        }
    }
}

function sendActorUpdates() {
    var actorIds = Object.getOwnPropertyNames(model.actors);
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

    updateActorDrains();

    // make the payload as small as possible, send only what's needed on the client
    var offset = 0;
    var i = NUM_PLAYERS;
    while( i-- ) {
        id = +actorIds[i];  // make sure id is a number
        actor = model.actors[id];
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

        offset += PLAYER_ARRAY_LENGTH;
    }

    // Send au "actors updates"
    io.emit('au', buffer);
}

function checkHeartbeats() {
    var time = Date.now();

    var playerIds = Object.getOwnPropertyNames(model.players);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = +playerIds[i];  // make sure id is a number
        var player = model.players[id];
        if (player && player.lastHeartbeat) {
            if ((time - player.lastHeartbeat) > config.HEARTBEAT_TIMEOUT) {
                var msg = "You were kicked because last heartbeat was over " + (config.HEARTBEAT_TIMEOUT / 1000) + " seconds ago.";
                console.log('kicking player', id, msg);
                kickPlayer(id, msg);
            }
        }
    }
}

function capturePlayer(attackingPlayerId, targetPlayerId) {
    console.log("capturePlayer: ", attackingPlayerId, targetPlayerId);

    var attackingPlayer = model.players[attackingPlayerId];
    var targetPlayer = model.players[targetPlayerId];

    // Increment player captures for the attacking player
    attackingPlayer.playerCaptures++;

    // grow the attacking player the expected amount
    var attackingSphere = attackingPlayer.sphere;
    var targetSphere = targetPlayer.sphere;
    attackingSphere.growExpected( config.PLAYER_CAPTURE_VALUE( targetSphere.radius() ) );

    // Inform the attacking player that capture was successful
    sockets[attackingPlayerId].emit('successfulCapture', targetPlayerId);

    // Inform the target player that they died
    targetPlayer.deathTime = Date.now();
    targetPlayer.score = config.PLAYER_GET_SCORE( targetPlayer.sphere.scale );
    sockets[targetPlayerId].emit('youDied', attackingPlayerId, targetPlayer);

    // Inform other clients that target player died
    io.emit("playerDied", attackingPlayerId, targetPlayerId);

    removePlayerFromModel(targetPlayerId);
}

function isPlayerInGame(player_id) {
    return (model.players[player_id] && sockets[player_id]);
}

function removePlayerFromModel(playerId) {
    var actorId = 0;
    if (model.players[playerId]) {
        // remove player from model
        actorId = model.players[playerId].sphere.id;
        delete model.players[playerId];
    }
    if (model.actors[actorId]) {
        delete model.actors[actorId];
    }
}

function removePlayerSocket(playerId) {
    if (sockets[playerId]) {
        sockets[playerId].disconnect();
        delete sockets[playerId];
    }
}

function kickPlayer(playerId, reason) {
    console.log('kicking player: ', playerId, reason);

    // notify player
    if (sockets[playerId]) {
        sockets[playerId].emit('kick', reason);
    }

    // notify other clients
    io.emit('removePlayer', playerId);

    removePlayerFromModel(playerId);
}

function updateFoodRespawns() {
    // keep a current reference of which food indexes are respawning
    model.food_respawning_indexes = [];

    for (var i = 0, l = model.food_respawning.length; i < l; ++i) {
        if (model.food_respawning[i] > 0) {
            model.food_respawning[i] = Math.max(  model.food_respawning[i] - config.TICK_SLOW_INTERVAL, 0 );

            if (model.food_respawning[i] === 0) {
                // queue up food respawn to send to clients
                model.food_respawn_ready_queue.push(i);
            } else {
                model.food_respawning_indexes.push(i);
            }
        }
    }
}

/**
 * Send any updates to client per server tick
 */
function sendServerTickData() {
    var serverTickData = {
        "fr": model.food_respawn_ready_queue,
        "sm": serverRestartMsg,
        "leaders": model.leaders
    };
    io.emit('serverTick', serverTickData);
    model.food_respawn_ready_queue = [];
}

/**
 * Any player checks that need to be done during serverTick, put here.
 */
function playersChecks() {
    model.leaders = [];

    // Iterate over all players and perform checks
    var playerIds = Object.getOwnPropertyNames(model.players);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = +playerIds[i];  // make sure id is a number
        var player = model.players[id];

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
            kickPlayer(id, "You were removed because you had too many speed infractions.");
        }
        else if (player.infractions_scale > config.INFRACTION_TOLERANCE_SCALE) {
            console.log("INFRACTION: Player reached scale infraction tolerance:", id, player.infractions_scale, config.INFRACTION_TOLERANCE_SCALE);
            player.infractions_scale = 0;
        }

        // Add players to leaders array in sorted order by score
        var score = config.PLAYER_GET_SCORE( player.sphere.radius() );
        var leader = {
            name: player.name,
            score: score,
            color: player.sphere.color,
        };
        UTIL.sortedObjectPush(model.leaders, leader, 'score');
    }

    // Prepare leaders array
    model.leaders.reverse();  // reverse for descending order
}

function checkPlayerCaptures( players ) {
    var players_array = _.values( players );
    var p1;
    var p2;
    var p1_scale;
    var p2_scale;
    var distance;

    var l = players_array.length;
    var j = 0;

    // init empty arrays for each player, they will hold the id's of players
    // they are draining
    var i = l;

    i = l;
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
                console.log(`${p1.id} captured ${p2.id}`);
                capturePlayer( p1.id, p2.id );
            }
            else if ( distance < p2_scale && p2_scale > p1_scale ) {
                console.log(`${p2.id} captured ${p1.id}`);
                capturePlayer( p2.id, p1.id );
            }

        }
    }
}

/**
 * Main server loop for general updates to the client that should be as fast as
 * possible, eg movement and player capture.
 */
function serverTickFast() {
    checkPlayerCaptures( model.players );
    // check for food captures
    sendActorUpdates();
}

/**
 * Main server loop for general updates to the client that don't have to be
 * real-time, e.g. food respawns
 */
function serverTickSlow() {
    checkHeartbeats();
    updateFoodRespawns();
    playersChecks();
    sendServerTickData();
}

function versionCheck() {
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
                serverRestartMsg = "Server restart imminent!";
            }
        }
    })
}

gameloop.setGameLoop(serverTickFast, config.TICK_FAST_INTERVAL);
gameloop.setGameLoop(serverTickSlow, config.TICK_SLOW_INTERVAL);

if (config.CHECK_VERSION) {
    gameloop.setGameLoop(versionCheck, config.CHECK_VERSION_INTERVAL);
}

var port = config.PORT;
http.listen( port, function () {
    console.log("Zorbio v" + pjson.version + "-" + pjson.build + " is listening on http://localhost:" + port);
});
