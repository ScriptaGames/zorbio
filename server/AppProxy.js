var NODEJS = typeof module !== 'undefined' && module.exports;

var config    = require('../common/config.js');
var ZorApi    = require('./ZorApi.js');
var AppServer = require('./AppServer.js');
var pjson     = require('../package.json');
var rq        = require('request');
var cookie    = require('cookie');


var AppProxy = function (wss, app, server_label, port) {
    //  Scope
    var self = this;
    self.wss = wss;
    self.app = app;

    self.gameInstances = [];

    for (var i = 0; i < config.NUM_GAME_INSTANCES; i++) {
        self.gameInstances.push(new AppServer(i, self.app, server_label, port));
    }

    // set up api
    self.api = new ZorApi(self.app, self.gameInstances);

    // Route to write sticky session cookie for linode nodebalancer at given location
    self.app.get('/nbsrv/:nb/:id', function (req, res) {
        var balancer = req.params.nb;
        var node_id = req.params.id;

        // Set a new cookie with the name
        self.setSrvIdCookie(node_id, res);

        // Get the subdomain of the balancer location
        var balancer_domain = config.BALANCERS[balancer];

        // bounce redirect to balancer subdomain to set the cookie there too
        res.statusCode = 302;
        var bounce_url = 'http://' + balancer_domain + '/nbsrv_bounce/' + node_id;
        res.setHeader('Location', bounce_url);
        res.end();
    });

    // Route to set the cookie at the nodebalancer subdomain and bounce back to homepage
    self.app.get('/nbsrv_bounce/:id', function (req, res) {
        var node_id = req.params.id;

        // Set a new cookie with the name
        self.setSrvIdCookie(node_id, res);

        // bounce back to homepage
        res.statusCode = 302;
        res.setHeader('Location', 'http://zor.bio/');
        res.end();
    });

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

                    // notify all game instances that the version is out of date
                    for (var i = 0; i < self.gameInstances.length; i++) {
                        self.gameInstances[i].setServerMessage("Server restart imminent!");
                    }
                }
            }
        });
    };

    self.setSrvIdCookie = function appSetSrvIdCookie(id, res) {
        if (id) {
            res.setHeader('Set-Cookie', cookie.serialize('NB_SRVID', id, {
                path: '/',
            }));
        }
    };

    if (config.CHECK_VERSION) {
        setInterval(self.versionCheck, config.CHECK_VERSION_INTERVAL);
    }
};

if (NODEJS) module.exports = AppProxy;
