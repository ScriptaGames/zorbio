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
    //  Scope.
    var self = this;

    self.wss = wss;

    // Game state
    self.model = new Zorbio.Model(config.WORLD_SIZE, config.FOOD_DENSITY);
    self.sockets = {};
    self.serverRestartMsg = '';


    self.wss.on('connection', function (ws) {

        console.log('Client connected headers:', JSON.stringify(ws.upgradeReq.headers), ws.upgradeReq.url);

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
                var ab = toArrayBuffer(msg);
                var arr = new Int32Array(ab);
                console.log(arr[0]);
            }
            else {
                console.log(msg);
            }
        });

        ws.on('close', function () {
            self.wss.broadcast(JSON.stringify("Client left"));
            console.log('Client connection closed');
        });

        function toArrayBuffer(buffer) {
            var ab = new ArrayBuffer(buffer.length);
            var view = new Uint8Array(ab);
            for (var i = 0; i < buffer.length; ++i) {
                view[i] = buffer[i];
            }
            return ab;
        }
    });
};

if (NODEJS) module.exports = AppServer;
