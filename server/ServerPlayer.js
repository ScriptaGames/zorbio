var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var Zorbio = require('../common/zorbio.js');

var ServerPlayer = function ZORServerPlayer(player_id, name, color, type, position, ws) {
    // call super class constructor
    Zorbio.Player.call(this, player_id, name, color, type, position);

    var self = this;

    this.abilities.speed_boost.on('update', function () {
        // Apply speed boost penalty
        self.sphere.growExpected(config.ABILITY_SPEED_BOOST_PENALTY);

        if (self.sphere.scale <= config.INITIAL_PLAYER_RADIUS) {
            console.log("Sending speed boost stop: ", player_id);
            ws.send(JSON.stringify({op: 'speed_boost_stop'}));
        }
    });
};
ServerPlayer.prototype = Object.create(Zorbio.Player.prototype);
ServerPlayer.constructor = ServerPlayer;

if (NODEJS) module.exports = ServerPlayer;
