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
            if (!self.chaseTarget || !self.chaseTarget.position) return;

            // Chaser bot moves a slower otherwise it's really mean
            self.moveTowardPoint(self.chaseTarget.position.clone(), 0.5);
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

        let actorId;
        let targetPlayer;

        if (playerId) {
            // look up specific player
            targetPlayer = self.model.getPlayerById(playerId);
            if (targetPlayer && targetPlayer.sphere) {
                actorId = targetPlayer.sphere.id;
            }
        }
        else {
            // pick a random other player if there are any
            targetPlayer = _.sample(self.model.players);
            if (targetPlayer && targetPlayer.sphere && targetPlayer.id !== self.id) {
                actorId = targetPlayer.sphere.id;
            }
        }

        if (!targetPlayer) {
            // no player found
            console.log('Bot ', self.id, ' no chase target available');
            self.chaseTarget = new THREE.Vector3();
        }
        else if (actorId > 0) {
            console.log('Bot ', self.id, ' set to chase player id ', targetPlayer.id);
            self.chaseTarget = self.model.getActorById(actorId);
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

