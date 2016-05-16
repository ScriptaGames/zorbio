var NODEJS = typeof module !== 'undefined' && module.exports;

var config     = require('../common/config.js');
var Zorbio     = require('../common/zorbio.js');
var UTIL       = require('../common/util.js');

var Bot = function (scale, model) {
    //  Scope
    var self = this;
    self.model = model;

    // initialized player properties
    self.colorCode = UTIL.getRandomIntInclusive(0, config.COLORS.length - 1);
    self.id = Zorbio.IdGenerator.get_next_id();
    self.name = "BOT_" + self.id;
    self.scale = scale || UTIL.getRandomIntInclusive(config.INITIAL_PLAYER_RADIUS, config.MAX_PLAYER_RADIUS);

    var position = UTIL.safePlayerPosition();

    // Create the player model
    self.player = new Zorbio.Player(self.id, self.name, self.colorCode, Zorbio.PlayerTypes.BOT, position, self.scale);

    self.movementPaterns = {

        // hold still
        hold: function moveHold() {
            var sphere = self.player.sphere;
            self.player.sphere.pushRecentPosition({position: sphere.position, radius: sphere.scale, time: Date.now()});
        },

        // move the bot to 0, 0, 0
        center: function moveCenter() {
            var sphere = self.player.sphere;

            var centerPos = new THREE.Vector3(0, 0, 0).clone();
            centerPos.sub(sphere.position);
            centerPos.normalize();

            var speed = self.player.getSpeed();
            centerPos.multiplyScalar( speed );

            sphere.position.add(centerPos);

            sphere.pushRecentPosition({position: sphere.position, radius: sphere.scale, time: Date.now()});
        },

        // follow a target actor
        follow: function moveFollow() {
            if (!self.followActor || !self.followActor.position) return;

            var sphere = self.player.sphere;

            var targetPos = self.followActor.position.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            var speed = self.player.getSpeed();
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({position: sphere.position, radius: sphere.scale, time: Date.now()});
        },
    };

    self.setFollowTarget = function botFollowTarget(actor_id) {
        self.followActor = self.model.actors[actor_id];
    };

    self.move = self.movementPaterns.hold;
};

if (NODEJS) module.exports = Bot;

