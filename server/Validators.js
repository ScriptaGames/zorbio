var config = require('../common/config.js');

var Validators = {};

Validators.ErrorCodes = {
    CAPTURE_PLAYER_NOT_IN_MODEL: 1,
    FOOD_CAPTURE_TO_FAR: 2,
    PLAYER_CAPTURE_TO_FAR: 3
};

Validators.speedLimit = function (model, new_position) {
    // TODO: validate player speed
    return 0; // something like:  difference( new_position, model.player.position ) <= config.BASE_PLAYER_SPEED;
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
        return Validators.ErrorCodes.CAPTURE_PLAYER_NOT_IN_MODEL;
    }

    // check that the attacking player was within range of the target player
    var attackingPlayer = model.players[attackingPlayerId];
    var attackingPlayerPositions = attackingPlayer.sphere.positionsWindow;

    var targetPlayer = model.players[targetPlayerId];
    var targetPlayerPositions = targetPlayer.sphere.positionsWindow;

    var positionsLength = Math.min(attackingPlayerPositions.length, targetPlayerPositions.length);
    var captureDist = attackingPlayer.sphere.radius() + config.PLAYER_CAPTURE_EXTRA_TOLORANCE;
    var aPosition = new THREE.Vector3();
    var tPosition = new THREE.Vector3();
    var vdist = null;
    var validCapture = false;

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
