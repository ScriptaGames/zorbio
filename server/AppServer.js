var NODEJS = typeof module !== 'undefined' && module.exports;

// Load ThreeJS, so we have access to the same vector and matrix functions the
// client uses
global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
var THREE = require('three');

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


    self.wss.on('connection', function (ws) {
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

        ws.on('message', function (msg, flags) {
            if (flags.binary) {
                var ab = UTIL.toArrayBuffer(msg);
                var arr = new Int32Array(ab);
                console.log(arr[0]);
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
                    case 'zor_ping':
                        handle_msg_zor_ping(message);
                        break;
                }
            }
        });

        ws.on('close', function () {
            self.wss.broadcast(JSON.stringify("Client left"));
            console.log('Client connection closed');
        });

        function handle_msg_respawn (msg) {
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

        function handle_msg_player_ready (msg) {
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

                // Notify other clients that player has joined
                self.wss.broadcast(JSON.stringify({op: 'playerJoin', player: currentPlayer}));

                // Pass any data to the for final setup
                ws.send(JSON.stringify({op: 'game_setup', model: self.model, isFirstSpawn: msg.isFirstSpawn}));

                console.log('Player ' + currentPlayer.id + ' joined game!');
                console.log('Total players: ' + Object.getOwnPropertyNames(self.model.players).length);
            }
        }

        function handle_msg_zor_ping (msg) {
            currentPlayer.lastHeartbeat = Date.now();

            // save recent pings and fps
            currentPlayer.ping_metric.add(msg.lastPing);
            currentPlayer.fps_metric.add(msg.fps);

            ws.send(JSON.stringify({op: "zor_pong"}));
        }
    });

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
    }
};

if (NODEJS) module.exports = AppServer;
