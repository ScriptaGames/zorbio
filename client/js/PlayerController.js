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
    this.model = new ZOR.Player(model.id, model.name, model.color, model.type, model.position, model.scale, model.velocity);
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
    this.view = new PlayerView(this.model.sphere, scene);
};

PlayerController.prototype.removeView = function ZORPlayerControllerRemoveView(scene) {
    this.view.remove(scene);
    this.view = null;
};

PlayerController.prototype.grow = function ZORPlayerControllerGrow(ammount) {
    this.view.grow(ammount);
    this.refreshSphereModel();
};

PlayerController.prototype.refreshSphereModel = function ZORPlayerControllerRefreshSphereModel() {
    if (!this.view) {
        return;
    }

    // sync position
    this.model.sphere.position.copy(this.view.mainSphere.position);

    // sync scale
    this.model.sphere.scale = this.view.mainSphere.scale.x;
};

PlayerController.prototype.updatePosition = function ZORPlayerControllerUpdatePosition(position, scene, camera, renderer) {
    this.model.sphere.position.copy(position);
    this.view.updatePosition(position, scene, camera, renderer);
};

/**
 * Returns the radius of the player sphere in terms of the sphere scale
 * @returns {number}
 */
PlayerController.prototype.radius = function ZORPlayerControllerRadius() {
    // calculate radius the same as the server
    return this.model.sphere.radius();
};

PlayerController.prototype.setScale = function ZORPlayerControllerSetScale(scale) {
    this.view.setScale(scale);
};
