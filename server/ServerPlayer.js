let config = require('../common/config.js');
let Zorbio = require('../common/zorbio.js');

let ServerPlayer = function ZORServerPlayer(player_id, name, color, skin, type, position, ws) {
    // call super class constructor
    Zorbio.Player.call(this, player_id, name, color, type, position, null, null, skin);

    let self = this;

    this.abilities.speed_boost.on('update', function() {
        // Get active duration in seconds
        let active_duration = self.abilities.speed_boost.active_duration / 1000;

        // The longer the player holds speed boost the worse the penalty gets. This allows big players to do
        // Quick short boosts without losing to much, but they can't boost forever or they'll burn out.
        // https://www.desmos.com/calculator/y14fpblqob
        let shrink_amount = config.ABILITY_SPEED_BOOST_PENALTY + (Math.pow(active_duration, 2) * 0.005);

        // Apply penalty
        self.sphere.growExpected(-shrink_amount);

        if (self.sphere.scale <= config.INITIAL_PLAYER_RADIUS) {
            ws.send(JSON.stringify({op: 'speed_boost_stop'}));
        }
    });
};
ServerPlayer.prototype = Object.create(Zorbio.Player.prototype);
ServerPlayer.constructor = ServerPlayer;

module.exports = ServerPlayer;
