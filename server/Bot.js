let config        = require( '../common/config.js' );
let Zorbio        = require( '../common/zorbio.js' );
let UTIL          = require( '../common/util.js' );
let _             = require( 'lodash' );
let datasets      = require( 'datasets' );
let THREE         = require( 'three' );

let Bot = function(scale, model, movementPattern, curvePoints) {
    //  Scope
    let self = this;
    self.model = model;

    self.movementPattern = movementPattern || 'curve';  // default movement pattern is curve

    // Array of skin names with duplicates to balance which one will be picked
    // I like line trail type bots because I think they look prettier, default, and neptune have line trails
    let skins = [
        'default',
        'default',
        'default',
        'default',
        'neptune',
        'earth',
        'venus',
        'jupiter',
        'boing',
        'mars',
    ];

    // initialized bot properties
    self.colorCode = UTIL.getRandomIntInclusive(0, config.COLORS.length - 1);
    self.skin_name = skins[UTIL.getRandomIntInclusive(0, skins.length - 1)];
    self.id = Zorbio.IdGenerator.get_next_id();
    self.name = 'AI ' + _.sample(Bot.prototype.names);
    self.scale = scale || UTIL.getRandomIntInclusive(config.INITIAL_PLAYER_RADIUS, config.MAX_PLAYER_RADIUS);

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

        // chase a target actor
        chase: function moveChase() {
            if (!self.chasePosition ||
                !(self.chasePosition instanceof THREE.Vector3)) {
                return;  // no valid chase target set
            }

            // Decrement chase duration
            self.chaseTime -= config.TICK_FAST_INTERVAL;
            if (self.chaseTime <= 0) {
                self.setChaseTarget();
            }

            // Chaser bot moves a slower otherwise it's really mean
            self.moveTowardPoint(self.chasePosition.clone(), 0.5);
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

            self.moveTowardPoint(self.moveToPoint.clone());
        },

        // Move along curve path
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

            self.moveTowardPoint(nextPoint.clone());
        },
    };

    self.moveTowardPoint = function botMoveTowardPoint(point, speedMultiplier) {
        let sphere = self.player.sphere;
        speedMultiplier = speedMultiplier || 1;

        point.sub(sphere.position);
        point.normalize();

        // convert speed multiplier from fps to tick fast
        let speed = self.player.getSpeed() * (config.TICK_FAST_INTERVAL / (1000/60));
        speed *= speedMultiplier;

        point.multiplyScalar( speed );

        sphere.position.add(point);

        sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
    };

    self.setChaseTarget = function botChaseTarget(playerId) {
        if (self.movementPattern !== 'chase') return;

        let targetPlayer;

        // Initialize
        self.chasePosition = new THREE.Vector3();

        // Set a timeout to pick a new chase target
        self.chaseTime = UTIL.getRandomIntInclusive(config.BOT_CHASE_TIME_MIN, config.BOT_CHASE_TIME_MAX);

        if (playerId) {
            // look up specific player
            targetPlayer = self.model.getPlayerById(playerId);
        }
        else {
            // pick a random other player that is not this bot to chase
            targetPlayer = _.sample(_.filter(self.model.players, (p) => p.id !== self.id));
        }

        if (targetPlayer &&
            targetPlayer.sphere &&
            targetPlayer.sphere.position instanceof THREE.Vector3 &&
            targetPlayer.id !== self.id) {
            // Valid target player set to chase
            self.chasePlayer = targetPlayer;
            self.chasePosition = self.chasePlayer.sphere.position;  // for quick lookup

            console.log('Bot', self.id, 'set to chase player id', targetPlayer.id, 'for', self.chaseTime / 1000, 'seconds');
        }
        else {
            console.log('Bot', self.id, 'no chase target available');
        }
    };

    self.setCurvePoints = function botSetCurvePoints(curvePoints) {
        self.curvePoints = curvePoints;
    };

    // Initialize chase target
    self.setChaseTarget();

    self.move = self.movementPaterns[self.movementPattern];
};

Bot.prototype.names = datasets['male-first-names-en'].concat(datasets['female-first-names-en']);

module.exports = Bot;

