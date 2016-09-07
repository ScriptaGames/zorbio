var NODEJS = typeof module !== 'undefined' && module.exports;

var config    = require('../common/config.js');
var ZorApi    = require('./ZorApi.js');
var AppServer = require('./AppServer.js');
var pjson     = require('../package.json');
var rq        = require('request');


var AppProxy = function (wss, app) {
    //  Scope
    var self = this;
    self.wss = wss;
    self.app = app;

    self.gameInstances = [];

    for (var i = 0; i < config.NUM_GAME_INSTANCES; i++) {
        self.gameInstances.push(new AppServer(i + 1, self.app));
    }

    self.api = new ZorApi(self.app, self.gameInstances);

    self.wss.on('connection', function wssConnection(ws) {
        for (var i = 0; i < self.gameInstances.length; i++) {
            if (!self.gameInstances[i].isFull()) {
                self.gameInstances[i].addClient(ws);
                break;
            }

            if (i === self.gameInstances.length - 1) {
                // all game instances full
                // Assign any other connections to lowest population server

                console.warn('All game instances full!');

                var low_pop_index = self.findLowestPopInstanceIndex();
                self.gameInstances[low_pop_index].addClient(ws);
            }
        }
    });

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

    self.versionCheck = function appVersionCheck() {
        var options = {
            url: 'https://raw.githubusercontent.com/ScriptaGames/zorbio-version/master/version.json',
        };

        rq(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var res = JSON.parse(body);
                var local_version = pjson.version + '-' + pjson.build;

                if (local_version !== res.version) {
                    console.log("version out of date, local  version:", local_version);
                    console.log("version out of date, remote version:", res.version);
                    self.serverRestartMsg = "Server restart imminent!";
                }
            }
        })
    };

    if (config.CHECK_VERSION) {
        setInterval(self.versionCheck, config.CHECK_VERSION_INTERVAL);
    }
};

if (NODEJS) module.exports = AppProxy;
