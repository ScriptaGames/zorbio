var NODEJS = typeof module !== 'undefined' && module.exports;

// if we're running in nodejs, import THREE.  for browser, assume it's
// already there.
if (NODEJS) var THREE = require('three.js');
if (NODEJS) var UTIL = require('./util.js');
if (NODEJS) var config = require('./config.js');

var ZOR = ZOR || {};

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
    if (foodDensity > 0) {
        this.initFood();
    }
};

/**
 *  Initializes food for a new ZOR.Model
 */
ZOR.Model.prototype.initFood = function ZORInitFood() {
    var halfSize = this.worldSize.y / 2;
    var blockSize = this.worldSize.y / this.foodDensity;

    var ints = 3; // 6 for XYZ
    var offset = 0;

    this.foodCount = Math.pow(this.foodDensity - 1, 3);
    this.food = [];

    /**
     * Tracks which food particles are currently respawning, on the server only!
     * @type {Int32Array}
     */
    this.food_respawning = new Int32Array( this.foodCount );
    this.food_respawning_indexes = [];

    /**
     * Queue of food indexes that are ready to respawn, to be sent to the client
     * @type {Array}
     */
    this.food_respawn_ready_queue = [];

    for (var i = 1; i < this.foodDensity; ++i) {
        for (var j = 1; j < this.foodDensity; ++j) {
            for (var k = 1; k < this.foodDensity; ++k) {
                // set food position
                var x = halfSize - ( i * blockSize ) + UTIL.getRandomIntInclusive( -blockSize, blockSize );
                var y = halfSize - ( j * blockSize ) + UTIL.getRandomIntInclusive( -blockSize, blockSize );
                var z = halfSize - ( k * blockSize ) + UTIL.getRandomIntInclusive( -blockSize, blockSize );
                this.food[ offset ]     = x;
                this.food[ offset + 1 ] = y;
                this.food[ offset + 2 ] = z;

                offset += ints;
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
    this.scale = 1;
    this.type = ZOR.ActorTypes.UNDEFINED;
    this.positionsWindow = [];
};

/**
 * ZOR.PlayerSphere is a constructor for creating a player's sphere.
 */
ZOR.PlayerSphere = function ZORPlayerSphere(playerId, color, position, scale, velocity) {
    // call super class constructor
    ZOR.Actor.call(this);

    // TODO: algorithm to place users initial position, This was copied from agar.io.clone
    //var position = config.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);

    this.type   = ZOR.ActorTypes.PLAYER_SPHERE;

    if (position) {
        this.position = new THREE.Vector3(position.x, position.y, position.z);
    }
    if (scale) {
        this.scale = scale;
    }
    if (velocity) {
        this.velocity = velocity;
    }

    //TODO: make color customizable
    this.color = color;

    // maintain a reference to the player who owns this sphere
    this.playerId = playerId;

    this.id = this.type + '-' + this.playerId;
};
ZOR.PlayerSphere.prototype = Object.create(ZOR.Actor.prototype);
ZOR.PlayerSphere.constructor = ZOR.PlayerSphere;

/**
 * Returns the radius of the player sphere in terms of the sphere scale
 * @returns {number}
 */
ZOR.PlayerSphere.prototype.radius = function ZORPlayerSphereRadius() {
    // x, y, and z scale should all be the same for spheres
    return config.INITIAL_PLAYER_RADIUS * this.scale;
};

/**
 * ZOR.PlayerTypes Types of players
 */
ZOR.PlayerTypes = Object.freeze({
    SPECTATOR : 'SPECTATOR',
    PLAYER    : 'PLAYER'
});

/**
 * Zor Player model
 * @param id
 * @param name
 * @param color
 * @param type
 * @param position
 * @param scale
 * @param velocity
 * @constructor
 */
ZOR.Player = function ZORPlayer(id, name, color, type, position, scale, velocity) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.lastHeartbeat = new Date().getTime();
    this.sphere = new ZOR.PlayerSphere(this.id, color, position, scale, velocity);
    this.infractions = 0;
};

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR;

