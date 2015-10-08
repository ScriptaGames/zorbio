
// if we're running in nodejs, import BABYLON.  for browser, assume it's
// already there.
if (typeof module !== 'undefined' && module.exports) {
    var BABYLON = require('babylonjs');
}

var Zorbio = {};

/**
 * Zorbio.Model is a constructor that creates a new game model.  The model is
 * responsible for storing the state of the game world.  Players, positions,
 * sizes, etc.  The model will be synchronized between the server and all the
 * clients, and the same Model code will be running on both server and clients.
 */
Zorbio.Model = function ZorbioModel() {
    this.actors = [];
    this.worldsize = new BABYLON.Vector3(200, 200, 200);
};

Zorbio.Model.prototype.addActor = function ZorbioModelAddActor(actor) {
    this.actors.push(actor);
};

/**
 * Zorbio.Actor represents any physical entity in the game world.  A player's
 * sphere, a bit of food, a portal, etc.
 */
Zorbio.Actor = function ZorbioActor() {
    this.position = new BABYLON.Vector3(0,0,0);
    this.velocity = new BABYLON.Vector3(0,0,0);
    this.geos = [];
    this.scale = 1;
};

/**
 * Adds a BabylonJS geometry (sphere, cube, whatever kind of 3d object) to this
 * actor.  This is a way of adding a reference from an Actor to its 3d object.
 */
Zorbio.Actor.prototype.addGeometry = function ZorbioActorAddGeometry(geometry) {
    this.geos.push(geometry);
};

/**
 * Zorbio.PlayerSphere is a constructor for creating a player's sphere.
 */
Zorbio.PlayerSphere = function ZorbioPlayerSphere() {
    Zorbio.Actor.call(this); // call super class constructor
    this.diameter = 1;
};

Zorbio.PlayerSphere.prototype = Object.create(Zorbio.Actor.prototype);
Zorbio.PlayerSphere.constructor = Zorbio.PlayerSphere;


/**
 * Zorbio.Player is a constructor for creating a new player object.
 */
Zorbio.Player = function ZorbioPlayer(id, name) {
    this.id = id;
    this.name = name;
    this.sphere = new Zorbio.PlayerSphere();
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = Zorbio;
}
