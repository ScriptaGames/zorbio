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

var users = [];

var model = new Zorbio.Model(config.world_size, config.food_density);

// Define sockets as a hash so we can use string indexes
var sockets = {};

app.use(express.static(__dirname + '/../client'));

io.on('connection', function (socket) {
    console.log("Player connected: ", JSON.stringify(socket.handshake));

    // Handle new connection
    var type = socket.handshake.query.type;
    var name = socket.handshake.query.name;

    // Create the Player
    var currentPlayer = new Zorbio.Player(socket.id, name);
    model.addActor(currentPlayer.sphere);

    socket.on('respawn', function () {
        var userIndex = util.findIndex(users, currentPlayer.id);
        if (userIndex > -1) {
            // if current player is already in the users array remove them
            users.splice(userIndex, 1);
        }

        socket.emit('welcome', currentPlayer, model);
        console.log('User #' + currentPlayer.id + ' respawned');
    });

    socket.on('gotit', function (player) {
        console.log('Player ' + player.id + ' connecting');

        if (util.findIndex(users, player.id) > -1) {
            console.log('That playerID is already connected, kicking');
            socket.disconnect();
        } else if (!util.validNick(player.name)) {
            socket.emit('kick', 'Invalid username');
            socket.disconnect();
        } else {
            console.log('Player ' + player.id + ' connected!');
            sockets[player.id] = socket;
            currentPlayer.lastHeartbeat = new Date().getTime();

            // Add the player to the players array
            users.push(currentPlayer);

            io.emit('playerJoin', {name: currentPlayer.name});

            // Pass any data to the for final setup
            socket.emit('gameSetup', {});

            console.log('Total player: ' + users.length);
        }
    });

    socket.on('error', function (err) {
        console.error(err.stack);
        //TODO: handle error cleanup
    });
});

var serverPort = process.env.PORT || config.port;
http.listen(serverPort, function () {
    console.log("Server is listening on port " + serverPort);
});
