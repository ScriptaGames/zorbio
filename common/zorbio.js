var NODEJS = typeof module !== 'undefined' && module.exports;

// if we're running in nodejs, import THREE.  for browser, assume it's
// already there.
if (NODEJS) var THREE = require('three');
if (NODEJS) var UTIL = require('./util.js');
if (NODEJS) var config = require('./config.js');
if (NODEJS) var _ = require('lodash');

var ZOR = ZOR || {};

/**
 * ZOR.Model is a constructor that creates a new game model.  The model is
 * responsible for storing the state of the game world.  Players, positions,
 * sizes, etc.  The model will be synchronized between the server and all the
 * clients, and the same Model code will be running on both server and clients.
 */
ZOR.Model = function ZORModel() {
    this.actors = [];
    this.players = [];
    this.leaders = [];
};

ZOR.Model.prototype.init = function ZORModelInit(worldSize, foodDensity) {
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
    this.foodCount = Math.pow(this.foodDensity - 1, 3);

    /**
     * Tracks which food particles are currently respawning, on the server only!
     * @type {Int32Array}
     */
    this.food_respawning = new Uint32Array(this.foodCount);
    this.food_respawning_indexes = [];

    /**
     * Food that has been captured that should be hidden, sent to client
     * @type {Array}
     */
    this.food_captured_queue = [];

    /**
     * Queue of food indexes that are ready to respawn, to be sent to the client
     * @type {Array}
     */
    this.food_respawn_ready_queue = [];

    var foodMap = UTIL.getFoodMap( config.FOOD_MAP_TYPE );
    this.food = foodMap( this.foodCount, this.foodDensity );
};

ZOR.Model.prototype.addActor = function ZORModelAddActor(actor) {
    if (!actor.id) {
        throw 'Actors must have an ID';
    }

    this.actors.push(actor);
};

/**
 * Reduce the model to just what is needed to sync state between client and server.  Helps reduce size of message
 * over the wire.
 * @returns Object
 */
ZOR.Model.prototype.reduce = function ZORModelReduce() {
    // Send the bare minimum to init the game on the client
    return {
        actors: this.reduceObjects(this.actors),
        players: this.reduceObjects(this.players),
        worldSize: this.worldSize,
        food: this.food,
        foodCount: this.foodCount,
        foodDensity: this.foodDensity,
        food_respawning: this.food_respawning,
        food_respawn_ready_queue: this.food_respawn_ready_queue,
        food_respawning_indexes: this.food_respawning_indexes,
    };
};

/**
 * Returns reduced array
 * @param array
 * @param tiny True if should be reduced to the smallest possible object
 * @returns {Array}
 */
ZOR.Model.prototype.reduceObjects = function ZORModelReduceObjects(array, tiny) {
    var reduced = [];

    // iterate over actors and reduce them
    array.forEach(function reduceEach(obj) {
        reduced.push(obj.reduce(tiny));
    });

    return reduced;
};

/**
 * Returns reduced actors array
 * @param tiny True if you want to reduce them to tiny actors
 * @returns {Array}
 */
ZOR.Model.prototype.reduceActors = function ZORModelReduceActors(tiny) {
    return this.reduceObjects(this.actors, tiny);
};

/**
 * Return the actor object matching id
 * @param id
 */
ZOR.Model.prototype.getActorById = function ZORModelGetActorById(id) {
    return this.actors[UTIL.findIndexById(this.actors, id)];
};

/**
 * Return the player object matching id
 * @param id
 */
ZOR.Model.prototype.getPlayerById = function ZORModelGetPlayersById(id) {
    return this.players[UTIL.findIndexById(this.players, id)];
};

/**
 * Return an array of non-bot players
 * @param id
 */
ZOR.Model.prototype.getRealPlayers = function ZORModelGetRealPlayers() {
    var real_players = [];

    for (var i = 0, l = this.players.length; i < l; i++) {
        var player = this.players[i];
        if (player.type === ZOR.PlayerTypes.PLAYER) {
            real_players.push( player );
        }
    }

    return real_players;
};

ZOR.Model.prototype.removePlayer = function ZORModelRemovePlayer(id) {
    var playerIndex = UTIL.findIndexById(this.players, id);
    var player = this.players[playerIndex];

    var actorIndex = _.findIndex(this.actors, function(o) { return o.playerId == id; });
    var actor = this.actors[actorIndex];

    if (player) {
        // check for corresponding actor
        actorIndex = UTIL.findIndexById(this.actors, player.sphere.id);
        actor = this.actors[actorIndex];

        // remove player from model
        this.players.splice(playerIndex, 1);
    }

    if (actor) {
        // remove the actor from the model
        this.actors.splice(actorIndex, 1);
    }
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

ZOR.Actor.prototype.reduce = function ZORActorReduce() {
    return this;  // Abstract method to be implemented by subclasses
};

ZOR.Actor.prototype.pushRecentPosition = function ZORActorPushRecentPosition(position) {

    // make a copy of the position
    position.position = new THREE.Vector3(position.position.x, position.position.y, position.position.z);

    if (this.recentPositions.length === 0) {
        this.recentPositions.push(position);
    }
    else {
        var latestTime = this.recentPositions[this.recentPositions.length - 1].time;
        var newTime = position.time;
        if (newTime > latestTime) {
            // only push on new positions to avoid duplicates
            this.recentPositions.push(position);

            while (this.recentPositions.length > config.PLAYER_POSITIONS_WINDOW) {
                this.recentPositions.shift();  // remove the oldest position
            }
        }
    }
};

/**
 * ZOR.PlayerSphere is a constructor for creating a player's sphere.
 */
ZOR.PlayerSphere = function ZORPlayerSphere(playerId, color, position, scale, velocity, skin) {
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

    if (velocity) {
        this.velocity = velocity;
        UTIL.toVector3(this, 'velocity');
    } else {
        this.velocity = {x: 0, y: 0, z: 0};
    }

    this.color = color;
    this.skin = skin;

    // Draining target actor ID
    this.drain_target_id = 0;

    this.speed_boosting = false;

    // maintain a reference to the player who owns this sphere
    this.playerId = playerId;

    this.id = this.playerId;
};
ZOR.PlayerSphere.prototype = Object.create(ZOR.Actor.prototype);
ZOR.PlayerSphere.constructor = ZOR.PlayerSphere;

/**
 * Returns the reduced actor with just the data important to sync between client and server
 * @returns {Object}
 */
ZOR.PlayerSphere.prototype.reduce = function ZORPlayerSphereReduce(tiny) {
    var is_tiny = tiny || false;

    var reducedActor = {
        id: this.id,
        position: this.position,
        velocity: this.velocity,
        scale: this.scale,
        drain_target_id: this.drain_target_id,
        speed_boosting: this.speed_boosting,
    };

    if (!is_tiny) {
        reducedActor.type = this.type;
        reducedActor.color = this.color;
        reducedActor.skin = this.skin;
        reducedActor.playerId = this.playerId;
    }

    return reducedActor
};

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
    else if (this.expectedScale < config.INITIAL_PLAYER_RADIUS) {
        this.expectedScale = config.INITIAL_PLAYER_RADIUS;
    }

    this.scale = this.expectedScale;
};

/**
 * ZOR.PlayerTypes Types of players
 */
ZOR.PlayerTypes = Object.freeze({
    SPECTATOR : 'SPECTATOR',
    PLAYER    : 'PLAYER',
    BOT       : 'BOT',
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
ZOR.Player = function ZORPlayer(id, name, color, type, position, scale, velocity, skin) {
    var self = this;
    this.id = id;
    this.name = name;
    this.type = type;
    this.createdTime = this.lastHeartbeat = Date.now();
    this.sphere = new ZOR.PlayerSphere(this.id, color, position, scale, velocity, skin);

    // Abilities
    this.abilities = {};
    this.abilities.speed_boost = new ZOR.SpeedBoostAbility(this.sphere);
    this.abilities.speed_boost.on('deactivate', function () {
        // start validating again at the regular speed
        self.sphere.recentPositions = [];
    });

    // Stats
    this.foodCaptures = 0;
    this.playerCaptures = 0;
    this.drainAmount = 0;
    this.spawnTime = 0;
    this.deathTime = 0;

    // Infractions
    this.infractions_food = 0;
    this.infractions_pcap = 0;
    this.infractions_speed = 0;
    this.infractions_scale = 0;

    // Client Metrics
    this.ping_metric = new ZOR.Metric(100);
    this.fps_metric = new ZOR.Metric(20, true);
    this.pp_send_metric = new ZOR.Metric(200);
    this.pp_receive_metric = new ZOR.Metric(200);
    this.au_receive_metric = new ZOR.Metric(200);
    this.buffered_amount_metric = new ZOR.Metric(320);
};

/**
 * Reduce the player to the bare minimum needed to sync between client and server
 */
ZOR.Player.prototype.reduce = function ZORPlayerReduce() {
    return {
        id: this.id,
        name: this.name,
        type: this.type,
        sphere: this.sphere.reduce(),
    }
};

/**
 * Reduce the player to the bare minimum needed to sync between client and server
 */
ZOR.Player.prototype.getMetrics = function ZORPlayerGetMetrics() {
    var metrics = this.reduce();
    metrics.ping = this.ping_metric;
    metrics.fps = this.fps_metric;
    metrics.pp_send = this.pp_send_metric;
    metrics.pp_receive = this.pp_receive_metric;
    metrics.au_receive = this.au_receive_metric;
    metrics.buffered_amount = this.buffered_amount_metric;

    return metrics;
};

ZOR.Player.prototype.getScore = function ZORPlayerGetScore() {
    return config.PLAYER_GET_SCORE(this.sphere.scale);
};

/**
 * Get's the players curent speed
 * @returns {number}
 */
ZOR.Player.prototype.getSpeed = function ZORPlayerGetScore() {
    var playerSpeed = config.PLAYER_GET_SPEED(this.sphere.scale);

    if (this.abilities.speed_boost.isActive()) {
        playerSpeed = playerSpeed * config.ABILITY_SPEED_BOOST_MULTIPLIER;
    }

    return playerSpeed;
};

/**
 * The range at which you should start checking for captures
 * @returns {number}
 */
ZOR.Player.prototype.getCaptureRange = function ZORPlayerCaptureRange() {
    return (this.getSpeed() * 3) + (this.sphere.scale * 2) + 10;
};

ZOR.Player.prototype.update = function ZORPlayerUpdate() {
    // call update on all definied abilities
    var ability_names = Object.getOwnPropertyNames(this.abilities);
    for (var i = 0, l = ability_names.length; i < l; i++) {
        var ability = this.abilities[ability_names[i]];
        ability.update();
    }
};

ZOR.Metric = function ZORMetric(threshold, reverse_threshold) {
    this.threshold = threshold;
    this.reverse_threshold = reverse_threshold || false;
    this.last_time = Date.now();
    this.series = [];
    this.mean = 0;
    this.max = 0;
    this.min = 0;
    this.threshold_exceeded_count = 0;
};

ZOR.Metric.prototype.add = function ZORMetricAdd(value) {
    value = +value; // make sure it's an int

    UTIL.pushShift(this.series, value, config.RECENT_CLIENT_DATA_LENGTH);

    this.mean = +_.mean(this.series).toFixed(3);
    this.max = _.max(this.series);
    this.min = _.min(this.series);

    if (this.reverse_threshold) {
        if (value < this.threshold) {
            this.threshold_exceeded_count++;
        }
    }
    else {
        if (value > this.threshold) {
            this.threshold_exceeded_count++;
        }
    }
};

ZOR.Ability = function ZORAbility() {
    var self = this;

    this.isActive   = undefined; // implemented by subclass
    this.activate   = undefined; // implemented by subclass
    this.deactivate = undefined; // implemented by subclass
    this.isReady    = undefined; // implemented by subclass
    this.update     = undefined; // implemented by subclass

    self.events = {
        activate: [],
        deactivate: [],
        update: [],
    };

    this.on = function ZORAbilityOn(eventName, func) {
        self.events[eventName].push(func);
    }
};

ZOR.SpeedBoostAbility = function ZORSpeedBoostAbility(sphere) {
    this.sphere = sphere;

    // call super class constructor
    ZOR.Ability.call(this);

    this.active = false;
    this.min_scale = config.ABILITY_SPEED_BOOST_MIN_SCALE;
    this.active_duration = 0;  // how long has the ability been active
    this.start_time = undefined;
    this.cooldown_delay = 0;  // how long before the ability starts cooling down

    /**
     * Returns true of this ability is ready to activate.
     * @returns {boolean}
     */
    this.isReady = function ZORSpeedBoostAbilityIsReady() {
        return !this.active && this.sphere.scale > this.min_scale;
    };

    /**
     * Is this ability active
     * @returns {boolean}
     */
    this.isActive = function ZORSpeedBoostAbilityIsActive() {
        return this.active;
    };

    /**
     * Activate this ability
     * @return {boolean}
     */
    this.activate = function ZORSpeedBoostAbilityActivate() {
        if (!this.isReady()) return false;

        this.active = true;
        this.start_time = Date.now() - this.active_duration;
        this.sphere.speed_boosting = true;
        this.cooldown_delay = 1000;

        // iterate over event listeners and execute them
        for (var i = 0; i < this.events.activate.length; i++) {
            if (typeof this.events.activate[i] === 'function') {
                this.events.activate[i]();
            }
        }

        return true;
    };

    this.deactivate = function ZORSpeedBoostAbilityDeactivate() {
        this.active = false;
        this.sphere.speed_boosting = false;
        this.start_time = undefined;

        // iterate over event listeners and execute them
        for (var i = 0; i < this.events.deactivate.length; i++) {
            if (typeof this.events.deactivate[i] === 'function') {
                this.events.deactivate[i]();
            }
        }
    };

    /**
     * Update this ability state
     */
    this.update = function ZORSpeedBoostAbilityUpdate() {
        if (!this.active) {
            if (this.cooldown_delay > 0) {
                this.cooldown_delay = Math.max(this.cooldown_delay - config.TICK_FAST_INTERVAL, 0);
            }
            else if (this.active_duration > 0) {
                // Cool down
                this.active_duration = Math.max(this.active_duration - config.TICK_FAST_INTERVAL, 0);
            }

            return;
        }

        this.active_duration = Date.now() - this.start_time;

        // iterate over event listeners and execute them
        for (var i = 0; i < this.events.update.length; i++) {
            if (typeof this.events.update[i] === 'function') {
                this.events.update[i]();
            }
        }

        // TODO: Add sphere poops based on interval while active
    };
};
ZOR.SpeedBoostAbility.prototype = Object.create(ZOR.Ability.prototype);
ZOR.SpeedBoostAbility.constructor = ZOR.SpeedBoostAbility;


/**
 * lock
 * Simple locking mechanisim
 */
ZOR.lock = {};
ZOR.expireLocks = function ZORExpireLocks() {
    var lockIds = Object.getOwnPropertyNames(ZOR.lock);
    for (var i = 0, l = lockIds.length; i < l; i++) {
        var id = lockIds[i];

        if (ZOR.lock[id] > 0) {
            console.log("Lock expiring in: ", id, ZOR.lock[id]);
            ZOR.lock[id] -= config.TICK_SLOW_INTERVAL;
        } else {
            console.log("lock expired:", id);
            delete ZOR.lock[id];
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

