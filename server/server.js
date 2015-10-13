var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config = require('./config.json');
var util = require('./lib/util');

// Simulate a browser environment so we can load BABYLON in nodejs
// This will be really useful since it gives us access to BABYLON's vector and
// matrix functions.
window = global;
navigator = {};
var BABYLON = require('babylonjs');
// Woot, now we have BABYLON in node!

var Zorbio = require('../common/zorbio.js');

// this array holds multiple game instances.  when one fills up, a new one is
// created.
//var Zorbios = [];

// max players per game instance
//var MAX_PLAYERS = 32;

var model = new Zorbio.Model(config.world_size, config.food_density);

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
        } else if (!util.validNick(player.name)) {
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
            socket.emit('gameSetup', {});

            console.log('Total players: ' + Object.getOwnPropertyNames(model.players).length);
        }
    });

    socket.on('myPosition', function (sphere) {
        if (model.actors[sphere.id]) {
            // update the players position in the model
            model.actors[sphere.id].position = sphere.p;
        }
    });

    socket.on('error', function (err) {
        console.error(err.stack);
        //TODO: handle error cleanup
    });
});

function sendUpdates() {
    // Send actors to the client for updates
    io.emit('actorPositions', model.actors);
}

setInterval(sendUpdates, config.networkUpdateInterval);

var serverPort = process.env.PORT || config.port;
http.listen(serverPort, function () {
    console.log("Server is listening on port " + serverPort);
});
