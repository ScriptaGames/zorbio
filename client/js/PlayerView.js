var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @constructor
 * @param model
 * @param scene
 * @param current Is this the current player
 */

ZOR.PlayerView = function ZORPlayerView(model, scene, current) {
    var self = this;
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

    this.geometry = new THREE.SphereGeometry(
        1,
        this.skin.geometry.polycount_w || config.PLAYER_SPHERE_POLYCOUNT,
        this.skin.geometry.polycount_h || config.PLAYER_SPHERE_POLYCOUNT
    );

    playerFogCenter.copy(model.sphere.position);
    this.material = new THREE.ShaderMaterial( this.skin.material );

    if (config.FOOD_ALPHA_ENABLED) {
        this.material.depthWrite = true;
    }

    this.mainSphere = new THREE.Mesh( this.geometry, this.material );
    this.mainSphere.position.copy(model.sphere.position);

    this.drainView = new ZOR.DrainView(this, scene);

    this.setScale(model.sphere.scale);

    this.mainSphere.player_id = this.model.id;
    ZOR.Game.player_meshes.push(this.mainSphere);  // store mesh for raycaster search


    // Player capture animation emitter
    this.capture = {};
    this.capture.group = new SPE.Group(this.skin.capture.group);
    this.capture.group.addPool( 4, this.skin.capture.emitter, false );
    this.capture.group.mesh.frustumCulled = false;
    this.capture.group.mesh.renderOrder = -1;

    // Add particle group to scene.
    scene.add( this.capture.group.mesh );

    scene.add( this.mainSphere );

    // give the meshes time to render before drawing trails
    // also adds a nice fade in effect for trails
    setTimeout(function() {
        self.initTrails();
    }, 250);
};

ZOR.PlayerView.prototype.initTrails = function ZORPlayerViewInitTrails() {
    var self = this;

    switch (this.skin.trail.type) {
        case 'line':
            this.initLineTrails();
            break;
        case 'particle':
            this.initParticleTrails();
            break;
    }

    // Add the config handler
    ZOR.UI.on( ZOR.UI.ACTIONS.TOGGLE_OWN_TRAIL, function(e) {
        if ( e.node.checked ) {
            self.hideTrails();
            ZOR.UI.setAndSave('hide_own_trail', true);
        }
        else {
            self.showTrails();
            ZOR.UI.setAndSave('hide_own_trail', false);
        }
    });

    // Default visibility from local storage
    if (config.HIDE_OWN_TRAIL && this.is_current_player) {
        self.hideTrails();
    }
};

ZOR.PlayerView.prototype.initParticleTrails = function ZORPlayerViewInitParticleTrails() {
    this.trail.group = new SPE.Group(this.skin.trail.group);

    this.trail.emitter = new SPE.Emitter(this.skin.trail.emitter);

    this.trail.group.mesh.renderOrder = 1;
    this.trail.group.mesh.frustumCulled = false;
    this.trail.group.addEmitter( this.trail.emitter );
    this.scene.add( this.trail.group.mesh );
    this.trail.initialized = true;
    this.trail.visible = 1;
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
    for (var line_i = 0; line_i < this.skin.trail.origins.length; ++line_i) {
        // transform the line's origins from sphere space to world space
        this.trail.origins[line_i] = this.mainSphere.localToWorld(this.skin.trail.origins[line_i].clone());

        // create a geometry for the line's vertices
        this.trail.geometries[line_i] = new THREE.Geometry();

        // create initial vertices for the line
        for (var vertex_i = 0; vertex_i < config.TRAIL_LINE_LENGTH; ++vertex_i) {
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

    var newPos = this.mainSphere.position.clone();

    this.trail.emitter.position._value.x = newPos.x;
    this.trail.emitter.position._value.y = newPos.y;
    this.trail.emitter.position._value.z = newPos.z;

    var scale = this.mainSphere.scale.x * (this.skin.trail.customScale || 1);
    this.trail.emitter.position._spreadClamp.setX( scale );
    this.trail.emitter.position._spread.setX( scale );
    this.trail.emitter.position._radius = scale;
    this.trail.emitter.size._value =  [scale/3, scale*2/6, scale/9, 0];

    var boosting = this.model.abilities.speed_boost.isActive();

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

    for (var line_i = 0; line_i < this.skin.trail.origins.length; ++line_i) {
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

ZOR.PlayerView.prototype.handleCapture = function ZORPlayerViewHandleCapture(capturedPlayer) {
    this.capture.group.triggerPoolEmitter( 1, capturedPlayer.model.sphere.position );
};

ZOR.PlayerView.prototype.attractCaptureParticles = function ZORPlayerViewAttractCaptureParticles() {
    var emitter;
    var i;

    // attract all living emitters
    for (i = 0; i < this.capture.group.emitters.length; ++i) {
        // TODO see if there's a way to skip emitters that aren't running.
        // checking if they are .alive did NOT work
        this.attractCaptureEmitter(this.capture.group.emitters[i]);
    }
};

ZOR.PlayerView.prototype.attractCaptureEmitter = function ZORPlayerViewAttractCaptureEmitter(emitter) {
    // player's position, scaled down for tweening
    var scaledDest = this.mainSphere.position.clone().multiplyScalar(1 - config.CAPTURE_PARTICLE_ATTRACTION_SPEED);
    var i;
    // tween each particle position toward the player's opsition
    for(i = 0; i < emitter.attributes.position.bufferAttribute.array.length; i+=3) {
        emitter.attributes.position.bufferAttribute.array[i  ] *= config.CAPTURE_PARTICLE_ATTRACTION_SPEED;
        emitter.attributes.position.bufferAttribute.array[i+1] *= config.CAPTURE_PARTICLE_ATTRACTION_SPEED;
        emitter.attributes.position.bufferAttribute.array[i+2] *= config.CAPTURE_PARTICLE_ATTRACTION_SPEED;

        emitter.attributes.position.bufferAttribute.array[i  ] += scaledDest.x;
        emitter.attributes.position.bufferAttribute.array[i+1] += scaledDest.y;
        emitter.attributes.position.bufferAttribute.array[i+2] += scaledDest.z;
    }
    emitter.attributes.position.forceUpdateAll();
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scale) {
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
    this.updateTrails();
    if (this.is_current_player || this.skin.behavior.faceCamera) {
        this.updateDirection();
    }
    this.attractCaptureParticles();
    this.capture.group.tick( this.clock.getDelta() );
};

ZOR.PlayerView.prototype.updateDirection = function ZORPlayerViewUpdateDirection() {
    this.mainSphere.lookAt(camera.position);
    this.mainSphere.up.copy(camera.up);
};

ZOR.PlayerView.prototype.updateDrain = function ZORPlayerViewUpdateDrain(drain_target_id) {
    this.drainView.update( drain_target_id );
};

ZOR.PlayerView.prototype.setAlpha = function ZORPlayerViewSetAlpha(alpha) {
    // TODO remove transparent true/false
    this.material.transparent = !alpha;

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
                this.trail.meshes.forEach(this.scene.remove.bind(scene));
                break;
            case 'particle':
                this.trail.group.emitters.forEach(function (emitter) { emitter.remove(); });
                this.trail.group.dispose();
                break;
        }
    }

};

ZOR.PlayerView.prototype.removeCaptureParticles = function ZORPlayerViewRemoveCaptureParticles() {
    this.capture.group.emitters.forEach(function (emitter) { emitter.remove(); });
    this.capture.group.dispose();
};

ZOR.PlayerView.prototype.remove = function ZORPlayerViewRemove(scene) {
    this.removeTrail();
    this.removeCaptureParticles();
    this.drainView.dispose();
    scene.remove(this.mainSphere);

    // find the player mesh used for raycasting and remove it
    for (var i = 0; i < ZOR.Game.player_meshes.length; i++) {
        var playerMesh = ZOR.Game.player_meshes[i];

        if (playerMesh && playerMesh.player_id === this.model.id) {
            // remove this players mesh
            console.log("Removing mesh for player: ", this.model.id);
            ZOR.Game.player_meshes.splice(i, 1);
        }
    }
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
    var newDist = config.GET_CAMERA_MIN_DISTANCE(scale);

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
    var curDist = this.cameraMinDistance;
    var curScale = this.model.sphere.scale;
    var currentDistanceStepRange = config.CAMERA_ZOOM_STEPS[Math.floor(curDist)];

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
