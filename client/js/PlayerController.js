/**
 * This is the Player Controller that is the C in MVC, it has model that syncs state to the server, and a view
 * for rendering.
 * @param model
 * @param scene
 * @constructor
 *
 */
var PlayerController = function ZORPlayerController(model, scene) {
    this.model = new ZOR.Player(model.id, model.name, model.sphere.color, model.type, model.sphere.position,
        model.sphere.scale, model.sphere.velocity);
    this.isDead = false;

    /**
     * Player velocity
     * @type {THREE.Vector3}
     */
    this.velocity = new THREE.Vector3();

    this.move_forward_v = new THREE.Vector3();
    this.move_backward_v = new THREE.Vector3();

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

PlayerController.prototype.getPosition = function ZORPlayerControllerGetPosition() {
    return this.view.mainSphere.position;
};

/**
 * Get the current value of the player's speed.
 * @returns {number}
 */
PlayerController.prototype.getSpeed = function ZORPlayerControllerGetSpeed() {
    return this.radius() / (config.MAX_PLAYER_RADIUS/-2) + config.BASE_PLAYER_SPEED;
};

PlayerController.prototype.initView = function ZORPlayerControllerInitView(scene) {
    this.view = new PlayerView(this.model.sphere, scene);
};

PlayerController.prototype.removeView = function ZORPlayerControllerRemoveView(scene) {
    this.view.remove(scene);
    this.view = null;
};

PlayerController.prototype.grow = function ZORPlayerControllerGrow(amount) {
    this.view.grow(amount);
    this.refreshSphereModel();
};

/**
 * Grow the player in an animation
 * @param amount Amount to grow
 * @param num_frames Number of frames to animate growth
 */
PlayerController.prototype.animatedGrow = function ZORPlayerControllerAnimatedGrow(amount, num_frames) {
    this._animated_grow_frames = num_frames;
    this._animated_grow_amount = amount / num_frames;
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

PlayerController.prototype.update = function ZORPlayerControllerUpdate(scene, camera, camera_controls) {
    this.moveForward(camera); // always move forward
    this.applyVelocity(camera_controls);
    this.view.update(scene, camera, camera_controls);

    // check if we need to animate anything
    if (this._animated_grow_frames > 0) {
        this.view.grow(this._animated_grow_amount);
        this._animated_grow_frames--;
    }
};

PlayerController.prototype.applyVelocity = function ZORPlayerControllerApplyVelocity(camera_controls) {
    this.velocity.sub( camera_controls.velocityRequest );
    this.velocity.normalize();
    this.velocity.multiplyScalar( player.getSpeed() );

    this.view.mainSphere.position.sub(
        UTIL.adjustVelocityWallHit(
            this.view.mainSphere.position,
            this.radius(),
            this.velocity,
            zorbioModel.worldSize
        )
    );

    // reset the velocity requested by camera controls.  this should be done
    // inside the camera controls but I couldn't find a good place to do it.
    camera_controls.velocityRequest.set( 0, 0, 0 );
};

PlayerController.prototype.resetVelocity = function ZORPlayerControllerResetVelocity() {
    this.velocity.set( 0, 0, 0 );
};

PlayerController.prototype.moveForward = function ZORPlayerControllerMoveForward(camera) {
    var v = this.move_forward_v;
    var mainSphere = this.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.multiplyScalar( -1 );
    v.normalize();
    v.multiplyScalar( this.getSpeed() );
    this.velocity.add( v );
};

PlayerController.prototype.moveBackward = function ZORPlayerControllerMoveBackward(camera) {
    var v = this.move_backward_v;
    var mainSphere = this.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.normalize();
    v.multiplyScalar( this.getSpeed() );
    this.velocity.add( v );
};

