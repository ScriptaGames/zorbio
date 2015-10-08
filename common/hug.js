
// if we're running in nodejs, import BABYLON.  for browser, assume it's
// already there.
if (typeof module !== 'undefined' && module.exports) {
    var BABYLON = require('babylonjs');
}

var HUG = {};

/**
 * HUG.Model is a constructor that creates a new game model.  The model is
 * responsible for storing the state of the game world.  Players, positions,
 * sizes, etc.  The model will be synchronized between the server and all the
 * clients, and the same Model code will be running on both server and clients.
 */
HUG.Model = function HUGModel() {
    this.actors = [];
    this.worldsize = new BABYLON.Vector3(200, 200, 200);
};

HUG.Model.prototype.addActor = function HUGModelAddActor(actor) {
    this.actors.push(actor);
};

/**
 * HUG.Actor represents any physical entity in the game world.  A player's
 * sphere, a bit of food, a portal, etc.
 */
HUG.Actor = function HUGActor() {
    this.position = new BABYLON.Vector3(0,0,0);
    this.velocity = new BABYLON.Vector3(0,0,0);
    this.geos = [];
    this.scale = 1;
};

/**
 * Adds a BabylonJS geometry (sphere, cube, whatever kind of 3d object) to this
 * actor.  This is a way of adding a reference from an Actor to its 3d object.
 */
HUG.Actor.prototype.addGeometry = function HUGActorAddGeometry(geometry) {
    this.geos.push(geometry);
};

/**
 * HUG.PlayerSphere is a constructor for creating a player's sphere.
 */
HUG.PlayerSphere = function HUGPlayerSphere() {
    HUG.Actor.call(this); // call super class constructor
    this.diameter = 1;
};

HUG.PlayerSphere.prototype = Object.create(HUG.Actor.prototype);
HUG.PlayerSphere.constructor = HUG.PlayerSphere;


/**
 * HUG.Player is a constructor for creating a new player object.
 */
HUG.Player = function HUGPlayer(id, name) {
    this.id = id;
    this.name = name;
    this.sphere = new HUG.PlayerSphere();
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = HUG;
}
