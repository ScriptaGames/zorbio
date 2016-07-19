var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @constructor
 * @param model
 * @param scene
 */

ZOR.PlayerView = function ZORPlayerView(model, scene) {
    this.model = model;
    this.scene = scene;

    var actor = model.sphere;

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

    this.drainView = new ZOR.DrainView(this, scene);

    this.setScale(actor.scale);

    this.mainSphere.player_id = this.model.id;
    ZOR.Game.player_meshes.push(this.mainSphere);  // store mesh for raycaster search

    this.initParticleTrail();

    scene.add( this.mainSphere );
};
        function getRandomNumber( base ) {
            return Math.random() * base - (base/2);
        }

        function getRandomColor() {
            var c = new THREE.Color();
            c.setRGB( Math.random(), Math.random(), Math.random() );
            return c;
        }
ZOR.PlayerView.prototype.initParticleTrail= function ZORPlayerViewInitParticleTrail() {
    // establish a particle emitter group if it hasn't been
    this.particleGroup = new SPE.Group({
        hasPerspective: true,
        texture: {
            value: new THREE.TextureLoader().load( "textures/soft-square.png" ),
        }
    });
    // this.emitter = new SPE.Emitter({
    //     // type: SPE.distributions.SPHERE,
    //     position: this.mainSphere.position,
    //     color: {
    //         value: [ new THREE.Color( 0.5, 0.5, 0.5 ), new THREE.Color() ],
    //         spread: new THREE.Vector3(1, 1, 1),
    //     },
    //     size: {
    //         value: [5, 0]
    //     },
    //     particleCount: 1500
    // });

    this.emitter = new SPE.Emitter({
        maxAge: 5,
        type: 'sphere',
        // position: this.mainSphere.position,
        position: {
            value: new THREE.Vector3(
                getRandomNumber(1000),
                getRandomNumber(1000),
                getRandomNumber(1000)
            )
        },

        acceleration:{
            value: new THREE.Vector3(
                getRandomNumber(-2),
                getRandomNumber(-2),
                getRandomNumber(-2)
            )
        },

        velocity: {
            value: new THREE.Vector3(
                getRandomNumber(5),
                getRandomNumber(5),
                getRandomNumber(5)
            )
        },

        rotation: {
            axis: new THREE.Vector3(
                getRandomNumber(1),
                getRandomNumber(1),
                getRandomNumber(1)
            ),
            angle: Math.random() * Math.PI,
            center: new THREE.Vector3(
                getRandomNumber(100),
                getRandomNumber(100),
                getRandomNumber(100)
            )
        },

        wiggle: {
            value: Math.random() * 20
        },

        drag: {
            value: Math.random()
        },

        color: {
            value: [ getRandomColor(), getRandomColor() ]
        },
        size: {
            value: [0, 2+ Math.random() * 10, 0]
        },

        particleCount: 100,

        opacity: [0, 1, 0]
    });

    this.scene.add(this.particleGroup.mesh);
};

ZOR.PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scale) {
    this.particleGroup.tick(ZOR.LagScale.get());
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
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
    this.camera_controls.minDistance = scale / Math.tan( Math.PI * camera.fov / 360 ) + 100;
    this.camera_controls.maxDistance = this.camera_controls.minDistance;
};
