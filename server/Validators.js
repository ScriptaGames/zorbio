var config = require('../common/config.js');
var _ = require('lodash');
var alphakeys = require('./alphakeys');
var UTIL = require('../common/util');
var profanity = require('profanity-censor');

var Validators = {};

Validators.ErrorCodes = {
    PLAYER_NOT_IN_MODEL: 1,
    FOOD_CAPTURE_TO_FAR: 2,
    PLAYER_CAPTURE_TO_FAR: 3,
    NO_CHANGE: 4,
    SPEED_TO_FAST: 5,
    PLAYER_SCALE_TO_BIG: 6
};

Validators.is_profane = function (str) {
    return profanity.filter(str).indexOf('*') >= 0;
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

    return function (sphere, actor, model) {
        if (!config.ENABLE_VALIDATION) return 0;

        // Give the player a grace period while they are loading before validating movement.
        var zPlayer = model.players[actor.playerId];
        var curTime = Date.now();
        var timeSinceSpawn = curTime - zPlayer.spawnTime;
        if (timeSinceSpawn < config.LOADING_WAIT_DURATION) {
            return 0;
        }

        var latestPosition = sphere.latestPosition;

        if (sphere.oldestPosition) {
            var oldestPosition = sphere.oldestPosition;
            var time = latestPosition.time - oldestPosition.time;
            var minTime = ((config.PLAYER_POSITIONS_WINDOW * msPerFrame) - 180);

            if (time < minTime) {
                return 0; // only can calculate enough time has passed
            }

            point_a.copy(oldestPosition.position);
            point_b.copy(latestPosition.position);

            // get distance from point A to point B
            var vdist = point_a.distanceTo(point_b);

            // find out what current speed should be based on scale
            var expectedSpeed = config.PLAYER_GET_SPEED(oldestPosition.radius);
            var maxToleratedSpeed = expectedSpeed + config.SPEED_EXTRA_TOLERANCE;
            var measuredSpeed = vdist / time;
            var actualSpeed = msPerFrame * measuredSpeed;

            // do the actual validation
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
                    console.log('maxSpeed, avgSpeed, speed, scale:', maxSpeed, currentAvgSpeed, actualSpeed, sphere.scale);

                    showAvgDiff = false;
                }
            }
        }

        return 0;
    };
}();

Validators.movementSampled = UTIL.nth( Validators.movement, config.MOVE_VALIDATION_SAMPLE_RATE );

Validators.foodCapture = function (model, fi, sphere_id, radius) {
    if (!config.ENABLE_VALIDATION) return 0;

    // sphere info
    var sphere = model.actors[sphere_id];

    // Make sure this actor is in the model
    if (!sphere) {
        return Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
    }

    // get food position
    var food_index = fi * 3;
    var food_x = model.food[food_index];
    var food_y = model.food[food_index + 1];
    var food_z = model.food[food_index + 2];

    // calculate dist and tolerance
    var foodPosition = new THREE.Vector3(food_x, food_y, food_z);
    var vdist = foodPosition.distanceTo(sphere.position);
    var tolerance = radius + config.FOOD_CAPTURE_ASSIST + config.FOOD_CAPTURE_EXTRA_TOLERANCE;

    if (config.DEBUG) {
        console.log("----------------");
        console.log("DEBUG: food capture: food_index, food_x, food_y, food_z", food_index, food_x, food_y, food_z);
        console.log("DEBUG: food capture: sphere_id, sphere_x, sphere_y, sphere_z", sphere_id, sphere.position.x, sphere.position.y, sphere.position.z);
        console.log("DEBUG: food capture: fi, sphere_id, radius, vdist, tolerance", fi, sphere_id, radius, vdist, tolerance);
        console.log("----------------");
    }

    // Make sure the sphere is in range of the food being captured
    if (vdist > tolerance) {
        console.log("----------------");
        console.log("INVALID: food capture: fi, sphere_id, radius, vdist, tolerance", fi, sphere_id, radius, vdist, tolerance);
        console.log("DEBUG: food capture: food_index, food_x, food_y, food_z", food_index, food_x, food_y, food_z);
        console.log("DEBUG: food capture: sphere_id, sphere_x, sphere_y, sphere_z", sphere_id, sphere.position.x, sphere.position.y, sphere.position.z);
        console.log("----------------");
        return Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR;
    }

    return 0;
};

Validators.playerCapture = function (attackingPlayerId, targetPlayerId, model, sendingSphere) {
    if (!config.ENABLE_VALIDATION) return 0;

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

    var captureDist = attackingPlayerSphere.radius() + config.PLAYER_CAPTURE_EXTRA_TOLERANCE;
    var aPosition = new THREE.Vector3();
    var bPosition = new THREE.Vector3();
    var vdist = undefined;
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

Validators.playerSphereScale = function (sphere) {
    if (!config.ENABLE_VALIDATION) return 0;

    var recentPositions = sphere.recentPositions;

    // first make sure that we've given the client time to grow and sync with the server
    if (recentPositions.length < config.PLAYER_POSITIONS_WINDOW) {
        return 0;
    }

    var expectedScale = sphere.expectedScale;
    var actualScale = sphere.scale;

    // make sure the expected scale within tolerance
    if (actualScale > (expectedScale + config.PLAYER_SCALE_EXTRA_TOLERANCE)) {
        console.log("player to big expectedScale, actualScale: ", expectedScale, actualScale);
        return Validators.ErrorCodes.PLAYER_SCALE_TO_BIG;
    }

    return 0;  //no error
};

/**
 * Checks for a valid nick
 *
 * @param {String} nickname
 * @returns {boolean}
 */
Validators.validAlphaKey = function ZORValidatorsValidAlphaKey(key) {
    if (!config.REQUIRE_ALPHA_KEY) return true;
    return _.includes(alphakeys, key);
};


module.exports = Validators;
