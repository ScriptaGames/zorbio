// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true,
 ZOR:true,
 UTIL:true,
 THREE:true,
 _:true,
 playerFogCenter:true,
 SPE:true,
 camera:true
*/

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @constructor
 * @param model
 * @param scene
 * @param current Is this the current player
 */

ZOR.PlayerView = class PlayerView {
    /**
     * @param {ZOR.Model} model the Zorbio model
     * @param {THREE.Scene} scene the three.js scene
     * @param {Boolean} current whether this PlayerView belongs to the current player
     */
    constructor(model, scene, current) {
        this.model = model;
        this.scene = scene;
        this.is_current_player = current || false;
        this.playerColor = config.COLORS[model.sphere.color];
        this.skinName = model.sphere.skin || 'default';

        this.clock = new THREE.Clock();

        this.trail = {
            initialized: false,
        };

        this.cameraMinDistance = config.GET_CAMERA_MIN_DISTANCE(model.sphere.scale);

        this.skin = ZOR.SkinFactory.createSkin(this.skinName, this);

        playerFogCenter.copy(model.sphere.position);

        if (config.FOOD_ALPHA_ENABLED) {
            this.skin.material.depthWrite = true;
        }

        this.spherePool = ZOR.Pools[this.skin.poolname];
        this.mainSphere = this.spherePool.borrow();
        this.mainSphere.position.copy(model.sphere.position);
        this.mainSphere.material = this.skin.material;

        if (!current) {
            this.setAlpha(true);
            this.dangerView = ZOR.Pools.dangerViews.borrow();
            this.dangerView.setPlayerView(this);
            this.dangerView.show();
        }

        this.drainView = ZOR.Pools.drainViews.borrow();
        this.drainView.setPlayerView(this);

        this.playerName = ZOR.Pools.playerNames.borrow();
        this.playerName.onReady(() => {
            scene.add(this.playerName.textMesh);
            this.playerName.setName(this.model.name);
            this.playerName.setColor(this.playerColor);
        });

        this.setScale(model.sphere.scale);

        this.mainSphere.player_id = this.model.id;
        ZOR.Game.player_meshes.push(this.mainSphere);  // store mesh for raycaster search

        this.initCaptureParticles();

        scene.add( this.mainSphere );
        scene.add( this.drainView.mesh );
        if (this.dangerView) {
            scene.add( this.dangerView.mesh );
        }

        // give the meshes time to render before drawing trails
        // also adds a nice fade in effect for trails
        setTimeout(() => this.initTrails(), 250);
    }

    /**
     * Initialize the trail.
     */
    initTrails() {
        switch (this.skin.trail.type) {
            case 'line':
                this.initLineTrails();
                break;
            case 'particle':
                this.initParticleTrails();
                break;
        }

        // Add the config handler
        ZOR.UI.on(ZOR.UI.ACTIONS.TOGGLE_OWN_TRAIL, (context, e) => {
            if (this.is_current_player) {
                if (e.target.checked) {
                    this.hideTrails();
                    ZOR.UI.setAndSave('hide_own_trail', true);
                }
                else {
                    this.showTrails();
                    ZOR.UI.setAndSave('hide_own_trail', false);
                }
            }
        });

        // Default visibility from local storage
        if (config.HIDE_OWN_TRAIL && this.is_current_player) {
            this.hideTrails();
        }
    }

    /**
     * Init the player capture particle emitter.
     */
    initCaptureParticles() {
        this.capture = {};
        this.capture.group = new SPE.Group(this.skin.capture.group);
        this.capture.emitter = new SPE.Emitter(this.skin.capture.emitter);
        this.capture.emitter.disable();
        this.capture.group.addEmitter(this.capture.emitter);
        this.capture.group.mesh.frustumCulled = false;
        this.capture.group.mesh.renderOrder = -1;
        this.capture.active = false;

        this.scene.add( this.capture.group.mesh );
    }

    /**
     * Init the particle trail.  Only called if the active skin uses particle trails.
     */
    initParticleTrails() {
        this.trail.group = new SPE.Group(this.skin.trail.group);

        this.trail.emitter = new SPE.Emitter(this.skin.trail.emitter);

        this.trail.group.mesh.renderOrder = -2;
        this.trail.group.mesh.frustumCulled = false;
        this.trail.group.addEmitter( this.trail.emitter );
        this.trail.visible = 1;

        this.scene.add( this.trail.group.mesh );

        this.trail.initialized = true;
    }

    /**
     * Init the line trail.  Only called if the active skin uses line trails.
     */
    initLineTrails() {
        // Create the line material
        this.trail.material = new THREE.MeshLineMaterial( {
            useMap         : 0,
            color          : this.skin.trail.color,
            opacity        : 1,
            resolution     : new THREE.Vector2( window.innerWidth, window.innerHeight ),
            sizeAttenuation: 1,
            lineWidth      : this.skin.trail.customScale * config.TRAIL_LINE_WIDTH,
            near           : camera.near,
            far            : camera.far,
            depthTest      : true,
            blending       : THREE.AdditiveBlending,
            transparent    : false,
            side           : THREE.DoubleSide,
            visibility     : 1,
        });

        const TRAIL_LENGTH = this.is_current_player ? config.PLAYER_TRAIL_LINE_LENGTH : config.TRAIL_LINE_LENGTH;
        this.trail.origins = [];
        this.trail.geometries = [];
        this.trail.lines = [];
        this.trail.meshes = [];

        // for each line this skin requests...
        for (let line_i = 0; line_i < this.skin.trail.origins.length; ++line_i) {
            // transform the line's origins from sphere space to world space
            this.trail.origins[line_i] = this.mainSphere.localToWorld(this.skin.trail.origins[line_i].clone());

            // create a geometry for the line's vertices
            this.trail.geometries[line_i] = new THREE.Geometry();

            // create initial vertices for the line
            for (let vertex_i = 0; vertex_i < TRAIL_LENGTH; ++vertex_i) {
                this.trail.geometries[line_i].vertices.push(this.trail.origins[line_i]);
            }

            // create the line's mesh
            this.trail.lines[line_i] = new THREE.MeshLine();
            this.trail.lines[line_i].setGeometry( this.trail.geometries[line_i], this.skin.trail.lineWidth ); // makes width taper

            this.trail.meshes[line_i] = new THREE.Mesh( this.trail.lines[line_i].geometry, this.trail.material );
            this.trail.meshes[line_i].frustumCulled = false;
            this.scene.add( this.trail.meshes[line_i] );
        }

        this.trail.initialized = true;
    }

    /**
     * Hide this player's trail.
     */
    hideTrails() {
        if (!this.trail.initialized) return;

        switch (this.skin.trail.type) {
            case 'line':
                this.hideLineTrails();
                break;
            case 'particle':
                this.hideParticleTrails();
                break;
        }
    }

    /**
     * Show this player's trail.
     */
    showTrails() {
        if (!this.trail.initialized) return;

        switch (this.skin.trail.type) {
            case 'line':
                this.showLineTrails();
                break;
            case 'particle':
                this.showParticleTrails();
                break;
        }
    }

    /**
     * Hide this player's line trail.  Only called if the active skin has a line trail.
     */
    hideLineTrails() {
        // hide line trail
        this.trail.material.transparent = true;
        this.trail.material.depthTest = false;
        this.trail.material.visible = false;
        this.trail.material.uniforms.opacity.value = 0;
        this.trail.material.uniforms.visibility.value = 0;
    }

    /**
     * Hide this player's particle trail.  Only called if the active skin has a particle trail.
     */
    hideParticleTrails() {
        this.trail.visible = 0;
    }

    /**
     * Show this player's line trail.  Only called if the active skin has a line trail.
     */
    showLineTrails() {
        // hide line trail
        this.trail.material.transparent = false;
        this.trail.material.depthTest = true;
        this.trail.material.visible = true;
        this.trail.material.uniforms.opacity.value = 1;
        this.trail.material.uniforms.visibility.value = 1;
    }

    /**
     * Show this player's particle trail.  Only called if the active skin has a particle trail.
     */
    showParticleTrails() {
        this.trail.visible = 1;
    }

    /**
     * Frame update tick for trails.
     */
    updateTrails() {
        switch (this.skin.trail.type) {
            case 'line':
                this.updateLineTrails();
                break;
            case 'particle':
                this.updateParticleTrails();
                break;
        }
    }

    /**
     * Frame update tick for particle trails.
     */
    updateParticleTrails() {
        if (!this.trail.initialized) return;

        let newPos = this.mainSphere.position.clone();

        this.trail.emitter.position._value.x = newPos.x;
        this.trail.emitter.position._value.y = newPos.y;
        this.trail.emitter.position._value.z = newPos.z;

        let scale = this.mainSphere.scale.x * (this.skin.trail.customScale || 1);
        this.trail.emitter.position._spreadClamp.setX( scale );
        this.trail.emitter.position._spread.setX( scale );
        this.trail.emitter.position._radius = scale;
        this.trail.emitter.size._value =  [scale/3, scale*2/6, scale/9, 0];

        let boosting = this.model.abilities.speed_boost.isActive();

        if (boosting) {
            this.trail.emitter.activeMultiplier = 1 * this.trail.visible;
        }
        else {
            this.trail.emitter.activeMultiplier = 0.1 * this.trail.visible;
        }

        this.trail.emitter.updateFlags.position = true;
        this.trail.emitter.updateFlags.velocity = true;
        this.trail.emitter.updateFlags.size = true;

        this.trail.group.tick( this.clock.getDelta() );
    }

    /**
     * Frame update tick for line trails.
     */
    updateLineTrails() {
        if (!this.trail.initialized) return;

        // Increase trail width based on sphere scale but prevent giant width trails
        this.trail.material.uniforms.lineWidth.value = this.skin.trail.customScale * config.TRAIL_LINE_WIDTH
            * (1 + (this.mainSphere.scale.x  / 10));

        for (let line_i = 0; line_i < this.skin.trail.origins.length; ++line_i) {
            this.trail.lines[line_i].advance(this.mainSphere.localToWorld(this.skin.trail.origins[line_i].clone()));
        }
    }

    /**
     * Update player name position.
     */
    updatePlayerName() {
        if (this.playerName.textMesh) {
            let playerScale = this.mainSphere.scale.x;

            // position the player name relative to the player sphere
            this.playerName.textMesh.position.copy(this.model.sphere.position);

            // orient the player name relative to the camera
            this.playerName.textMesh.lookAt(camera.position);
            this.playerName.textMesh.up.copy(camera.up);

            // move the player name up above the sphere
            this.playerName.textMesh.position.add(camera.up.clone().multiplyScalar(playerScale * (1.2)));

            // adjust the player name scale to be relative to the player sphere
            const cameraDistance = camera.position.clone().sub(this.playerName.textMesh.position).length();
            const textScale = (cameraDistance/2 + playerScale) / 100;
            this.playerName.textMesh.scale.set(textScale, textScale, textScale );
        }
    }

    /**
     * Grow the player's size by a given amount.  This function lerps the size of the sphere.
     *
     * @param {Number} amount how much the player grew
     */
    grow(amount) {
        this.mainSphere.scale.addScalar( amount );
        this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );

        // Don't know if we need to do this every frame or at all
        // It is very expensive, accounts for 50% of the time spent in animate()
        // this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
    }

    /**
     * Called when this player is captured.  Triggers animations, etc.
     */
    handleCapture() {
        this.capture.active = true;

        // Hide all view elements except for capture particles
        this.scene.remove(this.mainSphere);
        this.drainView.hide();
        if (this.dangerView) {
            this.dangerView.hide();
        }
        this.removeTrail();  // must remove trail because particles trails mess up the look of capture particles

        // Set position to current position
        this.capture.emitter.position.value = this.mainSphere.position.clone();

        // Adjust burst size based on sphere scale
        let scale = this.mainSphere.scale.x * (this.skin.capture.customScale || 1);
        this.capture.emitter.position.radius = scale;
        this.capture.emitter.size.value = [scale/3, scale*2/6, scale/9, 0];

        this.capture.emitter.enable();
    }

    /**
     * Frame update tick for this PlayerView.
     *
     * @param {Number} scale the player's current scale
     */
    update(scale) {
        this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
        this.updateTrails();
        this.updatePlayerName();
        if (this.dangerView) {
            this.updateDanger();
        }
        if (this.is_current_player || this.skin.behavior.faceCamera) {
            this.updateDirection();
        }

        if (this.capture.active) {
            this.capture.group.tick( this.clock.getDelta() );
        }
    }

    /**
     * Update the direction the sphere is facing.
     */
    updateDirection() {
        this.mainSphere.lookAt(camera.position);
        this.mainSphere.up.copy(camera.up);
    }

    /**
     * Update this player's DrainView.
     *
     * @param {Number} drain_target_id the id of the player being drained
     */
    updateDrain(drain_target_id) {
        this.drainView.update( drain_target_id );
    }

    /**
     * Update this player's DangerView.
     */
    updateDanger() {
        this.dangerView.update();
    }

    /**
     * Set the opacity of this PlayerView.  Only accepts boolean currently, so it's more of a setVisible function.
     *
     * @param {Boolean} alpha whether the player is visible
     */
    setAlpha(alpha) {
        // TODO remove transparent true/false
        this.mainSphere.material.transparent = !alpha;

        // TODO implement this
        // this.material.alpha = alpha;
    }

    /**
     * Update the position of this PlayerView.
     *
     * @param {THREE.Point} position the true position of the player
     */
    updatePosition(position) {
        this.mainSphere.position.lerp(position, config.PLAYER_MOVE_LERP_WEIGHT);
    }

    /**
     * Remove this player's trail.
     */
    removeTrail() {
        if (this.trail.initialized) {
            switch (this.skin.trail.type) {
                case 'line':
                    this.trail.origins = [];
                    this.trail.geometries = [];
                    this.trail.lines = [];
                    this.trail.meshes.forEach(_.partial(UTIL.threeFree, this.scene, _));
                    break;
                case 'particle':
                    if (this.trail.emitter.group) this.trail.emitter.remove();
                    UTIL.threeFree(this.scene, this.trail.group.mesh);
                    break;
            }
            this.trail.initialized = false;
        }
    }

    /**
     * Remove any particle emitters from this player's capture.
     */
    removeCaptureParticles() {
        this.capture.emitter.remove();
        UTIL.threeFree(this.scene, this.capture.group.mesh);
    }

    /**
     * Remove all aspects of this PlayerView from memory.
     */
    remove() {
        this.removeTrail();
        this.removeCaptureParticles();
        ZOR.Pools.drainViews.returnObj(this.drainView);
        if (this.dangerView) {
            ZOR.Pools.dangerViews.returnObj(this.dangerView);
            this.dangerView.dispose(this.scene);
            this.dangerView = undefined;
        }
        this.drainView.dispose(this.scene);
        this.drainView = undefined;

        ZOR.Pools.playerNames.returnObj(this.playerName);
        this.playerName.dispose(this.scene);
        this.playerName = undefined;

        this.spherePool.returnObj(this.mainSphere);

        UTIL.threeFree(this.scene, this.mainSphere);
        this.mainSphere = undefined;
        // this.scene.remove(this.mainSphere);
        // this.mainSphere.material.dispose();
        // this.mainSphere.geometry.dispose();

        // find the player mesh used for raycasting and remove it
        // for (var i = 0; i < ZOR.Game.player_meshes.length; i++) {
        //     var playerMesh = ZOR.Game.player_meshes[i];

        //     if (playerMesh && playerMesh.player_id === this.model.id) {
        //         // remove this players mesh
        //         console.log("Removing mesh for player: ", this.model.id);
        //         ZOR.Game.player_meshes.splice(i, 1);
        //     }
        // }
    }

    /**
     * Returns the time in ms that the capture emitter particles will be alive
     * @returns {number}
     */
    getCaptureEmitterLifetime() {
        return Math.floor((this.capture.emitter.maxAge.value + this.capture.emitter.maxAge.spread
            + this.capture.emitter.duration + 0.1) * 1000);
    }

    /**
     * Set this PlayerViews scale immediately.  Unlike `grow(n)`, this function does not lerp the scale..
     *
     * @param {Number} scale the new scale of the player
     */
    setScale(scale) {
        this.mainSphere.scale.set(scale, scale, scale);
        this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );

        // Don't know if we need to do this every frame or at all
        // It is very expensive, accounts for 50% of the time spent in animate()
        // this.mainSphere.geometry.computeBoundingSphere();
    }

    /**
     * Set a type of camera control.
     *
     * @param {Object} camera_controls a type of camera control
     */
    setCameraControls(camera_controls) {
        this.camera_controls = camera_controls;
    }

    /**
     * Adjust the camera position based on player scale.
     *
     * @param {Number} scale the scale to adjust the camera by
     */
    adjustCamera(scale) {
        let newDist = config.GET_CAMERA_MIN_DISTANCE(scale);

        this.camera_controls.minDistance = UTIL.lerp(this.camera_controls.minDistance, this.cameraMinDistance, 0.03);

        if (newDist !== this.cameraMinDistance) {
            if (this.shouldChangeMinDist(newDist)) {
                // buffer reached, now switch. See: https://github.com/Jared-Sprague/zorbio/issues/273
                console.log('New camera minDistance: ', newDist);
                this.cameraMinDistance = newDist;
            }
        }
    }

    /**
     * Returns true if the camera min distance should change
     * @param {number} calculatedDist
     * @returns {boolean}
     */
    shouldChangeMinDist(calculatedDist) {
        let curDist = this.cameraMinDistance;
        let curScale = this.model.sphere.scale;
        let currentDistanceStepRange = config.CAMERA_ZOOM_STEPS[Math.floor(curDist)];

        if (curDist > calculatedDist) {
            // Zoom in if buffer dist met
            if (currentDistanceStepRange.min - curScale >= config.CAMERA_ZOOM_STEP_BUFFER) {
                return true;
            }
        }
        else if (curDist < calculatedDist) {
            // Zoom out if buffer dist met
            if (curScale - currentDistanceStepRange.max >= config.CAMERA_ZOOM_STEP_BUFFER) {
                return true;
            }
        }

        return false;
    }
};
