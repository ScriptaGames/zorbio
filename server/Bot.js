var NODEJS = typeof module !== 'undefined' && module.exports;

var config     = require('../common/config.js');
var Zorbio     = require('../common/zorbio.js');
var UTIL       = require('../common/util.js');

var Bot = function (scale) {
    //  Scope
    var self = this;

    // initialized player properties
    self.colorCode = UTIL.getRandomIntInclusive(0, config.COLORS.length - 1);
    self.id = Zorbio.IdGenerator.get_next_id();
    self.name = "BOT_" + self.id;
    self.scale = scale || UTIL.getRandomIntInclusive(config.INITIAL_PLAYER_RADIUS, config.MAX_PLAYER_RADIUS);

    var position = UTIL.safePlayerPosition();

    // Create the player model
    self.player = new Zorbio.Player(self.id, self.name, self.colorCode, Zorbio.PlayerTypes.BOT, position, self.scale);

    self.move = function botMove() {

        var sphere = self.player.sphere;

        //sphere.position.sub(
        //    UTIL.adjustVelocityWallHit(
        //        sphere.position,
        //        0,
        //        self.velocity,
        //        config.WORLD_SIZE
        //    )
        //);

        sphere.pushRecentPosition({position: sphere.position, radius: sphere.scale, time: Date.now()});

    };

};

if (NODEJS) module.exports = Bot;

