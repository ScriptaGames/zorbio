let config    = require('../common/config.js');
let _         = require('lodash');
let alphakeys = require('./alphakeys');
let UTIL      = require('../common/util');
let profanity = require('./profanity');
let THREE     = require('three');

let Validators = {};

Validators.ErrorCodes = {
    PLAYER_NOT_IN_MODEL: 1,
    FOOD_CAPTURE_TO_FAR: 2,
    PLAYER_CAPTURE_TO_FAR: 3,
    NO_CHANGE: 4,
    SPEED_TO_FAST: 5,
    PLAYER_SCALE_TO_BIG: 6,
};

Validators.v3 = new THREE.Vector3();

Validators.is_profane = function(str) {
    return profanity.filter(str).indexOf('*') >= 0;
};

Validators.movement = function() {
    let MS_PER_FRAME = 1/60 * 1000;
    let recentSpeeds = [];
    let currentScale = 1;
    let currentAvgSpeed = 0;
    let oldAvgSpeed = 0;
    let showAvgDiff = true;
    let maxSpeed = 0;
    let oldMaxSpeed = 0;

    let point_a = new THREE.Vector3();
    let point_b = new THREE.Vector3();

    return function(sphere, actor, model) {
        if (!config.ENABLE_VALIDATION) return 0;

        // Give the player a grace period while they are loading before validating movement.
        let zPlayer = model.getPlayerById(actor.playerId);
        let curTime = Date.now();
        let timeSinceSpawn = curTime - zPlayer.spawnTime;
        if (timeSinceSpawn < config.LOADING_WAIT_DURATION) {
            return 0;
        }

        let latestPosition = sphere.latestPosition;

        if (sphere.oldestPosition) {
            let oldestPosition = sphere.oldestPosition;
            let time = latestPosition.time - oldestPosition.time;
            let minTime = ((config.PLAYER_POSITIONS_WINDOW * MS_PER_FRAME) - 100);

            //console.log("time, minTime: ", time, minTime);
            //console.log("recent positions length: ", actor.recentPositions.length);

            if (actor.recentPositions.length < config.PLAYER_POSITIONS_WINDOW || time < minTime) {
                return 0; // only can calculate enough time has passed
            }

            point_a.copy(oldestPosition.position);
            point_b.copy(latestPosition.position);

            // get distance from point A to point B
            let vdist = point_a.distanceTo(point_b);

            // find out what current speed should be based on scale
            let expectedSpeed;
            if (zPlayer.abilities.speed_boost.isActive()) {
                expectedSpeed = zPlayer.getSpeed();
            }
            else {
                expectedSpeed = config.PLAYER_GET_SPEED(oldestPosition.radius);
            }

            let maxToleratedSpeed = expectedSpeed + config.SPEED_EXTRA_TOLERANCE;
            let measuredSpeed = vdist / time;
            let actualSpeed = MS_PER_FRAME * measuredSpeed;

            // do the actual validation
            if (actualSpeed > maxToleratedSpeed) {
                // speeding
                console.log("Player Speed to fast! expected, tolerated, actual:", expectedSpeed, maxToleratedSpeed, actualSpeed, sphere.id);
                return Validators.ErrorCodes.SPEED_TO_FAST;
            }

            if (config.DEBUG) {
                // console.log("expected, tolerated, actual, dist, time:",
                //     expectedSpeed, maxToleratedSpeed, actualSpeed, vdist, time);

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
                    let sum = 0;
                    for (let i = 0, l = recentSpeeds.length; i < l; i++) {
                        sum += recentSpeeds[i];
                    }
                    currentAvgSpeed = sum / recentSpeeds.length;

                    let avgDiff = oldAvgSpeed - currentAvgSpeed;
                    let maxDiff = oldMaxSpeed - maxSpeed;
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

Validators.foodCapture = function(model, fi, sphere, radius) {
    if (!config.ENABLE_VALIDATION) return 0;

    // Make sure this actor is in the model
    if (!sphere) {
        return Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
    }

    // get food position
    let food_index = fi * 3;
    let food_x = model.food[food_index];
    let food_y = model.food[food_index + 1];
    let food_z = model.food[food_index + 2];

    // calculate dist and tolerance
    Validators.v3.set(food_x, food_y, food_z);
    let foodPosition = Validators.v3;
    let vdist = foodPosition.distanceTo(sphere.position);
    let tolerance = radius + config.FOOD_CAPTURE_ASSIST + config.FOOD_CAPTURE_EXTRA_TOLERANCE;

    // Make sure the sphere is in range of the food being captured
    if (vdist > tolerance) {
        console.log("----------------");
        console.log("INVALID: food capture: fi, sphere_id, radius, vdist, tolerance", fi, sphere.id, radius, vdist, tolerance);
        console.log("DEBUG: food capture: food_index, food_x, food_y, food_z", food_index, food_x, food_y, food_z);
        console.log("DEBUG: food capture: sphere_id, sphere_x, sphere_y, sphere_z", sphere.id, sphere.position.x, sphere.position.y, sphere.position.z);
        console.log("----------------");
        return Validators.ErrorCodes.FOOD_CAPTURE_TO_FAR;
    }

    return 0;
};

Validators.playerCapture = function(attackingPlayerId, targetPlayerId, model, sendingSphere) {
    if (!config.ENABLE_VALIDATION) return 0;

    // Make sure target is in model
    let targetPlayer = model.getPlayerById(targetPlayerId);

    if (!targetPlayer) {
        // target player not in model
        return Validators.ErrorCodes.PLAYER_NOT_IN_MODEL;
    }

    let otherSphere = undefined;
    let attackingPlayerSphere = model.getPlayerById(attackingPlayerId).sphere;

    if (sendingSphere.playerId === attackingPlayerId) {
        otherSphere = targetPlayer.sphere;
    }
    else {
        otherSphere = attackingPlayerSphere;
    }

    let captureDist = attackingPlayerSphere.radius() + config.PLAYER_CAPTURE_EXTRA_TOLERANCE;
    let aPosition = new THREE.Vector3();
    let bPosition = new THREE.Vector3();
    let vdist = undefined;
    let validCapture = false;

    // Check distances between sphere positions. iterate from the most recent position to the oldest position
    for (let i = sendingSphere.recentPositions.length - 1; i >= 0; i--) {
        aPosition.copy(sendingSphere.recentPositions[i].position);

        for (let j = otherSphere.recentPositions.length - 1; j >= 0; j--) {
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

Validators.playerSphereScale = function(sphere) {
    if (!config.ENABLE_VALIDATION) return 0;

    let recentPositions = sphere.recentPositions;

    // first make sure that we've given the client time to grow and sync with the server
    if (recentPositions.length < config.PLAYER_POSITIONS_WINDOW) {
        return 0;
    }

    let expectedScale = sphere.expectedScale;
    let actualScale = sphere.scale;

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
 * @returns {boolean}
 * @param key
 */
Validators.validAlphaKey = function ZORValidatorsValidAlphaKey(key) {
    if (!config.REQUIRE_ALPHA_KEY) return true;

    if (key) {
        return _.includes(alphakeys, key.toUpperCase());
    }

    return false;
};


module.exports = Validators;
