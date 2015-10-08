/**
 * Actor represents any physical entity in the game world.  A player's sphere,
 * a bit of food, a portal, etc.
 */

var BABYLON = require('babylonjs');

HUG.Actor = function HUGActor(id) {
    this.id = id;
    this.position = new BABYLON.Vector3(0,0,0);
};
