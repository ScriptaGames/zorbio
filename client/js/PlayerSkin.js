var ZOR = ZOR || {};

ZOR.PlayerSkin = function ZORPlayerSkin(playerView) {
    this.model = playerView.model;
    this.scene = playerView.scene;
    this.is_current_player = playerView.is_current_player;

    var actor = this.model.sphere;

    this.playerColor = config.COLORS[actor.color];

    this.geometry = new THREE.SphereGeometry(
        1,
        config.PLAYER_SPHERE_POLYCOUNT,
        config.PLAYER_SPHERE_POLYCOUNT
    );

    playerFogCenter.copy(actor.position);
    this.material = new THREE.ShaderMaterial( {
        uniforms:
        {
            "c"           : { type : "f",  value : 1.41803 },
            "p"           : { type : "f",  value : 2.71828 },
            color         : { type : "c",  value : new THREE.Color(this.playerColor) },
            colorHSL      : { type : "v3",  value : new THREE.Color(this.playerColor).getHSL() },
            spherePos     : { type : "v3", value : actor.position },
            mainSpherePos : { type : "v3", value : playerFogCenter },
            FOG_FAR       : { type : "f",  value : config.FOG_FAR },
            FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED }
        },
        vertexShader:   document.getElementById( 'sphere-vertex-shader'   ).textContent,
        fragmentShader: document.getElementById( 'sphere-fragment-shader' ).textContent,
        transparent: true,

        // this allows spheres to clip each other nicely, BUT it makes spheres appear on top of the cube boundary. :/
        // depthFunc      : THREE.LessDepth,
        // depthTest      : false,
        // depthWrite     : true,
        // blending       : THREE.AdditiveBlending,
    } );

    if (config.FOOD_ALPHA_ENABLED) {
        this.material.depthWrite = true;
    }

    this.mainSphere = new THREE.Mesh( this.geometry, this.material );
    this.mainSphere.position.copy(actor.position);


    this.setScale(actor.scale);

    this.mainSphere.player_id = playerView.model.id;
    ZOR.Game.player_meshes.push(this.mainSphere);  // store mesh for raycaster search

    scene.add( this.mainSphere );

    this.initTrail();
};

ZOR.PlayerSkin.prototype.initTrail = function ZORPlayerInitTrail() {
    this.trail = particleGroup = new SPE.Group({
        scale: Math.min(window.innerWidth, window.innerHeight),
        texture: {
            value:  new THREE.TextureLoader().load( "textures/trail-particle.png" ),
        },
        maxParticleCount: 200,
    });

    var opacity = this.is_current_player ? 0.2 : 0.6;

    this.trailEmitter = new SPE.Emitter({
        maxAge: {
            value: 4,
            // spread: 2,
        },
        position: {
            value: new THREE.Vector3(0, 0, 0),
        },

        opacity: {
            value: [opacity, 0],
        },

        drag: {
            value: 1.0,
        },

        color: {
            value: new THREE.Color(this.playerColor),
        },

        size: {
            value: [100, 0],
        },

        particleCount: 200,
        activeMultiplier: 0.1,
    });

    this.trailClock = new THREE.Clock();
    this.trail.mesh.renderOrder = 1;
    this.trail.mesh.frustumCulled = false;
    this.trail.addEmitter( this.trailEmitter );
    this.scene.add( this.trail.mesh );
};

ZOR.PlayerSkin.prototype.updateTrail = function ZORPlayerUpdateTrail() {
    var oldPos = this.trailEmitter.position._value.clone();
    var newPos = this.mainSphere.position.clone();

    this.trailEmitter.position._value.x = newPos.x;
    this.trailEmitter.position._value.y = newPos.y;
    this.trailEmitter.position._value.z = newPos.z;

    var scale = Math.PI* 3/4 * this.mainSphere.scale.x;
    // this.trailEmitter.position._radius = scale;
    this.trailEmitter.size._value =  [scale, scale*2/3, scale*1/3, 0];

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

ZOR.PlayerSkin.prototype.grow = function ZORPlayerSkinGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
};

ZOR.PlayerSkin.prototype.update = function ZORPlayerSkinUpdate(scale) {
    this.updateTrail();
};

ZOR.PlayerSkin.prototype.updateDrain = function ZORPlayerSkinUpdateDrain(drain_target_id) {
    this.drainView.update( drain_target_id );
};

ZOR.PlayerSkin.prototype.setAlpha = function ZORPlayerSkinSetAlpha(alpha) {
    // TODO remove transparent true/false
    this.material.transparent = !alpha;

    // TODO implement this
    // this.material.alpha = alpha;
};

ZOR.PlayerSkin.prototype.updatePosition = function ZORPlayerSkinUpdatePosition(position) {
    this.mainSphere.position.lerp(position, config.PLAYER_MOVE_LERP_WEIGHT);
};

ZOR.PlayerSkin.prototype.remove = function ZORPlayerSkinRemove(scene) {
    this.drainView.dispose();
    this.trail.emitters.forEach(function (emitter) { emitter.remove(); });
    this.trail.dispose();
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

ZOR.PlayerSkin.prototype.setScale = function ZORPlayerSkinSetScale(scale) {
    this.mainSphere.scale.set(scale, scale, scale);
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere();
};

ZOR.PlayerSkin.prototype.setCameraControls = function ZORPlayerSkinSetCameraControls(camera_controls) {
    this.camera_controls = camera_controls;
};

ZOR.PlayerSkin.prototype.adjustCamera = function ZORPlayerSkinAdjustCamera(scale) {
    this.camera_controls.minDistance = scale / Math.tan( Math.PI * camera.fov / 360 ) + 100;
    this.camera_controls.maxDistance = this.camera_controls.minDistance;
};

