var NODEJS = typeof module !== 'undefined' && module.exports;

var URL = require('url');

/**
 * This module contains all of the app logic and state,
 * @param wss
 * @constructor
 */
var AppServer = function (wss) {
    //  Scope.
    var self = this;

    self.wss = wss;
    self.wss.broadcast = function broadcast(data) {
        self.wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    // Example state
    var updateCount = 0;

    setInterval(function() {
        // send to all clients
        self.wss.broadcast(JSON.stringify(++updateCount));
    }, 100);

    self.wss.on('connection', function (ws) {

        console.log('Client connected');

        // parse query string
        var queryString = URL.parse(ws.upgradeReq.url, true).query;

        var name = queryString.name;

        console.log("Name:", name);

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
