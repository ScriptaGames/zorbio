var NODEJS = typeof module !== 'undefined' && module.exports;

// if we're running in nodejs, import THREE.  for browser, assume it's
// already there.
if (NODEJS) var THREE = require('three.js');
if (NODEJS) var UTIL = require('./util.js');

var ZOR = {};

/**
 * ZOR.Model is a constructor that creates a new game model.  The model is
 * responsible for storing the state of the game world.  Players, positions,
 * sizes, etc.  The model will be synchronized between the server and all the
 * clients, and the same Model code will be running on both server and clients.
 */
ZOR.Model = function ZORModel(worldSize, foodDensity) {
    this.actors = {};
    this.players = {};
    this.worldSize = new THREE.Vector3(worldSize, worldSize, worldSize);
    this.foodDensity = foodDensity;

    // Generate initial food positions and colors based on world size
    this.initFood();
};

/**
 *  Initializes food for a new ZOR.Model
 */
ZOR.Model.prototype.initFood = function ZORInitFood() {
    var halfSize = this.worldSize.y / 2;
    var blockSize = this.worldSize.y / this.foodDensity;

    var size = 6; // 6 for XYZRGB
    var offset = 0;

    this.foodCount = Math.pow(this.foodDensity, 3);
    this.food = [];

    for (var i = 1; i < this.foodDensity; i++) {
        for (var j = 1; j < this.foodDensity; j++) {
            for (var k = 1; k < this.foodDensity; k++) {
                // set food position
                this.food[offset]     = halfSize - (i * blockSize) + UTIL.getRandomIntInclusive(-blockSize, blockSize);
                this.food[offset + 1] = halfSize - (j * blockSize) + UTIL.getRandomIntInclusive(-blockSize, blockSize);
                this.food[offset + 2] = halfSize - (k * blockSize) + UTIL.getRandomIntInclusive(-blockSize, blockSize);

                // set food color
                this.food[offset + 3] = UTIL.getRandomIntInclusive(0, 255);
                this.food[offset + 4] = UTIL.getRandomIntInclusive(0, 255);
                this.food[offset + 5] = UTIL.getRandomIntInclusive(0, 255);

                offset += size;
            }
        }
    }
};

ZOR.Model.prototype.addActor = function ZORModelAddActor(actor) {
    if (!actor.id) {
        throw 'Actors must have an ID';
    }

    this.actors[actor.id] = actor;
};

/**
 * ZOR.ActorTypes is a lookup table (enum basically) of all the types of actors
 * in Zorbio.
 */
ZOR.ActorTypes = Object.freeze({
    UNDEFINED     : 'UNDEFINED',
    PLAYER_SPHERE : 'PLAYER_SPHERE',
    FOOD          : 'FOOD',
    PORTAL        : 'PORTAL',
    OBSTACLE      : 'OBSTACLE',
    SPECTATOR     : 'SPECTATOR'
});

/**
 * ZOR.Actor represents any physical entity in the game world.  A player's
 * sphere, a bit of food, a portal, etc.  Anything that appears inside the game
 * world.
 */
ZOR.Actor = function ZORActor() {
    this.position = new THREE.Vector3(0,0,0);
    this.velocity = new THREE.Vector3(0,0,0);
    this.geo = null;
    this.scale = 1;
    this.type = ZOR.ActorTypes.UNDEFINED;
};

/**
 * ZOR.PlayerSphere is a constructor for creating a player's sphere.
 */
ZOR.PlayerSphere = function ZORPlayerSphere(playerId, color) {
    // call super class constructor
    ZOR.Actor.call(this);

    // TODO: algorithm to place users initial position, This was copied from agar.io.clone
    //var position = config.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);

    this.diameter = 1;
    this.throttle = 100; // 100% throttle default
    this.type     = ZOR.ActorTypes.PLAYER_SPHERE;

    //TODO: make color customizable
    this.color    = color;

    // maintain a reference to the player who owns this sphere
    this.playerId   = playerId;

    this.id = this.type + '-' + this.playerId;
};
ZOR.PlayerSphere.prototype = Object.create(ZOR.Actor.prototype);
ZOR.PlayerSphere.constructor = ZOR.PlayerSphere;

/**
 * ZOR.Food is a constructor for creating a Food object.
 * @param [x]
 * @param [y]
 * @param [z]
 * @param [shape]
 * @param [color]
 * @param [rotate_x]
 * @param [rotate_y]
 * @param [rotate_z]
 * @constructor
 */
ZOR.Food = function ZORFood(x, y, z, shape, color, rotate_x, rotate_y, rotate_z) {
    x = x || 0;
    y = y || 0;
    z = z || 0;
    shape = shape || 'sphere';
    color = color || new THREE.Color(THREE.ColorKeywords.red);
    rotate_x = rotate_x || 0;
    rotate_y = rotate_y || 0;
    rotate_z = rotate_z || 0;

    // call super class constructor
    ZOR.Actor.call(this);

    this.type = ZOR.ActorTypes.FOOD;

    this.id = this.type + '-' + x + ',' + y + ',' + z;

    // Set the position
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    this.rotation = new THREE.Vector3(rotate_x, rotate_y, rotate_z);

    this.color = color;
    this.shape = shape;

};
ZOR.Food.prototype = Object.create(ZOR.Actor.prototype);
ZOR.Food.constructor = ZOR.Food;


/**
 * ZOR.PlayerTypes Types of players
 */
ZOR.PlayerTypes = Object.freeze({
    SPECTATOR : 'SPECTATOR',
    PLAYER    : 'PLAYER'
});

/**
 * ZOR.Player is a constructor for creating a new player object.
 */
ZOR.Player = function ZORPlayer(id, name, color, type) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.lastHeartbeat = new Date().getTime();
    this.sphere = new ZOR.PlayerSphere(this.id, color);
};

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR;

