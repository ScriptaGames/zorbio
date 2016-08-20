var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var Bot    = require('./Bot.js');

var BotController = function (model) {
    //  Scope
    var self = this;

    self.model = model;

    self.bots = [];

    self.currentSpawnCycle = 1;

    self.spawnBot = function botSpawnBot() {
        // https://www.desmos.com/calculator/fmmedr9kzi
        var scale = (30 / (self.currentSpawnCycle - 0.75)) + 2;
        var bot = new Bot(scale, self.model);

        self.bots.push(bot);
        self.model.players.push(bot.player);
        self.model.addActor(bot.player.sphere);

        self.currentSpawnCycle++;
        if (self.currentSpawnCycle > config.MAX_BOTS) {
            self.currentSpawnCycle = 1;
        }

        console.log("Spawned bot: ", bot.name, bot.player.id, bot.scale);

        return bot;
    };

    self.removeBot = function botRemoveBot() {
        var bot = self.bots.pop();

        // remove from model
        self.model.removePlayer(bot.player.id);

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
