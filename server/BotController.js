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
        var bot = new Bot(self.currentSpawnScale);
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

    self.update = function botUpdate() {
        for (var i = 0; i < self.bots.length; i++) {
            var bot = self.bots[i];
            bot.move();
        }
    };

};

if (NODEJS) module.exports = BotController;
