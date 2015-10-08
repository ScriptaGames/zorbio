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

//TODO: figure out why this is assigned as an object and not an array
var sockets = {};

app.use(express.static(__dirname + '/../client'));

io.on('connection', function (socket) {
    console.log("Player connected: ", JSON.stringify(socket.handshake));

    // Handle new connection
    var type = socket.handshake.query.type;
    // TODO: figure out radius an mass, do we need them for spheres?
    var radius = util.massToRadius(config.defaultPlayerMass);
    // TODO: algorithm to place users initial position
    //var position = config.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);
    var position = {x: 0, y: 0, z: 0};
    var cells = [];
    var massTotal = 0;


    if (type === 'player') {
        cells = [{
            mass: config.defaultPlayerMass,
            x: position.x,
            y: position.y,
            z: position.z,
            radius: radius
        }];
        massTotal = config.defaultPlayerMass;
    }

    var currentPlayer = {
        id: socket.id,
        x: position.x,
        y: position.y,
        z: position.z,
        cells: cells,
        massTotal: massTotal,
        hue: Math.round(Math.random() * 360),
        type: type,
        lastHeartbeat: new Date().getTime(),
        target: {
            x: 0,
            y: 0,
            z: 0
        }
    };

    socket.on('respawn', function () {
        var userIndex = util.findIndex(users, currentPlayer.id);
        if (userIndex > -1) {
            // if current player is already in the users array remove them
            users.splice(userIndex, 1);
        }

        socket.emit('welcome', currentPlayer);
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

            var radius = util.massToRadius(config.defaultPlayerMass);
            //TODO: algorithm to place users initial position
            //var position = config.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);
            var position = {x: 0, y: 0, z: 0};
            // TODO: is this duplicated code from above? refactor into function maybe?
            player.x = position.x;
            player.y = position.y;
            player.z = position.z;
            player.target.x = 0;
            player.target.y = 0;
            player.target.z = 0;
            if (type === 'player') {
                player.cells = [{
                    mass: config.defaultPlayerMass,
                    x: position.x,
                    y: position.y,
                    z: position.z,
                    radius: radius
                }];
                player.massTotal = config.defaultPlayerMass;
            }
            else {
                player.cells = [];
                player.massTotal = 0;
            }
            player.hue = Math.round(Math.random() * 360);
            currentPlayer = player;
            currentPlayer.lastHeartbeat = new Date().getTime();

            users.push(currentPlayer);

            io.emit('playerJoin', {name: currentPlayer.name});

            // Pass any data to the for final setup
            socket.emit('gameSetup', {});

            console.log('Total player: ' + users.length);
        }
    });

    socket.on('error', function (err) {
        console.error(err.stack);
        //TODO: handle error
    });
});

var serverPort = process.env.PORT || config.port;
http.listen(serverPort, function () {
    console.log("Server is listening on port " + serverPort);
});
