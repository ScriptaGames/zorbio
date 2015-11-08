/**
 * This is the Player Controller that is the C in MVC, it has model that syncs state to the server, and a view
 * for rendering.
 * @param model
 * @param scene
 * @constructor
 *
 */
var PlayerController = function ZORPlayerController(model, scene) {
    var position = model.sphere.position;
    this.model = model;
    this.model.sphere.position = new THREE.Vector3(position.x, position.y, position.z);

    if (scene) {
        this.initView(scene);
    }
};

PlayerController.prototype.getPlayerId = function ZORPlayerControllerGetPlayerId() {
  return this.model.id;
};

PlayerController.prototype.getSphereId = function ZORPlayerControllerGetSphereId() {
    return this.model.sphere.id;
};

PlayerController.prototype.initView = function ZORPlayerControllerInitView(scene) {
    this.view = new PlayerView(this.model, scene);
};

PlayerController.prototype.removeView = function ZORPlayerControllerRemoveView(scene) {
    this.view.remove(scene);
    this.view = null;
};

PlayerController.prototype.grow = function ZORPlayerControllerGrow(ammount) {
    this.view.grow(ammount);
    this.model.sphere.radius = this.radius();
};

PlayerController.prototype.refreshSphereModel = function ZORPlayerControllerRefreshSphereModel() {
    // sync position
    this.model.sphere.position.copy(this.view.mainSphere.position);

    // sync radius
    this.model.sphere.radius = this.radius();
};

PlayerController.prototype.updatePosition = function ZORPlayerControllerUpdatePosition(position, scene, camera, renderer) {
    this.model.sphere.position.copy(position);
    this.view.updatePosition(position, scene, camera, renderer);
};

/**
 * Returns the radius of the player sphere in terms of the view main sphere scale
 * @returns {number}
 */
PlayerController.prototype.radius = function ZORPlayerControllerRadius() {
    if (this.view) {
        // x, y, and z scale should all be the same, always
        return config.INITIAL_PLAYER_RADIUS * this.view.mainSphere.scale.x;
    }
};
