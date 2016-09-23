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
    this.skinName = config.SKINS[config.SKINS.indexOf(model.sphere.skin)];
    this.boostedLastFrame = false;

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

    this.initTrail();
    this.drawTrail(this.mainSphere.position);

    scene.add( this.mainSphere );
};

ZOR.PlayerView.prototype.initTrail = function ZORPlayerInitTrail() {
    this.trail = {
        positions    : [],
        subdivisions : 20,
        geometry     : new THREE.Geometry(),
    };

    // create some starting points for the trail
    var i = 30;
    while(i--) {
        this.trail.positions.push(new THREE.Vector3(0,0,0));
    }

    this.trail.curve = new THREE.SplineCurve3([
        position
    ]);
};

ZOR.PlayerView.prototype.drawTrail = function ZORPlayerDrawTrail(position) {
    this.trail = {};
    this.trail.geometry.vertices = this.trail.curve.getPoints( SUBDIVISIONS );

    this.trail.material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    this.trail.line = new THREE.Line(this.trail.geometry, this.trail.material);
    window.trail = this.trail;
    this.scene.add(this.trail.line);
};

ZOR.PlayerView.prototype.updateTrail = function ZORPlayerUpdateTrail() {
    var scale          = this.mainSphere.scale.x;
    var cameraDistance = this.camera_controls ? this.camera_controls.maxDistance : 100;
    var leftTrailPos   = camera.localToWorld(new THREE.Vector3( -scale, 0, -cameraDistance ));
    var rightTrailPos  = camera.localToWorld(new THREE.Vector3(  scale, 0, -cameraDistance ));

};

ZOR.PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scale) {
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
    this.updateSpin();
    this.updateTrail();
};

ZOR.PlayerView.prototype.updateSpin = function ZORPlayerViewUpdateSpin() {
    var spin_y = _.get(this, 'skin.geometry.spin.y');
    if (spin_y) {
        this.geometry.rotateY(spin_y * ZOR.LagScale.get());
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
