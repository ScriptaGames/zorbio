var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var Zorbio = require('../common/zorbio.js');

var ServerPlayer = function ZORServerPlayer() {
    // call super class constructor
    Zorbio.Player.apply(this, arguments);

    var self = this;

    this.abilities.speed_boost.on('update', function () {
        var currentScale = self.sphere.scale;
        var shrink_amount = -(currentScale * config.ABILITY_SPEED_BOOST_PENALTY);
        self.sphere.growExpected(shrink_amount);

        console.log('scales: ', self.sphere.scale, config.INITIAL_PLAYER_RADIUS + 0.1, self.sphere.scale <= config.INITIAL_PLAYER_RADIUS + 0.1);
        if (self.sphere.scale <= config.INITIAL_PLAYER_RADIUS + 0.1) {
            self.abilities.speed_boost.deactivate();
        }
    });
};
ServerPlayer.prototype = Object.create(Zorbio.Player.prototype);
ServerPlayer.constructor = ServerPlayer;

if (NODEJS) module.exports = ServerPlayer;
