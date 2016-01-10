/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param actor
 * @constructor
 * @param scene
 */

var PlayerView = function ZORPlayerView(actor, main_sphere, scene) {
    this.playerColor = PlayerView.COLORS[actor.color];

    this.geometry = new THREE.SphereGeometry(
        config.INITIAL_PLAYER_RADIUS,
        config.PLAYER_SPHERE_POLYCOUNT,
        config.PLAYER_SPHERE_POLYCOUNT
    );


    //TODO: ask Michael what ~~ means in javascript
    playerFogCenter.copy(main_sphere.position);
    this.material = new THREE.ShaderMaterial( {
        uniforms:
        {
            "c"           : { type : "f",  value : 1.41803 },
            "p"           : { type : "f",  value : 2.71828 },
            color         : { type : "c",  value : new THREE.Color(this.playerColor) },
            cameraPos     : { type : "v3", value : camera.position },
            spherePos     : { type : "v3", value : actor.position },
            mainSpherePos : { type : "v3", value : playerFogCenter },
            FOG_FAR       : { type : "f",  value : config.FOG_FAR },
            FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED }
        },
        vertexShader:   document.getElementById( 'sphere-vertex-shader'   ).textContent,
        fragmentShader: document.getElementById( 'sphere-fragment-shader' ).textContent,
        transparent: true
    } );
    this.material.transparent = true;
    this.material.depthTest = true;

    this.mainSphere = new THREE.Mesh( this.geometry, this.material );
    this.mainSphere.position.copy(actor.position);
    this.mainSphere.scale.set(actor.scale, actor.scale, actor.scale);

    scene.add( this.mainSphere );
};

PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
};

PlayerView.prototype.update = function ZORPlayerViewUpdate(scene, camera) {
    this.material.uniforms.cameraPos.value = camera.position;
};

PlayerView.prototype.updatePosition = function ZORPlayerViewUpdatePosition(position, scene, camera, renderer) {
    this.mainSphere.position.lerp(position, config.PLAYER_MOVE_LERP_WEIGHT);
    this.update(scene, camera, renderer);
};

PlayerView.prototype.remove = function ZORPlayerViewRemove(scene) {
    scene.remove(this.mainSphere);
};

PlayerView.prototype.setScale = function ZORPlayerViewSetScale(scale) {
    this.mainSphere.scale.set(scale, scale, scale);
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
};

PlayerView.COLORS = [
    '#00bfff', // deepskyblue
    '#0000cd', // mediumblue
    '#000080', // navy
    '#00ff7f', // springgreen
    '#00ff00', // lime
    '#228b22', // forestgreen
    '#4169e1', // royalblue
    '#9932cc', // darkorchid
    '#4b0082', // indigo
    '#ff00ff', // magenta
    '#ff6347', // tomato
    '#ff0000', // red
    '#a52a2a', // brown
    '#800000', // maroon
    '#ff4500', // orangered
    '#ff8c00', // darkorange
    '#ffd700', // gold
    '#ffff00' // yellow
];
