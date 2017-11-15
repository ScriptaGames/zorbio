let config     = require( '../common/config.js' );
let Zorbio     = require( '../common/zorbio.js' );
let Bot        = require( './Bot.js' );
let CurvePaths = require( '../common/CurvePaths' );
let THREE      = require( 'three' );

let BotController = function(model) {
    //  Scope
    let self = this;

    self.model = model;

    self.bots = [];

    self.currentSpawnCycle = 0;

    self.curvePaths = new CurvePaths();

    self.spawnBot = function botSpawnBot() {
        self.setNextSpawnCycle();
        let scale = self.getNextSpawnScale();
        let bot;

        // Spawn the bot
        if (!self.hasChaserBot() && scale < 10) {
            // Always have at least one medium to small size chaser bot
            bot = new Bot(scale, self.model, 'chase');
            console.log('Spawning chaser bot');
        }
        else {
            // Spawn all other bots with a random curve pattern
            bot = new Bot(scale, self.model, config.BOT_DEFAULT_MOVEMENT, self.curvePaths.getRandomCurve());
        }

        self.bots.push(bot);
        self.model.players.push(bot.player);
        self.model.addActor(bot.player.sphere);

        console.log('Spawned bot: ', bot.name, bot.player.id, bot.scale, self.currentSpawnCycle);

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
                num++;
            }
        });
        return num;
    };

    /**
     * Returns true if there is at least 1 chaser bot false otherwise
     * @returns {boolean}
     */
    self.hasChaserBot = function botHasChaserBot() {
        for (let i = 0; i < self.bots.length; i++) {
            let bot = self.bots[i];

            if (bot.move === bot.movementPaterns.chase) {
                return true;
            }
        }

        return false;
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

    /**
     * Removes the latest bot spawned
     * @returns {Bot}
     */
    self.popBot = function botPopBot() {
        let bot = self.bots.pop();

        // remove from model
        self.model.removePlayer(bot.player.id);

        console.log('Removed top bot: ', bot.id, bot.name, bot.scale);

        return bot;
    };

    /**
     * Removes a bot by ID
     * @param {number} id
     */
    self.removeBot = function botRemoveBot(id) {
        for (let i = 0; i < self.bots.length; i++) {
            let bot = self.bots[i];

            if (bot.id === id) {
                // found the bot with matching ID now delete it from the array
                self.bots.splice(i, 1);

                // remove from model may have already been removed but this won't hurt
                self.model.removePlayer(bot.player.id);

                console.log('Removed bot: ', bot.id, bot.name);

                bot = null;

                return;
            }
        }
    };

    self.update = function botUpdate() {
        for (let i = 0; i < self.bots.length; i++) {
            let bot = self.bots[i];
            bot.move();
        }
    };

    self.hasBots = function botHasBots() {
        return self.bots.length > 0;
    };


    /**
     * Checks chase bots for to make sure their chase target is still valid
     */
    self.validateChaseTargets = function botControllerCheckChaseTargets() {
        // For any bots that have the chase movement method, set new chase target
        for (let i = 0; i < self.bots.length; i++) {
            let bot = self.bots[i];

            if (bot.move === bot.movementPaterns.chase) {
                if (!bot.chasePlayer ||
                    !self.model.getPlayerById( bot.chasePlayer.id ) ||
                    !(bot.chasePosition instanceof THREE.Vector3)) {
                    console.log('Bot', bot.id, 'chase target invalid, setting new target..');
                    bot.setChaseTarget();  // Set a new random chase target
                }
            }
        }
    };
};

module.exports = BotController;
