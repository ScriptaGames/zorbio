var Validators = {};

Validators.ErrorCodes = {
    CAPTURE_PLAYER_NOT_IN_MODEL: 1
};

Validators.speedLimit = function (model, new_position) {
    // TODO: validate player speed
    return 0; // something like:  difference( new_position, model.player.position ) <= config.BASE_PLAYER_SPEED;
};

Validators.foodCapture = function (model) {
    // TODO: implement food capture validation
    return 0; // figure out if food capture is valid.
};

Validators.playerCapture = function (attackingPlayerId, targetPlayerId, model) {
    if (!model.players[targetPlayerId]) {
        // target player not in model
        console.log("Validators.playerCapture: targetPlayerId not in model: ", targetPlayerId);
        return Validators.ErrorCodes.CAPTURE_PLAYER_NOT_IN_MODEL;
    }

    // TODO: implement player capture cheat detection

    return 0; // figure out if player capture is valid.
};

module.exports = Validators;
