let config = require('../common/config.js');
let Zorbio = require('../common/zorbio.js');
let Bot    = require('./Bot.js');

let BotController = function(model) {
    //  Scope
    let self = this;

    self.model = model;

    self.bots = [];

    self.currentSpawnCycle = 0;

    self.spawnBot = function botSpawnBot() {
        self.setNextSpawnCycle();
        let scale = self.getNextSpawnScale();

        let bot = new Bot(scale, self.model);

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
        let big_bots = self.getNumBigBots();

        do {
            self.currentSpawnCycle++;
        }
        while (self.currentSpawnCycle < big_bots);
    };

    self.getNumBigBots = function botGetNumBigBots() {
        let num = 0;
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
        let scale = (this.currentSpawnCycle === 0) ? 1 : this.currentSpawnCycle;

        // https://www.desmos.com/calculator/fmmedr9kzi
        return (30 / (scale - 0.75)) + 3;
    };

    self.removeBot = function botRemoveBot() {
        let bot = self.bots.pop();

        // remove from model
        self.model.removePlayer(bot.player.id);

        console.log("Removed bot: ", bot.id, bot.name, bot.scale);

        return bot;
    };

    self.update = function botUpdate() {
        for (let i = 0; i < self.bots.length; i++) {
            let bot = self.bots[i];
            bot.move();
        }
    };

    self.hasBots = function botHasBots() {
        return self.bots.length > 0;
    }

};

module.exports = BotController;
