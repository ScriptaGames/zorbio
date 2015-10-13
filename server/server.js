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

var users = {};

//TODO: refactor into model.playersSpheres
var playerSpherePositions = {};

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
    var currentPlayer = new Zorbio.Player(socket.id, name, color);
    model.addActor(currentPlayer.sphere);

    playerSpherePositions[currentPlayer.sphere.id] = {
        position: currentPlayer.sphere.position,
        color: currentPlayer.sphere.color
    };

    socket.on('respawn', function () {
        if (users[currentPlayer.id]) {
            // if current player is already in the users remove them
            users[currentPlayer.id] = null;
            delete users[currentPlayer.id];
         }

        socket.emit('welcome', currentPlayer, model, playerSpherePositions);
        console.log('User ' + currentPlayer.id + ' respawned');
    });

    socket.on('gotit', function (player) {
        console.log('Player ' + player.id + ' connecting');

        if (users[player.id]) {
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
            users[player.id] = currentPlayer;

            io.emit('playerJoin', currentPlayer);

            // Pass any data to the for final setup
            socket.emit('gameSetup', {});

            console.log('Total players: ' + Object.getOwnPropertyNames(users).length);
        }
    });

    socket.on('myPosition', function (sphere) {
        if (model.actors[sphere.id]) {
            // update the players possition in the model
            model.actors[sphere.id].position = sphere.p;
        }

        //TODO: refactor actorPositions to model.playersSpheres
        playerSpherePositions[sphere.id].position = sphere.p;
    });

    socket.on('error', function (err) {
        console.error(err.stack);
        //TODO: handle error cleanup
    });
});

function sendUpdates() {
    //TODO: refactor model to separate food actors from player actors so we can send model.playersSpheres
    //Object.getOwnPropertyNames(sockets).forEach(function(id) {
    //    sockets[id].emit('playerPositions', playerSpherePositions);
    //});

    io.emit('playerPositions', playerSpherePositions);
    //console.log('playerPositions', JSON.stringify(playerSpherePositions));
}

setInterval(sendUpdates, config.networkUpdateInterval);

var serverPort = process.env.PORT || config.port;
http.listen(serverPort, function () {
    console.log("Server is listening on port " + serverPort);
});
