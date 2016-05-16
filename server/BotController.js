var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var Bot    = require('./Bot.js');

var BotController = function (model) {
    //  Scope
    var self = this;

    self.model = model;

    self.bots = [];

    self.currentSpawnScale = config.INITIAL_PLAYER_RADIUS;

    self.spawnBot = function botSpawnBot() {
        var bot = new Bot(self.currentSpawnScale, self.model);
        self.bots.push(bot);
        self.model.players[bot.player.id] = bot.player;
        self.model.addActor(bot.player.sphere);

        self.currentSpawnScale += 10;
        if (self.currentSpawnScale > config.MAX_PLAYER_RADIUS) {
            self.currentSpawnScale = config.INITIAL_PLAYER_RADIUS;
        }

        console.log("Spawned bot: ", bot.name, bot.player.id, bot.scale);

        return bot;
    };

    self.removeBot = function botRemoveBot() {
        var bot = self.bots.shift();

        // remove from model
        var playerId = bot.player.id;
        var actorId = 0;
        if (self.model.players[playerId]) {
            // remove player from model
            actorId = self.model.players[playerId].sphere.id;
            delete self.model.players[playerId];
        }
        if (self.model.actors[actorId]) {
            delete self.model.actors[actorId];
        }

        console.log("Removed bot: ", bot.id, bot.name, bot.scale);

        return bot;
    };

    self.update = function botUpdate() {
        for (var i = 0; i < self.bots.length; i++) {
            var bot = self.bots[i];
            bot.move();
        }
    };

    self.hasBots = function botHasBots() {
        return self.bots.length > 0;
    }

};

if (NODEJS) module.exports = BotController;
