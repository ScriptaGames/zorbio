var Validators = {};

Validators.speedLimit = function (model, new_position) {
    // TODO: validate player speed
    return true; // something like:  difference( new_position, model.player.position ) <= config.BASE_PLAYER_SPEED;
};

Validators.foodCapture = function (model) {
    // TODO: implmenet food capture validation
    return true; // figure out if food capture is valid.
};

Validators.playerCapture = function (model) {
    // TODO: implmenet player capture validation
    return true; // figure out if player capture is valid.
};

module.exports = Validators;
