var NODEJS = typeof module !== 'undefined' && module.exports;

var config    = require('../common/config.js');
var AppServer = require('./AppServer.js');

var AppProxy = function (wss, app) {
    //  Scope
    var self = this;
    self.wss = wss;
    self.app = app;

    self.gameInstances = [];

    for (var i = 0; i < config.NUM_GAME_INSTANCES; i++) {
        self.gameInstances.push(new AppServer(i + 1, self.app));
    }

    self.wss.on('connection', function wssConnection(ws) {
        for (var i = 0; i < self.gameInstances.length; i++) {
            if (!self.gameInstances[i].isFull()) {
                self.gameInstances[i].addClient(ws);
                break;
            }

            if (i === self.gameInstances.length - 1) {
                // all game instances full
                // Procedure for full server:
                //   1. Log and Send warning notification
                //   2. Take linode out of rotation from the NodeBalancer
                //   3. Assign any other connections to lowest population server

                console.warn('All game instances full!');

                //TODO: send warning notification
                //TODO: take linode out of rotation from the NodeBalancer

                var low_pop_index = self.findLowestPopInstanceIndex();
                self.gameInstances[low_pop_index].addClient(ws);
            }
        }
    });

    //TODO: game loop to check if node is out of rotation, and put it back into rotation when connections levels drop

    /**
     * Returns the index of the lowest population game instance
     * @returns {number}
     */
    self.findLowestPopInstanceIndex = function proxyFindLowestPopInstance() {
        var lowest_pop_index = 0;
        var client_count = Infinity;
        for (var i = 0; i < self.gameInstances.length; i++) {
            var cur_client_count = self.gameInstances[i].getClientCount();
            if (cur_client_count < client_count) {
                client_count = cur_client_count;
                lowest_pop_index = i;
            }
        }

        return lowest_pop_index;
    };
};

if (NODEJS) module.exports = AppProxy;
