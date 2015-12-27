/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param actor
 * @constructor
 * @param scene
 */

var PlayerView = function ZORPlayerView(actor, main_sphere, scene) {
    this.playerColor = PlayerView.COLORS[actor.color];
    var geometry = new THREE.SphereGeometry(
        config.INITIAL_PLAYER_RADIUS,
        config.PLAYER_SPHERE_POLYCOUNT,
        config.PLAYER_SPHERE_POLYCOUNT
    );

    var material = new THREE.ShaderMaterial( {
        uniforms:
        {
            color         : { type : "c",  value : new THREE.Color(THREE.ColorKeywords.white) },
            viewVector    : { type : "v3", value : camera.position },
            spherePos     : { type : "v3", value : actor.position },
            mainSpherePos : { type : "v3", value : main_sphere.position },
            FOG_FAR       : { type : "f",  value : config.FOG_FAR },
            FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
        },
        vertexShader:   document.getElementById( 'sphereVertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'sphereFragmentShader' ).textContent,
        // side: THREE.DoubleSide,
        transparent: true
    } );
    material.transparent = true;
    material.depthTest = true;
    material.opacity = 0.3;

    this.mainSphere = new THREE.Mesh( geometry, material );
    this.mainSphere.position.copy(actor.position);
    this.mainSphere.scale.set(actor.scale, actor.scale, actor.scale);

    scene.add( this.mainSphere );

    // sphere glow
    var glowMaterial = new THREE.ShaderMaterial({
        uniforms:
        {
            "c"           : { type : "f",  value : 1.0 },
            "p"           : { type : "f",  value : 0.6 },
            glowColor     : { type : "c",  value : new THREE.Color(this.playerColor) },
            viewVector    : { type : "v3", value : camera.position },
            spherePos     : { type : "v3", value : actor.position },
            mainSpherePos : { type : "v3", value : main_sphere.position },
            FOG_FAR       : { type : "f",  value : config.FOG_FAR },
            FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
        },
        vertexShader:   document.getElementById( 'glowVertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'glowFragmentShader' ).textContent,
        // side: THREE.FrontSide,
        transparent: true
    });
    this.sphereGlow = new THREE.Mesh( this.mainSphere.geometry.clone(), glowMaterial.clone() );
    this.sphereGlow.position.copy( this.mainSphere.position );
    this.sphereGlow.scale.copy( this.mainSphere.scale );
    this.sphereGlow.scale.multiplyScalar( config.SPHERE_GLOW_SCALE );
    scene.add( this.sphereGlow );
};

PlayerView.prototype.grow = function ZORPlayerViewGrow(amount) {
    this.mainSphere.scale.addScalar( amount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
    this.sphereGlow.scale.copy( this.mainSphere.scale );
    this.sphereGlow.scale.multiplyScalar( config.SPHERE_GLOW_SCALE );
};

PlayerView.prototype.update = function ZORPlayerViewUpdate(scene, camera) {
    // update glow
    this.sphereGlow.position.copy(this.mainSphere.position);
    this.sphereGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( camera.position, this.sphereGlow.position );

};

PlayerView.prototype.updatePosition = function ZORPlayerViewUpdatePosition(position, scene, camera, renderer) {
    this.mainSphere.position.lerp(position, config.PLAYER_MOVE_LERP_WEIGHT);
    this.update(scene, camera, renderer);
};

PlayerView.prototype.remove = function ZORPlayerViewRemove(scene) {
    scene.remove(this.mainSphere);
    scene.remove(this.sphereGlow);
};

PlayerView.prototype.setScale = function ZORPlayerViewSetScale(scale) {
    this.mainSphere.scale.set(scale, scale, scale);
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.sphereGlow.scale.copy( this.mainSphere.scale );
    this.sphereGlow.scale.multiplyScalar( config.SPHERE_GLOW_SCALE );
};

PlayerView.COLORS = Object.keys( THREE.ColorKeywords );
