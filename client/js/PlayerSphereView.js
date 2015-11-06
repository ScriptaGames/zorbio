/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param actor
 * @constructor
 */

var PlayerSphereView = function ZORPlayerSphereView(actor, scene, radius) {
    this.playerColor = PlayerSphereView.COLORS[actor.color];
    var geometry = new THREE.SphereGeometry( radius, 32, 32 );

    this.cubeCamera = new THREE.CubeCamera( 1, 1000, 256 );
    this.cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    scene.add( this.cubeCamera );

    var material = new THREE.MeshBasicMaterial( {
        color    : THREE.ColorKeywords.white,
        envMap   : this.cubeCamera.renderTarget,
        blending : THREE.NormalBlending
    } );
    material.transparent = true;
    material.depthTest = true;
    material.opacity = 0.3;

    this.mainSphere = new THREE.Mesh( geometry, material );

    scene.add( this.mainSphere );

    // sphere glow

    var glowMaterial = new THREE.ShaderMaterial({
        uniforms:
        {
            "c":   { type: "f", value: 0.05 },
            "p":   { type: "f", value: 6.0 },
            glowColor: { type: "c", value: new THREE.Color(this.playerColor) },
            viewVector: { type: "v3", value: camera.position }
        },
        vertexShader:   document.getElementById( 'glowVertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'glowFragmentShader' ).textContent,
        side: THREE.DoubleSide,
        transparent: true
    });
    this.sphereGlow = new THREE.Mesh( this.mainSphere.geometry.clone(), glowMaterial.clone() );
    this.sphereGlow.position.copy( this.mainSphere.position );
    this.sphereGlow.scale.multiplyScalar( config.SPHERE_GLOW_SCALE );
    scene.add( this.sphereGlow );
};

PlayerSphereView.prototype.grow = function ZORPlayerSphereViewGrow(ammount) {
    this.mainSphere.scale.addScalar( ammount );
    this.mainSphere.scale.clampScalar( 1, config.MAX_PLAYER_RADIUS );
    this.mainSphere.geometry.computeBoundingSphere(); // compute the new bounding sphere after resizing
    this.sphereGlow.scale.copy( this.mainSphere.scale );
    this.sphereGlow.scale.multiplyScalar( config.SPHERE_GLOW_SCALE );
};

PlayerSphereView.prototype.update = function ZORPlayerSphereUpdate(scene, camera, renderer) {
    // update glow

    this.sphereGlow.position.copy(this.mainSphere.position);
    this.sphereGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( camera.position, this.sphereGlow.position );

    // update reflections

    this.cubeCamera.position.copy(this.mainSphere.position);
    this.cubeCamera.updateCubeMap( renderer, scene );
};

//TODO: add more colors, only select ones not used.
PlayerSphereView.COLORS = [
    THREE.ColorKeywords.red,
    THREE.ColorKeywords.blue,
    THREE.ColorKeywords.yellow,
    THREE.ColorKeywords.green,
    THREE.ColorKeywords.purple,
    THREE.ColorKeywords.magenta,
    THREE.ColorKeywords.aliceblue
];
