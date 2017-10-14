let config    = require('../common/config.js');
let ZorApi    = require('./ZorApi.js');
let AppServer = require('./AppServer.js');
let pjson     = require('../package.json');
let rq        = require('request');
let cookie    = require('cookie');


let AppProxy = function(wss, app, server_label, port) {
    //  Scope
    let self = this;
    self.wss = wss;
    self.app = app;

    self.gameInstances = [];

    for (let i = 0; i < config.NUM_GAME_INSTANCES; i++) {
        self.gameInstances.push(new AppServer(i, self.app, server_label, port));
    }

    // set up api
    self.api = new ZorApi(self.app, self.gameInstances);

    // Route to write sticky session cookie for linode nodebalancer at given location
    self.app.get('/nbsrv/:nb/:id', function(req, res) {
        let balancer = req.params.nb;
        let node_id = req.params.id;

        // Set a new cookie with the name
        self.setSrvIdCookie(node_id, res);

        // Get the subdomain of the balancer location
        let balancer_domain = config.BALANCERS[balancer];

        // bounce redirect to balancer subdomain to set the cookie there too
        res.statusCode = 302;
        let bounce_url = 'http://' + balancer_domain + '/nbsrv_bounce/' + node_id;
        res.setHeader('Location', bounce_url);
        res.end();
    });

    // Route to set the cookie at the nodebalancer subdomain and bounce back to homepage
    self.app.get('/nbsrv_bounce/:id', function(req, res) {
        let node_id = req.params.id;

        // Set a new cookie with the name
        self.setSrvIdCookie(node_id, res);

        // bounce back to homepage
        res.statusCode = 302;
        res.setHeader('Location', 'http://zor.bio/');
        res.end();
    });

    self.wss.on('connection', function wssConnection(ws, req) {
        for (let i = 0; i < self.gameInstances.length; i++) {
            if (!self.gameInstances[i].isFull()) {
                self.gameInstances[i].addClient(ws, req);
                break;
            }

            if (i === self.gameInstances.length - 1) {
                // all game instances full
                // Assign any other connections to lowest population server

                console.warn('All game instances full!');

                let low_pop_index = self.findLowestPopInstanceIndex();
                self.gameInstances[low_pop_index].addClient(ws, req);
            }
        }
    });

    /**
     * Returns the index of the lowest population game instance
     * @returns {number}
     */
    self.findLowestPopInstanceIndex = function proxyFindLowestPopInstance() {
        let lowest_pop_index = 0;
        let client_count = Infinity;
        for (let i = 0; i < self.gameInstances.length; i++) {
            let cur_client_count = self.gameInstances[i].getClientCount();
            if (cur_client_count < client_count) {
                client_count = cur_client_count;
                lowest_pop_index = i;
            }
        }

        return lowest_pop_index;
    };

    self.versionCheck = function appVersionCheck() {
        let options = {
            url: 'https://raw.githubusercontent.com/ScriptaGames/zorbio-version/master/version.json',
        };

        console.log("Checking version...");

        rq.get(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                try {
                    let res = JSON.parse(body);
                    let local_version = pjson.version + '-' + pjson.build;

                    if (local_version !== res.version) {
                        console.log("version out of date, local  version:", local_version);
                        console.log("version out of date, remote version:", res.version);

                        // notify all game instances that the version is out of date
                        for (let i = 0; i < self.gameInstances.length; i++) {
                            self.gameInstances[i].setServerMessage("Server restart imminent!");
                        }
                    }
                    else {
                        console.log('Version is up-to-date', local_version);
                    }
                } catch (e) {
                    console.error('Caught exception parsing json from zorbio-version');
                }
            }
            else {
                console.error('Error response code form getting zorbio-version from github');
            }
        }).on('error', function(){
            console.error('Error http request failed to get zorbio-version from github');
        }).end();
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

module.exports = AppProxy;
