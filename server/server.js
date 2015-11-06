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
var UTIL = require('../common/util.js');

// this array holds multiple game instances.  when one fills up, a new one is
// created.
//var Zorbios = [];

// max players per game instance
//var MAX_PLAYERS = 32;

var model = new Zorbio.Model(config.WORLD_SIZE, config.FOOD_DENSITY);

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
    var currentPlayer = new Zorbio.Player(socket.id, name, color, type);
    model.addActor(currentPlayer.sphere);

    socket.on('respawn', function () {
        if (model.players[currentPlayer.id]) {
            // if current player is already in the players remove them
            model.players[currentPlayer.id] = null;
            delete model.players[currentPlayer.id];
        }

        socket.emit('welcome', currentPlayer, model);
        console.log('User ' + currentPlayer.id + ' respawned');
    });

    socket.on('gotit', function (player) {
        console.log('Player ' + player.id + ' connecting');

        if (model.players[player.id]) {
            console.log('That playerID is already connected, kicking');
            socket.disconnect();
        } else if (!UTIL.validNick(player.name)) {
            socket.emit('kick', 'Invalid username');
            socket.disconnect();
        } else {
            console.log('Player ' + player.id + ' connected!');
            sockets[player.id] = socket;
            currentPlayer.lastHeartbeat = new Date().getTime();

            // Add the player to the players object
            model.players[player.id] = currentPlayer;

            io.emit('playerJoin', currentPlayer);

            // Pass any data to the for final setup
            socket.emit('gameSetup');

            console.log('Total players: ' + Object.getOwnPropertyNames(model.players).length);
        }
    });

    socket.on('myPosition', function (sphere) {
        if (model.actors[sphere.id]) {
            // update the players position in the model
            model.actors[sphere.id].position = sphere.p;
        }
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
});

function sendUpdates() {
    // Send actors to the client for updates
    io.emit('actorPositions', model.actors);
}

function checkHeartbeats() {
    var time = new Date().getTime();

    Object.getOwnPropertyNames(model.players).forEach(function (id) {
        var player = model.players[id];
        if (player && player.lastHeartbeat) {
            if ((time - player.lastHeartbeat) > config.HEARTBEAT_TIMEOUT) {
                var msg = "You were kicked because last heartbeat was over " + (config.HEARTBEAT_TIMEOUT / 1000) + " seconds ago.";
                console.log('kicking player', id, msg);
                kickPlayer(id, msg);
            }
        }
    });
}

function kickPlayer(playerId, reason) {
    // notify player
    sockets[playerId].emit('kick', reason);

    // notify other clients
    io.emit('playerKicked', playerId);

    // remove player from model
    var actorId = model.players[playerId].sphere.id;
    model.players[playerId] = null;
    delete model.players[playerId];
    model.actors[actorId] = null;
    delete model.actors[actorId];

    // clean up socket
    sockets[playerId].disconnect();
    sockets[playerId] = null;
    delete sockets[playerId];
}

setInterval(sendUpdates, config.NETWORK_UPDATE_INTERVAL);
setInterval(checkHeartbeats, config.HEARTBEAT_CHECK_INTERVAL);

var serverPort = process.env.PORT || config.PORT;
http.listen(serverPort, function () {
    console.log("Server is listening on port " + serverPort);
});
