var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param actor
 * @constructor
 * @param scene
 */

ZOR.PlayerView = function ZORPlayerView(actor, main_sphere, scene) {
    this.playerColor = ZOR.PlayerView.COLORS[actor.color];

    this.geometry = new THREE.SphereGeometry(
        1,
        config.PLAYER_SPHERE_POLYCOUNT,
        config.PLAYER_SPHERE_POLYCOUNT
    );

    playerFogCenter.copy(main_sphere.position);
    this.material = new THREE.ShaderMaterial( {
        uniforms:
        {
            "c"           : { type : "f",  value : 1.41803 },
            "p"           : { type : "f",  value : 2.71828 },
            color         : { type : "c",  value : new THREE.Color(this.playerColor) },
            spherePos     : { type : "v3", value : actor.position },
            mainSpherePos : { type : "v3", value : playerFogCenter },
            FOG_FAR       : { type : "f",  value : config.FOG_FAR },
            FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED }
        },
        vertexShader:   document.getElementById( 'sphere-vertex-shader'   ).textContent,
        fragmentShader: document.getElementById( 'sphere-fragment-shader' ).textContent,
        transparent: true
    } );

    if (config.FOOD_ALPHA_ENABLED) {
        this.material.depthWrite = true;
    }

    this.mainSphere = new THREE.Mesh( this.geometry, this.material );
    this.mainSphere.position.copy(actor.position);

    this.setScale(0);

    scene.add( this.mainSphere );
};

ZOR.PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
    this.adjustCamera();
};

ZOR.PlayerView.prototype.update = function ZORPlayerViewUpdate(scene, camera, scale) {
    this.setScale( scale * 0.1 + this.mainSphere.scale.x * 0.9);
};

ZOR.PlayerView.prototype.updatePosition = function ZORPlayerViewUpdatePosition(position, scene, camera, renderer) {
    this.mainSphere.position.lerp(position, config.PLAYER_MOVE_LERP_WEIGHT);
    this.update(scene, camera, renderer);
};

ZOR.PlayerView.prototype.remove = function ZORPlayerViewRemove(scene) {
    scene.remove(this.mainSphere);
};

ZOR.PlayerView.prototype.setScale = function ZORPlayerViewSetScale(scale) {
    this.mainSphere.scale.set(scale, scale, scale);
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere();
};

ZOR.PlayerView.prototype.setCameraControls = function ZORPlayerViewSetCameraControls(camera_controls) {
    this.camera_controls = camera_controls;
};

ZOR.PlayerView.prototype.adjustCamera = function ZORPlayerViewAdjustCamera() {
    var radius = this.mainSphere.scale.x;
    this.camera_controls.minDistance = radius / Math.tan( Math.PI * camera.fov / 360 ) + 100;
    this.camera_controls.maxDistance = this.camera_controls.minDistance;
};

ZOR.PlayerView.COLORS = [
    '#00ffff', // cyan
    '#0000cd', // mediumblue
    '#1e90ff', // dodgerblue
    '#00ff7f', // springgreen
    '#00ff00', // lime
    '#228b22', // forestgreen
    '#4169e1', // royalblue
    '#9932cc', // darkorchid
    '#4b0082', // indigo
    '#ff00ff', // magenta
    '#ff6347', // tomato
    '#ff0000', // red
    '#800000', // maroon
    '#ff4500', // orangered
    '#ff8c00', // darkorange
    '#ffd700', // gold
    '#ffff00' // yellow
];
