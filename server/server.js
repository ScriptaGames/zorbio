var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require('../common/config.js');

// Load ThreeJS, so we have access to the same vector and matrix functions the
// client uses
global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
var THREE = require('three.js');

var Zorbio = require('../common/zorbio.js');
var Validators = require('./Validators.js');
var UTIL = require('../common/util.js');

// this array holds multiple game instances.  when one fills up, a new one is
// created.
//var Zorbios = [];

// max players per game instance
//var MAX_PLAYERS = 32;

var model = new Zorbio.Model(config.WORLD_SIZE, config.FOOD_DENSITY);
var processingPlayerCapture = {};

// Define sockets as a hash so we can use string indexes
var sockets = {};

app.use(express.static(__dirname + '/../client'));

io.on('connection', function (socket) {
    console.log("Player connected: ", JSON.stringify(socket.handshake));

    // Handle new connection
    var type = socket.handshake.query.type;
    var name = socket.handshake.query.name;
    var color = socket.handshake.query.color;

    // Create the Player
    var currentPlayer = null;

    socket.on('respawn', function (isFirstSpawn) {
        var position = UTIL.safePlayerPosition();
        currentPlayer = new Zorbio.Player(socket.id, name, color, type, position);

        socket.emit('welcome', currentPlayer, isFirstSpawn);
        console.log('User ' + currentPlayer.id + ' spawning into the game');
    });

    socket.on('gotit', function (player, isFirstSpawn) {
        console.log('Player ' + player.id + ' connecting');

        if (!UTIL.validNick(player.name)) {
            socket.emit('kick', 'Invalid username');
            socket.disconnect();
        } else {
            console.log('Player ' + player.id + ' connected!');
            sockets[player.id] = socket;
            currentPlayer.lastHeartbeat = new Date().getTime();

            if (model.players[player.id]) {
                // if current player is already in the players remove them
                model.players[player.id] = null;
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

    socket.on('myPosition', function (sphere) {
        if (model.actors[sphere.id]) {
            // update the players position in the model
            model.actors[sphere.id].position = sphere.p;
            model.actors[sphere.id].scale = sphere.s;
        }
    });

    socket.on('foodCapture', function (fi, sphere_id, food_value) {
        var err = Validators.foodCapture(model, fi, sphere_id);
        if (err === 0) {
            model.food_respawning[fi] = config.FOOD_RESPAWN_TIME;
            // notify clients of food capture so they can update their food view
            io.emit('foodCaptureComplete', fi);
        } else {
            switch (err) {
                case Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR:
                    //TODO: TEST
                    // inform client of invalid capture, and make them shrink, mark infraction
                    sockets.emit('invalidFoodCapture', fi, food_value);
                    model.players[currentPlayer.id].infractions++;
                    break;
            }
        }
    });

    socket.on('playerCapture', function (attackingPlayerId, targetPlayerId) {
        console.log("received playerCapture: ", attackingPlayerId, targetPlayerId);

        var err = Validators.playerCapture(attackingPlayerId, targetPlayerId, model);
        if (err === 0) {
            if (!processingPlayerCapture[targetPlayerId]) {
                console.log("Valid Player capture: ", attackingPlayerId, targetPlayerId);
                sockets[attackingPlayerId].emit('processingPlayerCapture', targetPlayerId);
                processingPlayerCapture[targetPlayerId] = model.players[attackingPlayerId];
            }
        } else {
            switch (err) {
                case Validators.ErrorCodes.CAPTURE_PLAYER_NOT_IN_MODEL:
                    // let the attacking player know this capture was invalid
                    sockets[attackingPlayerId].emit('invalidCaptureTargetNotInModel', attackingPlayerId, targetPlayerId);
                    if (socket[targetPlayerId]) {
                        // if the target is still connected, let them know they aren't being captured
                        sockets[attackingPlayerId].emit('invalidCaptureTargetNotInModel', attackingPlayerId, targetPlayerId);
                    }
                    break;
            }
        }
    });

    socket.on('continuePlayerCapture', function (attackingPlayerId, targetPlayerId) {
        console.log("received continuePlayerCapture: ", attackingPlayerId, targetPlayerId);
        capturePlayer(attackingPlayerId, targetPlayerId);
    });

    socket.on('playerHeartbeat', function (id) {
        if (model.players[id]) {
            model.players[id].lastHeartbeat = new Date().getTime();
        }
    });

    socket.on('error', function (err) {
        console.error(err.stack);
        //TODO: handle error cleanup
    });

    socket.on('disconnect', function () {
        // don't remove player on disconnect, let heartbeat clean them up, this should prevent logout griefing
        console.log('User ' + currentPlayer.id + ' disconnected');
    });

    socket.on('ping', function () {
        socket.emit('pong');
    });
});

function sendActorUpdates() {
    // Send actors to the client for updates
    io.emit('actorPositions', model.actors);
}

function checkHeartbeats() {
    var time = new Date().getTime();

    var playerIds = Object.getOwnPropertyNames(model.players);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = playerIds[i];
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

    // Inform the attacking player that capture was successful
    sockets[attackingPlayerId].emit('successfulCapture', targetPlayerId);

    // Inform the target player that they died
    sockets[targetPlayerId].emit('youDied', attackingPlayerId);

    // Inform other clients that target player died
    io.emit("playerDied", attackingPlayerId, targetPlayerId);

    // processing is done so clear processing state for target player
    processingPlayerCapture[targetPlayerId] = null;
    delete processingPlayerCapture[targetPlayerId];

    removePlayerFromModel(targetPlayerId);
}

function removePlayerFromModel(playerId) {
    var actorId = 0;
    if (model.players[playerId]) {
        // remove player from model
        actorId = model.players[playerId].sphere.id;
        model.players[playerId] = null;
        delete model.players[playerId];
    }
    if (model.actors[actorId]) {
        model.actors[actorId] = null;
        delete model.actors[actorId];
    }
}

function removePlayerSocket(playerId) {
    if (sockets[playerId]) {
        sockets[playerId].disconnect();
        sockets[playerId] = null;
        delete sockets[playerId];
    }
}

function kickPlayer(playerId, reason) {
    // notify player
    sockets[playerId].emit('kick', reason);

    // notify other clients
    io.emit('playerKicked', playerId);

    removePlayerFromModel(playerId);
    removePlayerSocket(playerId);
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
    var serverTickData = {"fr": model.food_respawn_ready_queue};
    io.emit('serverTick', serverTickData);
    model.food_respawn_ready_queue = [];
    serverTickData = null;
}


//TODO: test
function kickCheatingPlayers() {
    var playerIds = Object.getOwnPropertyNames(model.players);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = playerIds[i];
        var player = model.players[id];
        if (player.infractions > config.PLAYER_INFRACTION_TOLORANCE) {
            var msg = "You were kicked because you had to many infractions";
            console.log('kicking player for cheating', id, msg, player.infractions);
            kickPlayer(id, msg);
        }
    }
}

/**
 * Main server loop for general updates to the client that don't have to be real-time, e.g. food respawns
 */
function serverTick() {
    updateFoodRespawns();
    sendServerTickData();
    kickCheatingPlayers();
}

setInterval(sendActorUpdates, config.ACTOR_UPDATE_INTERVAL);
setInterval(serverTick, config.SERVER_TICK_INTERVAL);

if (config.HEARTBEAT_ENABLE) {
    setInterval(checkHeartbeats, config.HEARTBEAT_CHECK_INTERVAL);
}

var serverPort = process.env.PORT || config.PORT;
http.listen(serverPort, function () {
    console.log("Server is listening on http://localhost:" + serverPort);
});
