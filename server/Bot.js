var NODEJS = typeof module !== 'undefined' && module.exports;

var config = require('../common/config.js');
var Zorbio = require('../common/zorbio.js');
var UTIL   = require('../common/util.js');
var _      = require('lodash');

var Bot = function (scale, model) {
    //  Scope
    var self = this;
    self.model = model;

    // initialized player properties
    self.colorCode = UTIL.getRandomIntInclusive(0, config.COLORS.length - 1);
    var skin_names = _.values(config.SKINS);
    self.skin_name = skin_names[UTIL.getRandomIntInclusive(0, skin_names.length - 1)];
    self.id = Zorbio.IdGenerator.get_next_id();
    self.name = "AI_" + self.id;
    self.scale = 5; //scale || UTIL.getRandomIntInclusive(config.INITIAL_PLAYER_RADIUS, config.MAX_PLAYER_RADIUS);

    var position = UTIL.safePlayerPosition();

    self.counter = 0;

    // Create the player model
    self.player = new Zorbio.Player(self.id, self.name, self.colorCode, Zorbio.PlayerTypes.BOT, position, self.scale, null, self.skin_name);

    self.sampleClosedSpline = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -40, -40),
        new THREE.Vector3(0, 40, -40),
        new THREE.Vector3(0, 140, -40),
        new THREE.Vector3(0, 40, 40),
        new THREE.Vector3(0, -40, 40),
    ]);
    self.sampleClosedSpline.type = 'catmullrom';
    self.sampleClosedSpline.closed = true;

    self.pipeSpline = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 10, -10), new THREE.Vector3(10, 0, -10), new THREE.Vector3(20, 0, 0), new THREE.Vector3(30, 0, 10), new THREE.Vector3(30, 0, 20), new THREE.Vector3(20, 0, 30), new THREE.Vector3(10, 0, 30), new THREE.Vector3(0, 0, 30), new THREE.Vector3(-10, 10, 30), new THREE.Vector3(-10, 20, 30), new THREE.Vector3(0, 30, 30), new THREE.Vector3(10, 30, 30), new THREE.Vector3(20, 30, 15), new THREE.Vector3(10, 30, 10), new THREE.Vector3(0, 30, 10), new THREE.Vector3(-10, 20, 10), new THREE.Vector3(-10, 10, 10), new THREE.Vector3(0, 0, 10), new THREE.Vector3(10, -10, 10), new THREE.Vector3(20, -15, 10), new THREE.Vector3(30, -15, 10), new THREE.Vector3(40, -15, 10), new THREE.Vector3(50, -15, 10), new THREE.Vector3(60, 0, 10), new THREE.Vector3(70, 0, 0), new THREE.Vector3(80, 0, 0), new THREE.Vector3(90, 0, 0), new THREE.Vector3(100, 0, 0)]);
    self.pipeSpline.type = 'catmullrom';
    self.pipeSpline.closed = true;

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

        // chase a target actor
        chase: function moveChase() {
            if (!self.chaseTarget || !self.chaseTarget.position) return;

            var sphere = self.player.sphere;

            var targetPos = self.chaseTarget.position.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            var speed = self.player.getSpeed();
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({position: sphere.position, radius: sphere.scale, time: Date.now()});
        },

        // move to a random points
        randomPoint: function moveRandomPoint() {
            var sphere = self.player.sphere;

            if (!self.moveToPoint) {
                self.moveToPoint = UTIL.safePlayerPosition();
            }

            var dist = sphere.position.distanceTo(self.moveToPoint);

            if (dist < 5) {
                // reached point, generate a new one
                self.moveToPoint = UTIL.safePlayerPosition();
            }

            var targetPos = self.moveToPoint.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            var speed = self.player.getSpeed() * (config.TICK_FAST_INTERVAL / (1000/60)); // convert speed multiplier from fps to tick fast
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({position: sphere.position, radius: sphere.scale, time: Date.now()});
        },

        splineCurve: function moveSplineCurve() {
            var sphere = self.player.sphere;

            if ( self.counter <= 1 ) {
                // sphere.position = self.sampleClosedSpline.getPointAt( self.counter );
                sphere.position = self.pipeSpline.getPointAt( self.counter );
                sphere.position.multiplyScalar(3);
                sphere.pushRecentPosition({position: sphere.position, radius: sphere.scale, time: Date.now()});
                self.counter += 0.002
            } else {
                self.counter = 0;
            }
        }
    };

    self.setChaseTarget = function botChaseTarget(actor_id) {
        self.chaseTarget = self.model.getActorById(actor_id);
    };

    self.move = self.movementPaterns.splineCurve;
};

if (NODEJS) module.exports = Bot;

