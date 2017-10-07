var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var Zorbio = require('../common/zorbio.js');
var Bot    = require('./Bot.js');

var BotController = function (model) {
    //  Scope
    var self = this;

    self.model = model;

    self.bots = [];

    self.currentSpawnCycle = 0;

    self.spawnBot = function botSpawnBot() {
        self.setNextSpawnCycle();
        var scale = self.getNextSpawnScale();

        var bot = new Bot(scale, self.model);

        self.bots.push(bot);
        self.model.players.push(bot.player);
        self.model.addActor(bot.player.sphere);

        console.log("Spawned bot: ", bot.name, bot.player.id, bot.scale, self.currentSpawnCycle);

        return bot;
    };

    self.setNextSpawnCycle = function botSetNextSpawnCycle() {
        if (self.currentSpawnCycle >= config.MAX_BOTS) {
            self.currentSpawnCycle = 0;
        }

        // First find out how many big bots are already in the model
        var big_bots = self.getNumBigBots();

        do {
            self.currentSpawnCycle++;
        }
        while (self.currentSpawnCycle < big_bots);
    };

    self.getNumBigBots = function botGetNumBigBots() {
        var num = 0;
        self.model.players.forEach(function eachPlayer(player) {
            if (player.type === Zorbio.PlayerTypes.BOT && player.sphere.scale >= 90) {
                num++
            }
        });
        return num;
    };


    /**
     * Gets the scale of the next bot to spawn based on internal counter
     * @returns {number}
     */
    self.getNextSpawnScale = function botGetNextSpawnScale() {
        // just in case
        var scale = (this.currentSpawnCycle === 0) ? 1 : this.currentSpawnCycle;

        // https://www.desmos.com/calculator/fmmedr9kzi
        return (30 / (scale - 0.75)) + 3;
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
