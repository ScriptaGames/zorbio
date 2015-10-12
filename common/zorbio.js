var NODEJS = typeof module !== 'undefined' && module.exports;

// if we're running in nodejs, import BABYLON.  for browser, assume it's
// already there.
if (NODEJS) var BABYLON = require('babylonjs');

var ZOR = {};

/**
 * ZOR.Model is a constructor that creates a new game model.  The model is
 * responsible for storing the state of the game world.  Players, positions,
 * sizes, etc.  The model will be synchronized between the server and all the
 * clients, and the same Model code will be running on both server and clients.
 */
ZOR.Model = function ZORModel(worldSize, foodDensity) {
    this.actors = [];
    this.worldSize = new BABYLON.Vector3(worldSize, worldSize, worldSize);
    this.foodDensity = foodDensity;

    // Generate initial food actors based on world size
    this.initFood();
};

/**
 *  Initializes food for a new ZOR.Model
 */
ZOR.Model.prototype.initFood = function ZORInitFood() {
    var halfSize = this.worldSize.y / 2;
    var blockSize = this.worldSize.y / this.foodDensity;

    for (var i = 1; i < this.foodDensity; i++) {
        for (var j = 1; j < this.foodDensity; j++) {
            for (var k = 1; k < this.foodDensity; k++) {
                var food_x = halfSize - (i * blockSize) + getRandomIntInclusive(-blockSize, blockSize);
                var food_y = halfSize - (j * blockSize) + getRandomIntInclusive(-blockSize, blockSize);
                var food_z = halfSize - (k * blockSize) + getRandomIntInclusive(-blockSize, blockSize);
                var red = getRandomIntInclusive(0, 255);
                var green = getRandomIntInclusive(0, 255);
                var blue = getRandomIntInclusive(0, 255);
                var r_max = 0.09;
                var r_min = -0.02;
                var rotate_x = getRandomArbitrary(r_min, r_max);
                var rotate_y = getRandomArbitrary(r_min, r_max);
                var rotate_z = getRandomArbitrary(r_min, r_max);
                var color = BABYLON.Color3.FromInts(red, green, blue);
                var food = new ZOR.Food(food_x, food_y, food_z, 'cube', color, rotate_x, rotate_y, rotate_z);
                this.addActor(food);
            }
        }
    }
};

ZOR.Model.prototype.addActor = function ZORModelAddActor(actor) {
    this.actors.push(actor);
};

/**
 * ZOR.ActorTypes is a lookup table (enum basically) of all the types of actors
 * in Zorbio.
 */
ZOR.ActorTypes = Object.freeze({
    UNDEFINED : 'UNDEFINED',
    PLAYER    : 'PLAYER',
    FOOD      : 'FOOD',
    PORTAL    : 'PORTAL',
    OBSTACLE  : 'OBSTACLE',
    SPECTATOR : 'SPECTATOR'
});

/**
 * ZOR.Actor represents any physical entity in the game world.  A player's
 * sphere, a bit of food, a portal, etc.  Anything that appears inside the game
 * world.
 */
ZOR.Actor = function ZORActor() {
    this.position = new BABYLON.Vector3(0,0,0);
    this.velocity = new BABYLON.Vector3(0,0,0);
    this.geos = [];
    this.scale = 1;
    this.type = ZOR.ActorTypes.UNDEFINED;
};

/**
 * Adds a BabylonJS geometry (sphere, cube, whatever kind of 3d object) to this
 * actor.  This is a way of adding a reference from an Actor to its 3d object.
 */
ZOR.Actor.prototype.addGeometry = function ZORActorAddGeometry(geometry) {
    this.geos.push(geometry);
};

/**
 * ZOR.PlayerSphere is a constructor for creating a player's sphere.
 */
ZOR.PlayerSphere = function ZORPlayerSphere(playerId) {

    // call super class constructor
    ZOR.Actor.call(this);

    // TODO: algorithm to place users initial position, This was copied from agar.io.clone
    //var position = config.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);

    this.diameter = 1;
    this.throttle = 100; // 100% throttle default
    this.type     = ZOR.ActorTypes.PLAYER;

    //TODO: make color customizable
    this.color    = BABYLON.Color3.Red();

    // maintain a reference to the player who owns this sphere
    this.playerId   = playerId;
};

ZOR.PlayerSphere.prototype = Object.create(ZOR.Actor.prototype);
ZOR.PlayerSphere.constructor = ZOR.PlayerSphere;

/**
 * ZOR.Food is a constructor for creating a Food object.
 */
ZOR.Food = function ZORFood(x, y, z, shape, color, rotate_x, rotate_y, rotate_z) {
    // call super class constructor
    ZOR.Actor.call(this);

    this.type = ZOR.ActorTypes.FOOD;

    // Set the position
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    this.rotation = new BABYLON.Vector3(rotate_x, rotate_y, rotate_z);

    this.color = color;
    this.shape = shape;

};
ZOR.Food.prototype = Object.create(ZOR.Actor.prototype);
ZOR.Food.constructor = ZOR.Food;


/**
 * ZOR.Player is a constructor for creating a new player object.
 */
ZOR.Player = function ZORPlayer(id, name) {
    this.id = id;
    this.name = name;
    this.lastHeartbeat = new Date().getTime();
    this.sphere = new ZOR.PlayerSphere(this.id);
};

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR;


// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
