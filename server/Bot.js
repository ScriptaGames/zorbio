let config        = require( '../common/config.js' );
let Zorbio        = require( '../common/zorbio.js' );
let UTIL          = require( '../common/util.js' );
let _             = require( 'lodash' );
let datasets      = require( 'datasets' );
let THREE         = require( 'three' );
let SkinCatalog   = require( '../common/SkinCatalog' );

let Bot = function(scale, model, movementPattern, curvePoints) {
    //  Scope
    let self = this;
    self.model = model;

    self.movementPattern = movementPattern || 'curve';  // default movement pattern is curve

    // Array of skins in the catalog
    let skins = _.filter( _.values(SkinCatalog), function(o) {
        return !o.unlock_url;  // Don't include hidden skins that have an unlock_url defined
    });

    // initialized bot properties
    self.colorCode = UTIL.getRandomIntInclusive(0, config.COLORS.length - 1);
    self.skin_name = skins[UTIL.getRandomIntInclusive(0, skins.length - 1)].name;
    self.id = Zorbio.IdGenerator.get_next_id();
    self.name = 'AI ' + _.sample(Bot.prototype.names);
    self.scale = scale || UTIL.getRandomIntInclusive(config.INITIAL_PLAYER_RADIUS, config.MAX_PLAYER_RADIUS);
    self.chaseTarget = {
        position: new THREE.Vector3(),
    };

    // curve properties
    self.curvePoints = curvePoints;
    self.nextCurvePoint = 1;


    let position = self.model.getSafeSpawnPosition(10);  // initial spawn position

    if (self.movementPattern === 'curve') {
        if (!Array.isArray(curvePoints) || curvePoints.length === 0) {
            // Generate a default curve points if none is provided
            self.curvePoints = UTIL.randomWanderPath(10, 1.2, 300);
        }

        position = self.curvePoints[0];
    }


    // Create the player model
    self.player = new Zorbio.Player(
        self.id,
        self.name,
        self.colorCode,
        Zorbio.PlayerTypes.BOT,
        position,
        self.scale,
        null,
        self.skin_name
    );

    self.movementPaterns = {

        // hold still
        hold: function moveHold() {
            let sphere = self.player.sphere;
            self.player.sphere.pushRecentPosition({
                position: sphere.position,
                radius  : sphere.scale,
                time    : Date.now(),
            });
        },

        // move the bot to 0, 0, 0
        center: function moveCenter() {
            let sphere = self.player.sphere;

            let centerPos = new THREE.Vector3(0, 0, 0).clone();
            centerPos.sub(sphere.position);
            centerPos.normalize();

            let speed = self.player.getSpeed();
            centerPos.multiplyScalar( speed );

            sphere.position.add(centerPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },

        // chase a target actor
        chase: function moveChase() {
            if (!self.chaseTarget || !self.chaseTarget.position) return;

            let sphere = self.player.sphere;

            let targetPos = self.chaseTarget.position.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            let speed = self.player.getSpeed();
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },

        // move to a random points
        randomPoint: function moveRandomPoint() {
            let sphere = self.player.sphere;

            if (!self.moveToPoint) {
                self.moveToPoint = UTIL.randomWorldPosition();
            }

            let dist = sphere.position.distanceTo(self.moveToPoint);

            if (dist < 5) {
                // reached point, generate a new one
                self.moveToPoint = UTIL.randomWorldPosition();
            }

            let targetPos = self.moveToPoint.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            let speed = self.player.getSpeed() * (config.TICK_FAST_INTERVAL / (1000/60)); // convert speed multiplier from fps to tick fast
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },

        curve: function moveCurve() {
            let sphere = self.player.sphere;
            let nextPoint = self.curvePoints[self.nextCurvePoint];

            // Check the distance
            if (sphere.position.distanceTo(nextPoint) < 5) {
                // reached the point, go to next
                self.nextCurvePoint++;


                // See if we've reached the end of the points and reset
                if (self.nextCurvePoint === self.curvePoints.length) {
                    self.nextCurvePoint = 1;
                }

                nextPoint = self.curvePoints[self.nextCurvePoint];
            }

            // TODO: put this in a fuction, it's duplicated from randomPoint
            let targetPos = nextPoint.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            let speed = self.player.getSpeed() * (config.TICK_FAST_INTERVAL / (1000/60)); // convert speed multiplier from fps to tick fast
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },
    };

    self.setChaseTarget = function botChaseTarget(actor_id) {
        self.chaseTarget = self.model.getActorById(actor_id);
    };

    self.setCurvePoints = function botSetCurvePoints(curvePoints) {
        self.curvePoints = curvePoints;
    };

    self.move = self.movementPaterns[self.movementPattern];
};

Bot.prototype.names = datasets['male-first-names-en'].concat(datasets['female-first-names-en']);

module.exports = Bot;

