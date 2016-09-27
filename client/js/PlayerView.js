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
    this.model = model;
    this.scene = scene;
    this.is_current_player = current || false;
    this.playerColor = config.COLORS[model.sphere.color];
    this.skinName = model.sphere.skin;

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

    scene.add( this.mainSphere );

    this.initTrail();
};

ZOR.PlayerView.prototype.initTrail = function ZORPlayerInitTrail() {
    this.trail = particleGroup = new SPE.Group(this.skin.trail.group);

    this.trailEmitter = new SPE.Emitter(this.skin.trail.emitter);

    this.trailClock = new THREE.Clock();
    this.trail.mesh.renderOrder = 1;
    this.trail.mesh.frustumCulled = false;
    this.trail.addEmitter( this.trailEmitter );
    this.scene.add( this.trail.mesh );

    // Create the line geometry used for storing verticies
    this.trail_geometry = new THREE.Geometry();
    for (var i = 0; i < config.TRAIL_LINE_LENGTH; i++) {
        // must initialize it to the number of positions it will keep or it will throw an error
        this.trail_geometry.vertices.push(this.mainSphere.position.clone());
    }

    // Create the line mesh
    this.trail_line = new THREE.MeshLine();
    this.trail_line.setGeometry( this.trail_geometry, function( p ) { return p; } ); // makes width taper

    // Create the line material
    this.trail_material = new THREE.MeshLineMaterial( {
        useMap: 0,
        color: new THREE.Color( this.playerColor ),
        opacity: 1,
        resolution: new THREE.Vector2( window.innerWidth, window.innerHeight ),
        sizeAttenuation: 1,
        lineWidth: 2,
        near: camera.near,
        far: camera.far,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        transparent: false,
        side: THREE.DoubleSide
    });

    this.trail_mesh = new THREE.Mesh( this.trail_line.geometry, this.trail_material ); // this syntax could definitely be improved!
    this.trail_mesh.frustumCulled = false;
    this.scene.add( this.trail_mesh );
};

ZOR.PlayerView.prototype.updateTrail = function ZORPlayerUpdateTrail() {
    this.trail_geometry.vertices.push(this.mainSphere.position.clone());

    if (this.trail_geometry.vertices.length > config.TRAIL_LINE_LENGTH) {
        this.trail_geometry.vertices.shift();  // remove oldest position
    }

    this.trail_line.setGeometry(this.trail_geometry, function(p) {
        return p;  // makes width taper
    });

    var oldPos = this.trailEmitter.position._value.clone();
    var newPos = this.mainSphere.position.clone();

    this.trailEmitter.position._value.x = newPos.x;
    this.trailEmitter.position._value.y = newPos.y;
    this.trailEmitter.position._value.z = newPos.z;

    var scale = this.mainSphere.scale.x * (this.skin.trail.customScale || 1);
    this.trailEmitter.position._spreadClamp.setX( scale );
    this.trailEmitter.position._spread.setX( scale );
    this.trailEmitter.position._radius = scale;
    this.trailEmitter.size._value =  [scale/3, scale*2/6, scale*1/9, 0];

    var boosting = this.model.abilities.speed_boost.isActive();

    if (boosting) {
        this.trailEmitter.activeMultiplier = 1;
    }
    else {
        this.trailEmitter.activeMultiplier = 0.1;
    }

    // var speed = oldPos.clone().sub(newPos).length();
    // var diffPos = newPos.sub(oldPos).multiplyScalar(speed);

    // this.trailEmitter.velocity._value.x = diffPos.x;
    // this.trailEmitter.velocity._value.y = diffPos.y;

    this.trailEmitter.updateFlags.position = true;
    this.trailEmitter.updateFlags.velocity = true;
    this.trailEmitter.updateFlags.size = true;

    this.trail.tick( this.trailClock.getDelta() );
};

ZOR.PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scale) {
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
    this.updateTrail();
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

ZOR.PlayerView.prototype.remove = function ZORPlayerViewRemove(scene) {
    this.drainView.dispose();
    this.trail.emitters.forEach(function (emitter) { emitter.remove(); });
    this.trail.dispose();
    scene.remove(this.trail_mesh);
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
    this.mainSphere.geometry.computeBoundingSphere();
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
