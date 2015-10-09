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
ZOR.Model = function ZORModel() {
    this.actors = [];
    this.worldsize = new BABYLON.Vector3(200, 200, 200);
};

ZOR.Model.prototype.applyDiff = function ZORModelApplyDiff(newmodel) {
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
ZOR.PlayerSphere = function ZORPlayerSphere(player) {

    // call super class constructor
    ZOR.Actor.call(this);

    this.diameter = 1;
    this.type     = ZOR.ActorTypes.PLAYER;

    // maintain a reference to the player who owns this sphere
    this.player   = player;

};

ZOR.PlayerSphere.prototype = Object.create(ZOR.Actor.prototype);
ZOR.PlayerSphere.constructor = ZOR.PlayerSphere;


/**
 * ZOR.Player is a constructor for creating a new player object.
 */
ZOR.Player = function ZORPlayer(id, name) {
    this.id = id;
    this.name = name;
    this.sphere = new ZOR.PlayerSphere();
};

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR;
