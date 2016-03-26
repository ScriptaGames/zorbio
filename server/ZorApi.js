var NODEJS = typeof module !== 'undefined' && module.exports;

var basicAuth  = require('basic-auth');

/**
 * Api for accessing and updating game state through http.
 * @param app
 * @param model
 * @param sockets
 * @constructor
 */
var ZorApi = function zorApi (app, model, sockets) {
    self.app = app;
    self.model = model;
    self.sockets = sockets;

    ///////////////////////////////////////////////////////////////////
    // API
    ///////////////////////////////////////////////////////////////////

    // Basic Auth
    self.basicAuth = function appBasicAuth (req, res, next) {
        var user = basicAuth(req);
        //noinspection JSUnresolvedVariable
        if (!user || !user.name || !user.pass) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            res.sendStatus(401);
            return;
        }

        //noinspection JSUnresolvedVariable
        if (user.name === 'zoruser' && user.pass === 'Z0r-b!0') {
            next();
        } else {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            res.sendStatus(401);
        }
    };
    self.app.all("/api/*", self.basicAuth);

    /**
     * API to return the current count of players on this server
     */
    self.app.get('/api/players/count', function (req, res) {
        var playerIds = Object.getOwnPropertyNames(self.model.players);
        var count = typeof playerIds.length !== 'undefined' ? playerIds.length : 0;
        res.setHeader('content-type', 'application/json');
        res.send( "{\"count\": " + count + "}" );
    });

    /**
     * API to return all the player objects on this server
     */
    self.app.get('/api/players', function (req, res) {
        res.setHeader('content-type', 'application/json');
        res.send( JSON.stringify(self.model.players) );
    });

    /**
     * API to return all the actor objects on this server
     */
    self.app.get('/api/actors', function (req, res) {
        res.setHeader('content-type', 'application/json');
        res.send( JSON.stringify(self.model.actors) );
    });

    /**
     * API to return all the actor objects on this server
     */
    self.app.get('/api/food', function (req, res) {
        var foodModel = {};
        foodModel.foodDensity = self.model.foodDensity;
        foodModel.foodCount = self.model.foodCount;
        foodModel.food_respawning_indexes = self.model.food_respawning_indexes;
        foodModel.food_respawn_ready_queue = self.model.food_respawn_ready_queue;

        res.setHeader('content-type', 'application/json');
        res.send( JSON.stringify(foodModel) );
    });

    /**
     * API to number of socket connections
     */
    self.app.get('/api/sockets/count', function (req, res) {
        var socketIds = Object.getOwnPropertyNames(self.sockets);
        var count = typeof socketIds.length !== 'undefined' ? socketIds.length : 0;
        res.setHeader('content-type', 'application/json');
        res.send( "{\"count\": " + count + "}" );
    });
};

if (NODEJS) module.exports = ZorApi;
