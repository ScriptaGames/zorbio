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

    scene.add(this.mainSphere);

    this.circlePoints = [];
    var twoPI = Math.PI * 2;
    var index = 0;
    var scale = 1;
    var inc = twoPI / 32.0;

    for (var i = 0; i <= twoPI + inc; i += inc) {

        var vector = new THREE.Vector3();
        vector.set(Math.cos(i) * scale, Math.sin(i) * scale, 0);
        this.circlePoints[index] = vector;
        index++;

    }

    // create the trail renderer object
    this.trail = new THREE.TrailRenderer(scene, false);

    // create material for the trail renderer
    this.trailMaterial = THREE.TrailRenderer.createBaseMaterial();
    this.trailMaterial.uniforms.headColor.value.set(1, 0, 0, 0.5);
    this.trailMaterial.uniforms.tailColor.value.set(0, 1, 0, 0.5);

    // specify length of trail
    var trailLength = 50;

    // initialize the trail
    this.trail.initialize(this.trailMaterial, trailLength, false, 0, this.circlePoints, this.mainSphere);
    this.trail.activate();
    this.trail.advance();

    this.lastTrailUpdateTime = performance.now();
};

ZOR.PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scale) {
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);

    var time = performance.now();
    if ( time - this.lastTrailUpdateTime > 10 ) {
        this.trail.advance();
        this.lastTrailUpdateTime = time;
    } else {
        this.trail.updateHead();

    }
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
