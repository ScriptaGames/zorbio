var express = require('express');
var app = express();
var basicAuth = require('basic-auth');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require('../common/config.js');
var pjson = require('../package.json');
var request = require('request');

// Load ThreeJS, so we have access to the same vector and matrix functions the
// client uses
global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
var THREE = require('three');

var Zorbio = require('../common/zorbio.js');
var Validators = require('./Validators.js');
var UTIL = require('../common/util.js');

var model = new Zorbio.Model(config.WORLD_SIZE, config.FOOD_DENSITY);

// Define sockets as a hash so we can use string indexes
var sockets = {};

// server message
var serverRestartMsg = '';

app.use(express.static(__dirname + '/../' + (process.argv[2] || 'client')));

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
    res.send( "{\"count\": " + count + "}" );
});

/**
 * API to return all the player objects on this server
 */
app.get('/api/players', function (req, res) {
    res.send( JSON.stringify(model.players) );
});

/**
 * API to return all the actor objects on this server
 */
app.get('/api/actors', function (req, res) {
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

    res.send( JSON.stringify(foodModel) );
});

/**
 * API to number of socket connections
 */
app.get('/api/sockets/count', function (req, res) {
    var socketIds = Object.getOwnPropertyNames(sockets);
    var count = typeof socketIds.length !== 'undefined' ? socketIds.length : 0;
    res.send( "{\"count\": " + count + "}" );
});

io.on('connection', function (socket) {
    console.log("Player connected: ", JSON.stringify(socket.handshake));

    // Handle new connection
    var type = socket.handshake.query.type;
    var name = socket.handshake.query.name;
    var color = socket.handshake.query.color;
    var key = socket.handshake.query.key;

    var currentPlayer;

    socket.on('respawn', function (isFirstSpawn) {
        var position = UTIL.safePlayerPosition();

        // First make sure this player isn't already connected and playing
        if (currentPlayer && isPlayerInGame(currentPlayer.id)) {
            console.log("Respawn error: Player is already in game");
            kickPlayer(currentPlayer.id, "Forced respawn.");
            return;
        }

        // Create the Player
        currentPlayer = new Zorbio.Player(Zorbio.IdGenerator.get_next_id(), name, color, type, position);

        socket.emit('welcome', currentPlayer, isFirstSpawn);

        console.log('User ' + currentPlayer.id + ' spawning into the game');
    });

    socket.on('gotit', function (player, isFirstSpawn) {
        console.log('Player ' + player.id + ' connecting');

        if (!UTIL.validNick(player.name)) {
            socket.emit('kick', 'Invalid username');
            socket.disconnect();
        }
        else if (!Validators.validAlphaKey(key)) {
            console.log('ALPHA KEY INVALID');
            socket.emit('kick', 'Invalid alpha key');
            socket.disconnect();
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
        currentPlayer.lastHeartbeat = Date.now();

        // Read binary data
        var bufArr  = new ArrayBuffer(buffer.length);
        var bufView = new Float32Array(bufArr);
        var viewIndex = 0;
        for (var bufferIndex = 0, l = buffer.length; bufferIndex < l; bufferIndex = bufferIndex + 4)            {
            bufView[viewIndex] = buffer.readFloatLE(bufferIndex);
            viewIndex++;
        }

        // Pull out the data
        var sphere_id = bufView[0];
        var old_x     = bufView[1];
        var old_y     = bufView[2];
        var old_z     = bufView[3];
        var old_r     = bufView[4];
        var old_t     = bufView[5];
        var new_x     = bufView[6];
        var new_y     = bufView[7];
        var new_z     = bufView[8];
        var new_r     = bufView[9];
        var new_t     = bufView[10];

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
            actor.position = latestPosition.position;
            actor.scale = sphere.scale;

            // Recent positions
            actor.recentPositions.push({position: actor.position, radius: actor.scale, time: latestPosition.time});
            if (actor.recentPositions.length > config.PLAYER_POSITIONS_WINDOW) {
                actor.recentPositions.shift();  // remove the oldest position
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

    socket.on('foodCapture', function (fi, sphere_id, radius) {
        currentPlayer.lastHeartbeat = Date.now();

        var err = Validators.foodCaptureSampled(model, fi, sphere_id, radius);

        if (!err) {
            model.food_respawning[fi] = config.FOOD_RESPAWN_TIME;

            // Increment the players food captures
            currentPlayer.foodCaptures++;

            // grow player on the server to track growth validation
            currentPlayer.sphere.growExpected( config.FOOD_GET_VALUE(radius) );

            // notify clients of food capture so they can update their food view
            io.emit('foodCaptureComplete', fi);
        } else {
            switch (err) {
                case Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR:
                    // inform client of invalid capture, and make them shrink, mark infraction
                    socket.emit('invalidFoodCapture', fi, config.FOOD_VALUE);
                    model.players[currentPlayer.id].infractions_food++;
                    break;
            }
        }
    });

    socket.on('playerCapture', function (attackingPlayerId, targetPlayerId, sendingSphere) {
        currentPlayer.lastHeartbeat = Date.now();

        console.log("received playerCapture: ", attackingPlayerId, targetPlayerId, sendingSphere.id);

        var err = Validators.playerCapture(attackingPlayerId, targetPlayerId, model, sendingSphere);
        if (err === 0) {
            if (!Zorbio.pendingPlayerCaptures[targetPlayerId]) {
                console.log("Valid Player capture: ", attackingPlayerId, targetPlayerId);
                sockets[attackingPlayerId].emit('processingPlayerCapture', targetPlayerId);
                Zorbio.pendingPlayerCaptures[targetPlayerId] = config.PENDING_PLAYER_CAPTURE_TTL;
            }
        } else {
            switch (err) {
                case Validators.ErrorCodes.PLAYER_NOT_IN_MODEL:
                    // let the attacking player know this capture was invalid
                    console.log("Validators.playerCapture: targetPlayerId not in model: ", targetPlayerId);
                    sockets[attackingPlayerId].emit('invalidCaptureTargetNotInModel', attackingPlayerId, targetPlayerId);
                    if (socket[targetPlayerId]) {
                        // if the target is still connected, let them know they aren't being captured
                        sockets[attackingPlayerId].emit('invalidCaptureTargetNotInModel', attackingPlayerId, targetPlayerId);
                    }
                    break;
                case Validators.ErrorCodes.PLAYER_CAPTURE_TO_FAR:
                    // the player who is connected to this socket is probably cheating
                    console.log("Invalid player capture distance to far", attackingPlayerId, targetPlayerId, currentPlayer.id);
                    socket.emit("invalidCaptureTargetToFar", attackingPlayerId, targetPlayerId);
                    model.players[currentPlayer.id].infractions_pcap++;
                    break;
            }
        }
    });

    socket.on('continuePlayerCapture', function (attackingPlayerId, targetPlayerId) {
        currentPlayer.lastHeartbeat = Date.now();

        console.log("received continuePlayerCapture: ", attackingPlayerId, targetPlayerId);
        capturePlayer(attackingPlayerId, targetPlayerId);
    });

    socket.on('serverMsg', function (bufArr) {
        currentPlayer.lastHeartbeat = Date.now();

        var ba = new ArrayBuffer(4);
        var bv = new Uint8Array(ba);
        bv[0]=10;
        bv[1]=11;
        bv[2]=12;
        bv[3]=13;

        //var bufView = new Uint8Array(bufArr);
        //console.log("heartbeat Data: ", bufView[0], bufView[1], bufView[2], bufView[3]);

        socket.emit("clientMsg", ba);
    });

    socket.on('error', function (err) {
        console.error(err.stack);
        kickPlayer(currentPlayer.id, 'An error occurred with your connection.');
    });

    socket.on('disconnect', function () {
        if (currentPlayer && currentPlayer.id) {
            // remove player from the game
            console.log('User ' + currentPlayer.id + ' disconnected');
            kickPlayer(currentPlayer.id, 'disconnected');
        }
    });
});

function sendActorUpdates() {
    var actorIds = Object.getOwnPropertyNames(model.actors);
    if (actorIds.length === 0) return;  // nothing to do if there's no actors

    var actorsArray = new Float32Array(actorIds.length * 5);

    // make the payload as small as possible, send only what's needed on the client
    var offset = 0;
    for (var i = 0, l = actorIds.length; i < l; i++) {
        var id = +actorIds[i];  // make sure id is a number
        var actor = model.actors[id];
        var position = actor.position;

        actorsArray[ offset ]     = id;
        actorsArray[ offset + 1 ] = position.x;
        actorsArray[ offset + 2 ] = position.y;
        actorsArray[ offset + 3 ] = position.z;
        actorsArray[ offset + 4 ] = actor.scale;

        offset += 5;
    }

    // Send au "actors updates"
    io.emit('au', actorsArray.buffer);
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

    // processing is done so clear processing state for target player
    delete Zorbio.pendingPlayerCaptures[targetPlayerId];

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
            model.food_respawning[i] = Math.max(  model.food_respawning[i] - config.SERVER_TICK_INTERVAL, 0 );

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
            kickPlayer(id, "You were removed because you had too many food infractions.");
        }
        else if (player.infractions_pcap > config.INFRACTION_TOLERANCE_PCAP) {
            kickPlayer(id, "You were removed because you had too many player capture infractions.");
        }
        else if (player.infractions_speed > config.INFRACTION_TOLERANCE_SPEED) {
            kickPlayer(id, "You were removed because you had too many speed infractions.");
        }
        else if (player.infractions_scale > config.INFRACTION_TOLERANCE_SCALE) {
            kickPlayer(id, "You were removed because you had too many size infractions.");
        }
        else if (Validators.playerScale(player) !== 0) {
            player.infractions_scale++;
        }

        // Add players to leaders array in sorted order by score
        var leader = {
            name: player.name,
            score: config.PLAYER_GET_SCORE( player.sphere.radius() ),
            color: player.sphere.color,
        };
        UTIL.sortedObjectPush(model.leaders, leader, 'score');
    }

    // Prepare leaders array
    model.leaders.reverse();  // reverse for descending order
}

/**
 * Main server loop for general updates to the client that don't have to be real-time, e.g. food respawns
 */
function serverTick() {
    updateFoodRespawns();
    playersChecks();
    sendServerTickData();

    // expire pending player captures
    Zorbio.expirePendingPlayerCaptures();
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

setInterval(sendActorUpdates, config.ACTOR_UPDATE_INTERVAL);
setInterval(serverTick, config.SERVER_TICK_INTERVAL);

if (config.CHECK_VERSION) {
    setInterval(versionCheck, config.CHECK_VERSION_INTERVAL);
}

//TODO: merge this into server tick, this doesn't need a separate setInterval
if (config.HEARTBEAT_ENABLE) {
    setInterval(checkHeartbeats, config.HEARTBEAT_CHECK_INTERVAL);
}

var port = config.PORT;
http.listen( port, function () {
    console.log("Zorbio v" + pjson.version + "-" + pjson.build + " is listening on http://localhost:" + port);
});
