var config = require('../common/config.js');

var Validators = {};

Validators.ErrorCodes = {
    PLAYER_NOT_IN_MODEL: 1,
    FOOD_CAPTURE_TO_FAR: 2,
    PLAYER_CAPTURE_TO_FAR: 3,
    NO_CHANGE: 4,
    SPEED_TO_FAST: 5
};


Validators.movement = function () {

    var msPerFrame = 1/60 * 1000;

    var recentSpeeds = [];
    var currentScale = 1;
    var currentAvgSpeed = 0;
    var oldAvgSpeed = 0;
    var showAvgDiff = true;
    var maxSpeed = 0;
    var oldMaxSpeed = 0;

    var point_a = new THREE.Vector3();
    var point_b = new THREE.Vector3();

    return function (sphere, model) {
        var err = 0;
        var actor = model.actors[sphere.id];
        var latestPosition = sphere.positions[sphere.positions.length - 1];

        if (typeof actor === 'undefined') {
            // return error not in model
            err = Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
        }
        else {
            // see if the player position or has changed
            if (actor.position.x === latestPosition.position.x &&
                    actor.position.y === latestPosition.position.y &&
                    actor.position.z === latestPosition.position.z &&
                    actor.scale === sphere.scale) {
                err = Validators.ErrorCodes.NO_CHANGE;
            }
            else if (sphere.positions.length > 1) {
                var oldestPosition = sphere.positions[0];
                var time = latestPosition.time - oldestPosition.time;
                var minTime = ((config.PLAYER_POSITIONS_WINDOW * msPerFrame) - 180);

                if ((oldestPosition.radius !== latestPosition.radius) || (time < minTime)) {
                    return 0; // only can calculate when radius are the same
                }

                point_a.copy(oldestPosition.position);
                point_b.copy(latestPosition.position);

                // get distance from point A to point B
                var vdist = point_a.distanceTo(point_b);

                // find out what current speed should be based on scale
                var expectedSpeed = config.PLAYER_GET_SPEED(sphere.scale);
                var maxToleratedSpeed = expectedSpeed + config.SPEED_EXTRA_TOLERANCE;
                var measuredSpeed = vdist / time;
                var actualSpeed = msPerFrame * measuredSpeed;

                //TODO: FIGURE OUT HOW TO TOLERATE LARGE CHANGES TO PLAYER SCALE
                if (actualSpeed > maxToleratedSpeed) {
                    // speeding
                    console.log("Player Speed to fast! expected, tolerated, actual:", expectedSpeed, maxToleratedSpeed, actualSpeed, sphere.id);
                    return Validators.ErrorCodes.SPEED_TO_FAST;
                }

                if (config.DEBUG) {
                    //console.log("expected, tolerated, actual:", expectedSpeed, maxToleratedSpeed, actualSpeed);

                    maxSpeed = Math.max(maxSpeed, actualSpeed);

                    if (currentScale !== sphere.scale) {
                        currentScale = sphere.scale;
                        oldAvgSpeed = currentAvgSpeed;
                        currentAvgSpeed = 0;
                        recentSpeeds = [];
                        showAvgDiff = true;
                        oldMaxSpeed = maxSpeed;
                        maxSpeed = 0;
                    }

                    // Recent positions
                    recentSpeeds.push(actualSpeed);
                    if (recentSpeeds.length > 200) {
                        recentSpeeds.shift();  // remove the oldest position
                    }

                    if (recentSpeeds.length === 200 && showAvgDiff) {
                        var sum = 0;
                        for (var i = 0, l = recentSpeeds.length; i < l; i++) {
                            sum += recentSpeeds[i];
                        }
                        currentAvgSpeed = sum / recentSpeeds.length;

                        var avgDiff = oldAvgSpeed - currentAvgSpeed;
                        var maxDiff = oldMaxSpeed - maxSpeed;
                        console.log("avgDiff", avgDiff);
                        console.log("maxDiff", maxDiff);
                        console.log('maxSpeed, avgSpeed, speed, INIT_SPEED, scale:', maxSpeed, currentAvgSpeed, actualSpeed, config.INITIAL_SPEED_EXPECTED, sphere.scale);

                        showAvgDiff = false;
                    }
                }
            }
        }

        return err;
    };
}();

Validators.foodCapture = function (model, fi, sphere_id, radius) {
    // sphere info
    var sphere = model.actors[sphere_id];

    // get food position
    var food_index = fi * 3;
    var food_x = model.food[food_index];
    var food_y = model.food[food_index + 1];
    var food_z = model.food[food_index + 2];

    // calculate dist and tolerance
    var foodPosition = new THREE.Vector3(food_x, food_y, food_z);
    var vdist = foodPosition.distanceTo(sphere.position);
    var tolerance = radius + config.FOOD_CAPTURE_ASSIST + config.FOOD_CAPTURE_EXTRA_TOLORANCE;

    if (config.DEBUG) {
        console.log("food capture vdist, tolerance", vdist, tolerance);
    }

    // Make sure the sphere is in range of the food being captured
    if (vdist > tolerance) {
        console.log('INVALID food capture', fi, sphere_id, vdist, tolerance);
        return Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR;
    }

    return 0;
};

Validators.playerCapture = function (attackingPlayerId, targetPlayerId, model, sendingSphere) {
    // Make sure target is in model
    if (!model.players[targetPlayerId]) {
        // target player not in model
        return Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
    }

    var otherSphere = undefined;
    var attackingPlayerSphere = model.players[attackingPlayerId].sphere;

    if (sendingSphere.playerId === attackingPlayerId) {
        otherSphere = model.players[targetPlayerId].sphere;
    } else {
        otherSphere = attackingPlayerSphere;
    }

    var captureDist = attackingPlayerSphere.radius() + config.PLAYER_CAPTURE_EXTRA_TOLORANCE;
    var aPosition = new THREE.Vector3();
    var bPosition = new THREE.Vector3();
    var vdist = null;
    var validCapture = false;

    // Check distances between sphere positions. iterate from the most recent position to the oldest position
    for (var i = sendingSphere.recentPositions.length - 1; i >= 0; i--) {
        aPosition.copy(sendingSphere.recentPositions[i].position);

        for (var j = otherSphere.recentPositions.length - 1; j >= 0; j--) {
            bPosition.copy(otherSphere.recentPositions[j].position);

            vdist = aPosition.distanceTo(bPosition);

            console.log("Validating player capture distance", vdist, captureDist);

            if (vdist < captureDist) {
                console.log("valid capture!");
                validCapture = true;
                break;
            }
        }

        if (validCapture) {
            break;
        }
    }

    if (!validCapture) {
        return Validators.ErrorCodes.PLAYER_CAPTURE_TO_FAR;
    }

    return 0;  // valid capture
};

module.exports = Validators;
