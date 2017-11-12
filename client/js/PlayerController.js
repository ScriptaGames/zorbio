// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global UTIL:true
global THREE:true
global zorbioModel:true
global player:true
*/

/**
 * This is the Player Controller that is the C in MVC, it has model that syncs state to the server, and a view
 * for rendering.
 * @param {Object} model
 * @param {Object} scene
 * @param {boolean} current Is this the current player
 * @constructor
 */
ZOR.PlayerController = class ZORPlayerController {
    /**
     * @param {Object} model the Zorbio game model
     * @param {Object} scene the three.js scene
     * @param {Object} current whether this controller belongs to the current player
     */
    constructor(model, scene, current) {
        this.model = new ZOR.Player(model.id, model.name, model.sphere.color, model.type, model.sphere.position,
            model.sphere.scale, model.sphere.velocity, model.sphere.skin);
        this.isDead = false;
        this.is_current_player = current || false;
        this.lastSize = 0;  // last reported size, used to only update UI when there is a change
        this.score = this.model.getScore();
        this.lastScore = this.score; // last reported score, used to only update UI when there is a change

        this.move_forward_v = new THREE.Vector3();
        this.move_backward_v = new THREE.Vector3();

        this.holdPosition = false; // Toggle forward movement

        this.food_capture_queue = [];

        if (scene) {
            this.initView(scene);
        }

        this.model.abilities.speed_boost.on('activate', function() {
            ZOR.Sounds.sfx.woosh.play();
        });

        this.model.abilities.speed_boost.on('deactivate', function() {
            ZOR.Sounds.sfx.woosh.stop();
        });
    }

    /**
     * Queue food capture to send to server on next position update.
     * @param {Number} fi the captured food's index
     */
    queueFoodCapture(fi) {
        this.food_capture_queue.push({ fi: fi, radius: this.radius() });
    }

    /**
     * @return {Number} the player's id
     */
    getPlayerId() {
        return this.model.id;
    }

    /**
     * @return {Number} the player's sphere id
     */
    getSphereId() {
        return this.model.sphere.id;
    }

    /**
     * @return {Object} the player's current position
     */
    getPosition() {
        return this.view.mainSphere.position;
    }

    /**
     * Get the current value of the player's speed.
     * @returns {number}
     */
    getSpeed() {
        return this.model.getSpeed();
    }

    /**
     * @return {Number} the player's score
     */
    getScore() {
        return this.score;
    }

    /**
     * @param {Number} score The player's new score
     * @return {Number} the player's new score (same value that was passed in)
     */
    setScore(score) {
        return this.score = score;
    }

    /**
     * @return {Number} the player's current size
     */
    getSize() {
        return config.GET_PADDED_INT( this.model.sphere.scale );
    }

    /**
     * Set the player's sphere's alpha (transparency) value.
     * @param {Number} alpha
     */
    setAlpha(alpha) {
        if (this.view) {
            this.view.setAlpha(alpha);
        }
    }

    /**
     * Initialize this player's view.
     * @param {Object} scene the three.js scene
     */
    initView(scene) {
        this.view = new ZOR.PlayerView(this.model, scene, this.is_current_player, this.skinName);
    }

    /**
     * Remove this player's view from the scene.
     */
    removeView() {
        this.view.remove();
        this.view = undefined;
    }

    /**
     * Get remaining particle emitter time.
     * @return {Number} how long until emitters are finished
     */
    getWindDownTime() {
        let time = 0;

        if (this.view) {
            time = this.view.getCaptureEmitterLifetime();
        }

        return time;
    }

    /**
     * Grow the player.
     * @param {Number} amount amount by which to grow
     */
    grow(amount) {
        this.model.sphere.scale += amount;
    }

    /**
     * Sync sphere's position with player's position.
     */
    refreshSphereModel() {
        if (!this.view) {
            return;
        }

        // sync position
        this.model.sphere.position.copy(this.view.mainSphere.position);
    }

    /**
     * Handle this player being captured.
     */
    handleCapture() {
        this.isDead = true;
        this.view.handleCapture();
    }

    /**
     * Update this player's scale.
     * @param {Number} scale the player's new scale
     */
    updateScale(scale) {
        this.setScale(scale);
        this.view.update(scale);
    }

    /**
     * Update this player's draining.
     * @param {Number} drain_target_id the id of the player being drained
     */
    updateDrain(drain_target_id) {
        this.model.sphere.drain_target_id = drain_target_id;
        this.view.updateDrain( drain_target_id );
    }

    /**
     * Update this player's position.
     * @param {Object} position the player's new position
     */
    updatePosition(position) {
        this.model.sphere.position.copy(position);
        this.view.updatePosition(position);
    }

    /**
     * Returns the radius of the player sphere in terms of the sphere scale
     * @returns {number}
     */
    radius() {
        // calculate radius the same as the server
        return this.model.sphere.scale;
    }

    /**
     * Set this player's scale.
     * @param {Number} scale the player's new scale
     */
    setScale(scale) {
        this.model.sphere.scale = scale;
    }

    /**
     * Update tick for this player.
     * @param {Object} scene the three.js scene
     * @param {Object} camera the three.js camera
     * @param {Object} camera_controls the three.js camera controls
     * @param {Number} lag_scale the current lag scale factor
     */
    update(scene, camera, camera_controls, lag_scale) {
        // first update any player abilities
        this.model.abilities.speed_boost.update();

        if (config.AUTO_RUN_ENABLED) {
            this.moveForward(camera); // always move forward
        }
        this.applyVelocity(lag_scale, camera_controls);
        this.view.adjustCamera(this.radius());

        // Update drain
        this.view.updateDrain(this.model.sphere.drain_target_id);

        // check if we need to animate anything
        if (this._animated_grow_frames > 0) {
            this.view.grow(this._animated_grow_amount);
            this._animated_grow_frames--;
        }
    }

    /**
     * Apply current velocity to this player's position.
     * @param {Number} lag_scale the current lag scale factor
     * @param {Object} camera_controls the three.js camera controls
     */
    applyVelocity(lag_scale, camera_controls) {
        this.model.sphere.velocity.sub( camera_controls.velocityRequest );
        this.model.sphere.velocity.normalize();
        this.model.sphere.velocity.multiplyScalar( player.getSpeed() * lag_scale );

        this.view.mainSphere.position.sub(
            UTIL.adjustVelocityWallHit(
                this.view.mainSphere.position,
                0,
                this.model.sphere.velocity,
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
    }

    /**
     * Record a recent player position.
     */
    addRecentPosition() {
        let p = {
            x: this.view.mainSphere.position.x,
            y: this.view.mainSphere.position.y,
            z: this.view.mainSphere.position.z,
        };

        let time = Date.now() - this.model.createdTime;  // milliseconds since the player was created
        this.model.sphere.recentPositions.push({ position: p, radius: this.radius(), time: time });

        if (this.model.sphere.recentPositions.length > config.PLAYER_POSITIONS_WINDOW) {
            this.model.sphere.recentPositions.shift();  // remove the oldest position
        }
    }

    /**
     * Set velocity to zero.
     */
    resetVelocity() {
        this.model.sphere.velocity.set( 0, 0, 0 );
    }

    /**
     * Move the player forward at current velocity.
     * @param {Object} camera the three.js camera
     */
    moveForward(camera) {
        if (!this.holdPosition) {
            let v = this.move_forward_v;
            let mainSphere = this.view.mainSphere;
            v.copy( mainSphere.position );
            v.sub( camera.position );
            v.multiplyScalar( -1 );
            v.normalize();
            v.multiplyScalar( this.getSpeed() );
            this.model.sphere.velocity.add( v );
        }
    }

    /**
     * Move the player backward at current velocity.
     * @param {Object} camera the three.js camera
     */
    moveBackward(camera) {
        let v = this.move_backward_v;
        let mainSphere = this.view.mainSphere;
        v.copy( mainSphere.position );
        v.sub( camera.position );
        v.normalize();
        v.multiplyScalar( this.getSpeed() );
        this.model.sphere.velocity.add( v );
    }

    /**
     * Set new camera controls.
     * @param {Object} camera_controls three.js camera controls
     */
    setCameraControls(camera_controls) {
        this.view.setCameraControls(camera_controls);
    }

    /**
     * Start a speed boost.
     */
    speedBoostStart() {
        this.model.abilities.speed_boost.activate();
    }

    /**
     * Stop a speed boost.
     */
    speedBoostStop() {
        this.model.abilities.speed_boost.deactivate();
    }

    /**
     * @return {boolean} whether speed boost is currently active
     */
    isSpeedBoostActive() {
        return this.model.abilities.speed_boost.isActive();
    }

    /**
     * @return {boolean} whether speed boost is ready to be used
     */
    isSpeedBoostReady() {
        return this.model.abilities.speed_boost.isReady();
    }

    /**
     * Set the activity state of the speed boost on the model, for tracking other players speed boost.
     * NOTE: this does NOT activate speed boost, just sets the active flag for other players.
     * @param {boolean} state
     */
    setSpeedBoostActive(state) {
        this.model.abilities.speed_boost.active = state;
    }

    /**
     * Lock on to another player (to display their name).
     * @param {Number} player_id the player id of the player to lock onto
     */
    setTargetLock(player_id) {
        this.targeting_player_id = player_id;
    }

    /**
     * Get the id of the player current locked on to.
     * @return {Number} the player id of the player currently locked onto
     */
    getTargetLock() {
        return this.targeting_player_id;
    }
};
