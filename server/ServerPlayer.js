var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var Zorbio = require('../common/zorbio.js');

var ServerPlayer = function ZORServerPlayer(player_id, name, color, type, position, ws) {
    // call super class constructor
    Zorbio.Player.call(this, player_id, name, color, type, position);

    var self = this;

    this.abilities.speed_boost.on('update', function () {

        // Get active duration in seconds
        var active_duration = self.abilities.speed_boost.active_duration / 1000;

        // The longer the player holds speed boost the worse the penalty gets. This allows big players to do
        // Quick short boosts without losing to much, but they can't boost forever or they'll burn out.
        // https://www.desmos.com/calculator/y14fpblqob
        var shrink_amount = config.ABILITY_SPEED_BOOST_PENALTY + (Math.pow(active_duration, 2) * 0.005);

        console.log("Shrink amount: ", shrink_amount);

        // Apply penalty
        self.sphere.growExpected(-shrink_amount);

        if (self.sphere.scale <= config.INITIAL_PLAYER_RADIUS) {
            console.log("Sending speed boost stop: ", player_id);
            ws.send(JSON.stringify({op: 'speed_boost_stop'}));
        }
    });
};
ServerPlayer.prototype = Object.create(Zorbio.Player.prototype);
ServerPlayer.constructor = ServerPlayer;

if (NODEJS) module.exports = ServerPlayer;
