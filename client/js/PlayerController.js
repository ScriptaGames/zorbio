/**
 * This is the Player Controller that is the C in MVC, it has model that syncs state to the server, and a view
 * for rendering.
 * @param model
 * @constructor
 */

var PlayerController = function ZORPlayerController(model) {
    var position = model.sphere.position;
    this.model = model;
    this.model.sphere.position = new THREE.Vector3(position.x, position.y, position.z);
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

PlayerController.prototype.grow = function ZORPlayerControllerGrow(ammount) {
    this.view.grow(ammount);
    this.model.sphere.radius = radius(this.view.mainSphere);
};

PlayerController.prototype.refreshSphereModel = function ZORPlayerControllerRefreshSphereModel() {
    // sync position
    this.model.sphere.position.copy(this.view.mainSphere.position);

    // sync radius
    this.model.sphere.radius = radius(this.view.mainSphere);
};
