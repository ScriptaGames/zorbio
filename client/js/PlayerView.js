var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @constructor
 * @param model
 * @param scene
 */

ZOR.PlayerView = function ZORPlayerView(model, scene, current, skin) {
    this.model = model;
    this.scene = scene;
    this.is_current_player = current || false;

    var actor = model.sphere;

    playerFogCenter.copy(actor.position);

    this.setScale(actor.scale);

    this.drainView = new ZOR.DrainView(this, scene);

    this.skin = new ZOR.PlayerSkins[skin || 'default'](this);
};

ZOR.PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.skin.grow(amount);
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scale) {
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
    this.skin.update(scale);
};

ZOR.PlayerView.prototype.updateDrain = function ZORPlayerViewUpdateDrain(drain_target_id) {
    this.drainView.update( drain_target_id );
};

ZOR.PlayerView.prototype.updatePosition = function ZORPlayerViewUpdatePosition(position) {
    this.mainSphere.position.lerp(position, config.PLAYER_MOVE_LERP_WEIGHT);
};

ZOR.PlayerView.prototype.remove = function ZORPlayerViewRemove(scene) {
    this.drainView.dispose();
    this.skin.dispose();
};

ZOR.PlayerView.prototype.setScale = function ZORPlayerViewSetScale(scale) {
    this.skin.setScale(scale);
};

ZOR.PlayerView.prototype.setCameraControls = function ZORPlayerViewSetCameraControls(camera_controls) {
    this.camera_controls = camera_controls;
};

ZOR.PlayerView.prototype.adjustCamera = function ZORPlayerViewAdjustCamera(scale) {
    this.camera_controls.minDistance = scale / Math.tan( Math.PI * camera.fov / 360 ) + 100;
    this.camera_controls.maxDistance = this.camera_controls.minDistance;
};
