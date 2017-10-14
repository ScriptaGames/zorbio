// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global UTIL:true
global THREE:true
global _:true
global playerFogCenter:true
global SPE:true
global camera:true
*/

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @constructor
 * @param model
 * @param scene
 * @param current Is this the current player
 */

ZOR.PlayerView = function ZORPlayerView(model, scene, current) {
    let self = this;
    this.model = model;
    this.scene = scene;
    this.is_current_player = current || false;
    this.playerColor = config.COLORS[model.sphere.color];
    this.skinName = model.sphere.skin;

    this.clock = new THREE.Clock();

    this.trail = {
        initialized: false,
    };

    this.cameraMinDistance = config.GET_CAMERA_MIN_DISTANCE(model.sphere.scale);

    this.skin = ZOR.PlayerSkins[this.skinName || 'default'](this);

    playerFogCenter.copy(model.sphere.position);

    if (config.FOOD_ALPHA_ENABLED) {
        this.skin.material.depthWrite = true;
    }

    this.spherePool = ZOR.Pools[this.skin.poolname];
    this.mainSphere = this.spherePool.borrow();
    this.mainSphere.position.copy(model.sphere.position);
    this.mainSphere.material = this.skin.material;

    if (!current) {
        this.setAlpha(1);
        this.dangerView = ZOR.Pools.dangerViews.borrow();
        this.dangerView.setPlayerView(this);
        this.dangerView.show();
    }

    this.drainView = ZOR.Pools.drainViews.borrow();
    this.drainView.setPlayerView(this);


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
    setTimeout(function() {
        self.initTrails();
    }, 250);
};

ZOR.PlayerView.prototype.initTrails = function ZORPlayerViewInitTrails() {
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
        self.hideTrails();
    }
};

// Player capture animation emitter
ZOR.PlayerView.prototype.initCaptureParticles = function ZORPlayerViewInitCaptureParticles() {
    this.capture = {};
    this.capture.group = new SPE.Group(this.skin.capture.group);
    this.capture.emitter = new SPE.Emitter(this.skin.capture.emitter);
    this.capture.emitter.disable();
    this.capture.group.addEmitter(this.capture.emitter);
    this.capture.group.mesh.frustumCulled = false;
    this.capture.group.mesh.renderOrder = -1;
    this.capture.active = false;

    this.scene.add( this.capture.group.mesh );
};

ZOR.PlayerView.prototype.initParticleTrails = function ZORPlayerViewInitParticleTrails() {
    this.trail.group = new SPE.Group(this.skin.trail.group);

    this.trail.emitter = new SPE.Emitter(this.skin.trail.emitter);

    this.trail.group.mesh.renderOrder = -2;
    this.trail.group.mesh.frustumCulled = false;
    this.trail.group.addEmitter( this.trail.emitter );
    this.trail.visible = 1;

    this.scene.add( this.trail.group.mesh );

    this.trail.initialized = true;
};

ZOR.PlayerView.prototype.initLineTrails = function ZORPlayerViewInitLineTrails() {
    // Create the line material
    this.trail.material = new THREE.MeshLineMaterial( {
        useMap: 0,
        color: this.skin.trail.color,
        opacity: 1,
        resolution: new THREE.Vector2( window.innerWidth, window.innerHeight ),
        sizeAttenuation: 1,
        lineWidth: this.skin.trail.customScale * config.TRAIL_LINE_WIDTH,
        near: camera.near,
        far: camera.far,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        transparent: false,
        side: THREE.DoubleSide,
        visibility: 1,
    });

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
        for (let vertex_i = 0; vertex_i < config.TRAIL_LINE_LENGTH; ++vertex_i) {
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
};

ZOR.PlayerView.prototype.hideTrails = function ZORPlayerViewHideTrail() {
    if (!this.trail.initialized) return;

    switch (this.skin.trail.type) {
        case 'line':
            this.hideLineTrails();
            break;
        case 'particle':
            this.hideParticleTrails();
            break;
    }
};

ZOR.PlayerView.prototype.showTrails = function ZORPlayerViewShowTrail() {
    if (!this.trail.initialized) return;

    switch (this.skin.trail.type) {
        case 'line':
            this.showLineTrails();
            break;
        case 'particle':
            this.showParticleTrails();
            break;
    }
};

ZOR.PlayerView.prototype.hideLineTrails = function ZORPlayerViewHideLineTrails() {
    // hide line trail
    this.trail.material.transparent = true;
    this.trail.material.depthTest = false;
    this.trail.material.visible = false;
    this.trail.material.uniforms.opacity.value = 0;
    this.trail.material.uniforms.visibility.value = 0;
};

ZOR.PlayerView.prototype.hideParticleTrails = function ZORPlayerViewHideParticleTrails() {
    this.trail.visible = 0;
};

ZOR.PlayerView.prototype.showLineTrails = function ZORPlayerViewShowLineTrails() {
    // hide line trail
    this.trail.material.transparent = false;
    this.trail.material.depthTest = true;
    this.trail.material.visible = true;
    this.trail.material.uniforms.opacity.value = 1;
    this.trail.material.uniforms.visibility.value = 1;
};

ZOR.PlayerView.prototype.showParticleTrails = function ZORPlayerViewShowParticleTrails() {
    this.trail.visible = 1;
};

ZOR.PlayerView.prototype.updateTrails = function ZORPlayerViewUpdateTrail() {
    switch (this.skin.trail.type) {
        case 'line':
            this.updateLineTrails();
            break;
        case 'particle':
            this.updateParticleTrails();
            break;
    }
};

ZOR.PlayerView.prototype.updateParticleTrails = function ZORPlayerViewupdateParticleTrails() {
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
};

ZOR.PlayerView.prototype.updateLineTrails = function ZORPlayerViewupdateLineTrails() {
    if (!this.trail.initialized) return;

    // Increase trail width based on sphere scale but prevent giant width trails
    this.trail.material.uniforms.lineWidth.value = this.skin.trail.customScale * config.TRAIL_LINE_WIDTH * (1 + (this.mainSphere.scale.x  / 10));

    for (let line_i = 0; line_i < this.skin.trail.origins.length; ++line_i) {
        this.trail.lines[line_i].advance(this.mainSphere.localToWorld(this.skin.trail.origins[line_i].clone()));
    }
};

ZOR.PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );

    // Don't know if we need to do this every frame or at all
    // It is very expensive, accounts for 50% of the time spent in animate()
    // this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
};

ZOR.PlayerView.prototype.handleCapture = function ZORPlayerViewHandleCapture() {
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
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scale) {
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
    this.updateTrails();
    if (this.dangerView) {
        this.updateDanger();
    }
    if (this.is_current_player || this.skin.behavior.faceCamera) {
        this.updateDirection();
    }

    if (this.capture.active) {
        this.capture.group.tick( this.clock.getDelta() );
    }
};

ZOR.PlayerView.prototype.updateDirection = function ZORPlayerViewUpdateDirection() {
    this.mainSphere.lookAt(camera.position);
    this.mainSphere.up.copy(camera.up);
};

ZOR.PlayerView.prototype.updateDrain = function ZORPlayerViewUpdateDrain(drain_target_id) {
    this.drainView.update( drain_target_id );
};

ZOR.PlayerView.prototype.updateDanger = function ZORPlayerViewUpdateDanger() {
    this.dangerView.update();
};

ZOR.PlayerView.prototype.setAlpha = function ZORPlayerViewSetAlpha(alpha) {
    // TODO remove transparent true/false
    this.mainSphere.material.transparent = !alpha;

    // TODO implement this
    // this.material.alpha = alpha;
};

ZOR.PlayerView.prototype.updatePosition = function ZORPlayerViewUpdatePosition(position) {
    this.mainSphere.position.lerp(position, config.PLAYER_MOVE_LERP_WEIGHT);
};

ZOR.PlayerView.prototype.removeTrail = function ZORPlayerViewRemoveTrail() {
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

};

ZOR.PlayerView.prototype.removeCaptureParticles = function ZORPlayerViewRemoveCaptureParticles() {
    this.capture.emitter.remove();
    UTIL.threeFree(this.scene, this.capture.group.mesh);
};

ZOR.PlayerView.prototype.remove = function ZORPlayerViewRemove() {
    this.removeTrail();
    this.removeCaptureParticles();
    ZOR.Pools.drainViews.return(this.drainView);
    if (this.dangerView) {
        ZOR.Pools.dangerViews.return(this.dangerView);
        this.dangerView.dispose(this.scene);
        this.dangerView = undefined;
    }
    this.drainView.dispose(this.scene);
    this.drainView = undefined;

    this.spherePool.return(this.mainSphere);

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
};

/**
 * Returns the time in ms that the capture emitter particles will be alive
 * @returns {number}
 */
ZOR.PlayerView.prototype.getCaptureEmitterLifetime = function ZORPlayerViewGetCaptureEmitterLifetime() {
    return Math.floor((this.capture.emitter.maxAge.value + this.capture.emitter.maxAge.spread + this.capture.emitter.duration + 0.1) * 1000);
};

ZOR.PlayerView.prototype.setScale = function ZORPlayerViewSetScale(scale) {
    this.mainSphere.scale.set(scale, scale, scale);
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );

    // Don't know if we need to do this every frame or at all
    // It is very expensive, accounts for 50% of the time spent in animate()
    // this.mainSphere.geometry.computeBoundingSphere();
};

ZOR.PlayerView.prototype.setCameraControls = function ZORPlayerViewSetCameraControls(camera_controls) {
    this.camera_controls = camera_controls;
};

ZOR.PlayerView.prototype.adjustCamera = function ZORPlayerViewAdjustCamera(scale) {
    let newDist = config.GET_CAMERA_MIN_DISTANCE(scale);

    this.camera_controls.minDistance = UTIL.lerp(this.camera_controls.minDistance, this.cameraMinDistance, 0.03);

    if (newDist != this.cameraMinDistance) {
        if (this.shouldChangeMinDist(newDist)) {
            // buffer reached, now switch. See: https://github.com/Jared-Sprague/zorbio/issues/273
            console.log("New camera minDistance: ", newDist);
            this.cameraMinDistance = newDist;
        }
    }
};

/**
 * Returns true if the camera min distance should change
 * @param calulatedDist
 * @returns {boolean}
 */
ZOR.PlayerView.prototype.shouldChangeMinDist = function ZORPlayerViewShouldChangeMinDist(calulatedDist) {
    let curDist = this.cameraMinDistance;
    let curScale = this.model.sphere.scale;
    let currentDistanceStepRange = config.CAMERA_ZOOM_STEPS[Math.floor(curDist)];

    if (curDist > calulatedDist) {
        // Zoom in if buffer dist met
        if (currentDistanceStepRange.min - curScale >= config.CAMERA_ZOOM_STEP_BUFFER) {
            return true;
        }
    }
    else if (curDist < calulatedDist) {
        // Zoom out if buffer dist met
        if (curScale - currentDistanceStepRange.max >= config.CAMERA_ZOOM_STEP_BUFFER) {
            return true;
        }
    }

    return false;
};

