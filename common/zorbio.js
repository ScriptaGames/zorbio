var NODEJS = typeof module !== 'undefined' && module.exports;

// if we're running in nodejs, import THREE.  for browser, assume it's
// already there.
if (NODEJS) var THREE = require('three');
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
    this.leaders = [];
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
    this.food = new Uint32Array(this.foodCount);

    /**
     * Tracks which food particles are currently respawning, on the server only!
     * @type {Int32Array}
     */
    this.food_respawning = new Uint32Array(this.foodCount);
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
    this.recentPositions = [];
};

/**
 * ZOR.PlayerSphere is a constructor for creating a player's sphere.
 */
ZOR.PlayerSphere = function ZORPlayerSphere(playerId, color, position, scale, velocity) {
    // call super class constructor
    ZOR.Actor.call(this);

    this.type = ZOR.ActorTypes.PLAYER_SPHERE;

    if (position) {
        this.position = new THREE.Vector3(position.x, position.y, position.z);
    }

    if (scale) {
        this.scale = scale;
        this.expectedScale = scale;
    } else {
        this.scale = config.INITIAL_PLAYER_RADIUS;
        this.expectedScale = config.INITIAL_PLAYER_RADIUS;
    }

    this.serverAdjust = 0;

    if (velocity) {
        this.velocity = velocity;
    }

    this.color = color;

    // maintain a reference to the player who owns this sphere
    this.playerId = playerId;

    this.id = this.playerId;
};
ZOR.PlayerSphere.prototype = Object.create(ZOR.Actor.prototype);
ZOR.PlayerSphere.constructor = ZOR.PlayerSphere;

/**
 * Returns the radius of the player sphere in terms of the sphere scale
 * @returns {number}
 */
ZOR.PlayerSphere.prototype.radius = function ZORPlayerSphereRadius() {
    // x, y, and z scale should all be the same for spheres
    return this.scale;
};

ZOR.PlayerSphere.prototype.growExpected = function ZORPlayerSphereGrowExpected(amount) {
    this.expectedScale += amount;
    if (this.expectedScale > config.MAX_PLAYER_RADIUS) {
        this.expectedScale = config.MAX_PLAYER_RADIUS;
    }
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
    this.createdTime = this.lastHeartbeat = Date.now();
    this.sphere = new ZOR.PlayerSphere(this.id, color, position, scale, velocity);

    // Stats
    this.foodCaptures = 0;
    this.playerCaptures = 0;
    this.spawnTime = 0;
    this.deathTime = 0;

    // Infractions
    this.infractions_food = 0;
    this.infractions_pcap = 0;
    this.infractions_speed = 0;
    this.infractions_scale = 0;
};


/**
 * pendingPlayerCaptures
 * This is in the model because it is code and state that is shared by the client and server
 */
ZOR.pendingPlayerCaptures = {};
ZOR.expirePendingPlayerCaptures = function ZORModelExpirePendingPlayerCaptures() {
    var playerIds = Object.getOwnPropertyNames(ZOR.pendingPlayerCaptures);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = +playerIds[i];  // make sure id is a number

        if (ZOR.pendingPlayerCaptures[id] > 0) {
            console.log("pending player capture expiring in: ", ZOR.pendingPlayerCaptures[id]);
            ZOR.pendingPlayerCaptures[id] -= config.SERVER_TICK_INTERVAL;
        } else {
            console.log("pending player capture expired for id:", id);
            delete ZOR.pendingPlayerCaptures[id];
        }
    }
};

/**
 * Static ID Generator, used to generate player IDs
 */
ZOR.IdGenerator = function ZORIdGenerator() {

    var next_id = 0;

    function get_next_id() {
        return ++next_id;
    }

    return {
        get_next_id : get_next_id
    };
}();

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR;

