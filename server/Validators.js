var config = require('../common/config.js');

var Validators = {};

Validators.ErrorCodes = {
    PLAYER_NOT_IN_MODEL: 1,
    FOOD_CAPTURE_TO_FAR: 2,
    PLAYER_CAPTURE_TO_FAR: 3,
    NO_CHANGE: 4,
    SPEED_TO_FAST: 5
};

Validators.point_a = new THREE.Vector3();
Validators.point_b = new THREE.Vector3();

//Used for debugging
Validators.recentSpeeds = [];
Validators.currentScale = 1;
Validators.currentAvgSpeed = 0;
Validators.oldAvgSpeed = 0;
Validators.showAvgDiff = true;
Validators.maxSpeed = 0;
Validators.oldMaxSpeed = 0;

Validators.movement = function (sphere, model) {
    var err = 0;
    var actor = model.actors[sphere.id];
    var lastPosition = sphere.positions[sphere.positions.length - 1];

    if (typeof actor === 'undefined') {
        // return error not in model
        err = Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
    }
    else {
        // see if the player position or has changed
        if (actor.position.x === lastPosition.position.x &&
            actor.position.y === lastPosition.position.y &&
            actor.position.z === lastPosition.position.z &&
            actor.scale === sphere.scale) {
            err = Validators.ErrorCodes.NO_CHANGE;
        }
        else if (actor.recentPositions.length === config.PLAYER_POSITIONS_WINDOW) {
            var firstPosition = sphere.positions[0];
            var time = lastPosition.time - firstPosition.time;

            Validators.point_a.copy(firstPosition.position);
            Validators.point_b.copy(lastPosition.position);

            // get distance from point A to point B
            var vdist = Validators.point_a.distanceTo(Validators.point_b);

            // find out what current speed should be based on scale
            var expectedSpeed = config.INITIAL_SPEED_EXPECTED - (config.SPEED_SCALE_DECREMENT * (sphere.scale - 1));
            var maxToleratedSpeed = expectedSpeed + config.SPEED_EXTRA_TOLERANCE;
            var actualSpeed = vdist / time;

            //TODO: FIGURE OUT HOW TO TOLERATE LARGE CHANGES TO PLAYER SCALE
            if (actualSpeed > maxToleratedSpeed) {
                // speeding
                console.log("Player Speed to fast! expected, tolerated, actual:", expectedSpeed, maxToleratedSpeed, actualSpeed, sphere.id);
                return Validators.ErrorCodes.SPEED_TO_FAST;
            }

            if (config.DEBUG) {
                console.log("expected, tolerated, actual:", expectedSpeed, maxToleratedSpeed, actualSpeed);

                Validators.maxSpeed = Math.max(Validators.maxSpeed, actualSpeed);

                if (Validators.currentScale !== sphere.scale) {
                    Validators.currentScale = sphere.scale;
                    Validators.oldAvgSpeed = Validators.currentAvgSpeed;
                    Validators.currentAvgSpeed = 0;
                    Validators.recentSpeeds = [];
                    Validators.showAvgDiff = true;
                    Validators.oldMaxSpeed = Validators.maxSpeed;
                    Validators.maxSpeed = 0;
                }

                // Recent positions
                Validators.recentSpeeds.push(actualSpeed);
                if (Validators.recentSpeeds.length > 200) {
                    Validators.recentSpeeds.shift();  // remove the oldest position
                }

                if (Validators.recentSpeeds.length === 200 && Validators.showAvgDiff) {
                    var sum = 0;
                    for (var i = 0, l = Validators.recentSpeeds.length; i < l; i++) {
                        sum += Validators.recentSpeeds[i];
                    }
                    Validators.currentAvgSpeed = sum / Validators.recentSpeeds.length;

                    var avgDiff = Validators.oldAvgSpeed - Validators.currentAvgSpeed;
                    var maxDiff = Validators.oldMaxSpeed - Validators.maxSpeed;
                    console.log("avgDiff", avgDiff);
                    console.log("maxDiff", maxDiff);
                    console.log('maxSpeed, avgSpeed, speed, INIT_SPEED, scale:', Validators.maxSpeed, Validators.currentAvgSpeed, actualSpeed, config.INITIAL_SPEED_EXPECTED, sphere.scale);

                    Validators.showAvgDiff = false;
                }
            }
        }
    }

    return err;
};

Validators.foodCapture = function (model, fi, sphere_id) {
    // sphere info
    var sphere = model.actors[sphere_id];
    var sphere_radius = sphere.radius();

    // get food position
    var food_index = fi * 3;
    var food_x = model.food[food_index];
    var food_y = model.food[food_index + 1];
    var food_z = model.food[food_index + 2];

    // calculate dist and tolerance
    var foodPosition = new THREE.Vector3(food_x, food_y, food_z);
    var vdist = foodPosition.distanceTo(sphere.position);
    var tolerance = sphere_radius + config.FOOD_CAPTURE_ASSIST + config.FOOD_CAPTURE_EXTRA_TOLORANCE;

    // Make sure the sphere is in range of the food being captured
    if (vdist > tolerance) {
        console.log('INVALID food capture', fi, sphere_id, vdist, tolerance);
        return Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR;
    }

    return 0;
};

Validators.playerCapture = function (attackingPlayerId, targetPlayerId, model) {
    // Make sure target is in model
    if (!model.players[targetPlayerId]) {
        // target player not in model
        return Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
    }

    // check that the attacking player was within range of the target player
    var attackingPlayer = model.players[attackingPlayerId];
    var attackingPlayerPositions = attackingPlayer.sphere.recentPositions;

    var targetPlayer = model.players[targetPlayerId];
    var targetPlayerPositions = targetPlayer.sphere.recentPositions;

    var positionsLength = Math.min(attackingPlayerPositions.length, targetPlayerPositions.length);
    var captureDist = attackingPlayer.sphere.radius() + config.PLAYER_CAPTURE_EXTRA_TOLORANCE;
    var aPosition = new THREE.Vector3();
    var tPosition = new THREE.Vector3();
    var vdist = null;
    var validCapture = false;

    //TODO: refactor this to be the sample of recent positions from the client at time of capture
    // iterate from the most recent position to the oldest position
    for (var i = positionsLength - 1; i >= 0; i--) {
        aPosition.copy(attackingPlayerPositions[i]);
        tPosition.copy(targetPlayerPositions[i]);

        vdist = tPosition.distanceTo(aPosition);

        console.log("Validating player capture distance", vdist, captureDist);

        if (vdist < captureDist) {
            validCapture = true;
            break;
        }
    }

    if (!validCapture) {
        return Validators.ErrorCodes.PLAYER_CAPTURE_TO_FAR;
    }

    return 0;  // valid capture
};

module.exports = Validators;
