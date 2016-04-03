var ZOR = ZOR || {};

/**
 * This is the Player Controller that is the C in MVC, it has model that syncs state to the server, and a view
 * for rendering.
 * @param model
 * @param scene
 * @constructor
 *
 */
ZOR.PlayerController = function ZORPlayerController(model, main_sphere, scene) {
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

    this.food_capture_queue = [];

    if (scene) {
        this.initView(main_sphere, scene);
    }
};

ZOR.PlayerController.prototype.queueFoodCapture = function ZORPlayerControllerQueueFoodCapture(fi) {
    // queue food capture to send to server on next position update
    this.food_capture_queue.push({fi: fi, radius: this.radius()});
};

ZOR.PlayerController.prototype.getPlayerId = function ZORPlayerControllerGetPlayerId() {
    return this.model.id;
};

ZOR.PlayerController.prototype.getSphereId = function ZORPlayerControllerGetSphereId() {
    return this.model.sphere.id;
};

ZOR.PlayerController.prototype.getPosition = function ZORPlayerControllerGetPosition() {
    return this.view.mainSphere.position;
};

/**
 * Get the current value of the player's speed.
 * @returns {number}
 */
ZOR.PlayerController.prototype.getSpeed = function ZORPlayerControllerGetSpeed() {
    return this.model.getSpeed();
};

ZOR.PlayerController.prototype.initView = function ZORPlayerControllerInitView(main_sphere, scene) {
    this.view = new ZOR.PlayerView(this.model.sphere, main_sphere, scene);
};

ZOR.PlayerController.prototype.removeView = function ZORPlayerControllerRemoveView(scene) {
    this.view.remove(scene);
    this.view = undefined;
};

ZOR.PlayerController.prototype.grow = function ZORPlayerControllerGrow(amount) {
    this.model.sphere.scale += amount;
};

/**
 * Grow the player in an animation
 * @param amount Amount to grow
 * @param num_frames Number of frames to animate growth
 */
ZOR.PlayerController.prototype.animatedGrow = function ZORPlayerControllerAnimatedGrow(amount, num_frames) {
    this._animated_grow_frames = num_frames;
    this._animated_grow_amount = amount / num_frames;
};

ZOR.PlayerController.prototype.refreshSphereModel = function ZORPlayerControllerRefreshSphereModel() {
    if (!this.view) {
        return;
    }

    // sync position
    this.model.sphere.position.copy(this.view.mainSphere.position);
};

ZOR.PlayerController.prototype.updateScale = function ZORPlayerControllerUpdatePosition(scale) {
    this.setScale(scale);
    this.view.update(scale);
};

ZOR.PlayerController.prototype.updatePosition = function ZORPlayerControllerUpdatePosition(position, scene, camera, renderer) {
    this.model.sphere.position.copy(position);
    this.view.updatePosition(position, scene, camera, renderer);
};

/**
 * Returns the radius of the player sphere in terms of the sphere scale
 * @returns {number}
 */
ZOR.PlayerController.prototype.radius = function ZORPlayerControllerRadius() {
    // calculate radius the same as the server
    return this.model.sphere.radius();
};

ZOR.PlayerController.prototype.setScale = function ZORPlayerControllerSetScale(scale) {
    // set the scale on model
    this.model.sphere.scale = scale;
};

ZOR.PlayerController.prototype.update = function ZORPlayerControllerUpdate(scene, camera, camera_controls, lag_scale) {
    if (config.AUTO_RUN_ENABLED) {
        this.moveForward(camera); // always move forward
    }
    this.applyVelocity(lag_scale, camera_controls);
    this.view.adjustCamera(this.radius());

    // check if we need to animate anything
    if (this._animated_grow_frames > 0) {
        this.view.grow(this._animated_grow_amount);
        this._animated_grow_frames--;
    }
};

ZOR.PlayerController.prototype.applyVelocity = function ZORPlayerControllerApplyVelocity(lag_scale, camera_controls) {
    this.velocity.sub( camera_controls.velocityRequest );
    this.velocity.normalize();
    this.velocity.multiplyScalar( player.getSpeed() * lag_scale );

    this.view.mainSphere.position.sub(
        UTIL.adjustVelocityWallHit(
            this.view.mainSphere.position,
            0,
            this.velocity,
            zorbioModel.worldSize
        )
    );

    // sync position with model
    this.model.sphere.position.copy(this.view.mainSphere.position);

    // Save recent positions for speed validation on the server
    this.addRecentPosition();

    // reset the velocity requested by camera controls.  this should be done
    // inside the camera controls but I couldn't find a good place to do it.
    camera_controls.velocityRequest.set( 0, 0, 0 );
};

ZOR.PlayerController.prototype.addRecentPosition = function ZORPlayerControllerAddRecentPosition() {
    var p = {x: this.view.mainSphere.position.x, y: this.view.mainSphere.position.y, z: this.view.mainSphere.position.z};

    var time = Date.now() - this.model.createdTime;  // milliseconds since the player was created
    this.model.sphere.recentPositions.push({position: p, radius: this.radius(), time: time});

    if (this.model.sphere.recentPositions.length > config.PLAYER_POSITIONS_WINDOW) {
        this.model.sphere.recentPositions.shift();  // remove the oldest position
    }
};

ZOR.PlayerController.prototype.resetVelocity = function ZORPlayerControllerResetVelocity() {
    this.velocity.set( 0, 0, 0 );
};

ZOR.PlayerController.prototype.moveForward = function ZORPlayerControllerMoveForward(camera) {
    var v = this.move_forward_v;
    var mainSphere = this.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.multiplyScalar( -1 );
    v.normalize();
    v.multiplyScalar( this.getSpeed() );
    this.velocity.add( v );
};

ZOR.PlayerController.prototype.moveBackward = function ZORPlayerControllerMoveBackward(camera) {
    var v = this.move_backward_v;
    var mainSphere = this.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.normalize();
    v.multiplyScalar( this.getSpeed() );
    this.velocity.add( v );
};

ZOR.PlayerController.prototype.setCameraControls = function ZORPlayerControllerSetCameraControls(camera_controls) {
    this.view.setCameraControls(camera_controls);
};

ZOR.PlayerController.prototype.speedBoost = function ZORPlayerControllerSpeedBoost() {
    this.model.speedBoost = 5;
};
