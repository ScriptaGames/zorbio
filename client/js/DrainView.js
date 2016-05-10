var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param playerView
 * @param scene
 * @constructor
 */

ZOR.DrainView = function ZORDrainView(playerView, scene) {

    this.scene = scene;
    this.playerView = playerView;

    this.time = 0.1;

    this.meshes = [];

    this.geometry = new THREE.CylinderGeometry( 10, 10, 50, 16, 12, true );
    this.geometry.rotateX(Math.PI/2); // rotate geo so its ends point 'up'
    this.createPinch(1); // initialize morphTargets

    this.material = new THREE.MeshNormalMaterial();

    // this.material = new THREE.ShaderMaterial({
    //     uniforms: {
    //         time: { type: "f", value: this.time },
    //         power: { type: "f", value: 0 },
    //         erColor: { type: "c", value: this.playerView.material.uniforms.color.value },
    //         eeColor: { type: "c", value: 0 },
    //         len: { type: "f", value: 0 },
    //     },
    //     vertexShader   : document.getElementById( 'drain-vertex-shader' ).textContent,
    //     fragmentShader : document.getElementById( 'drain-frag-shader' ).textContent,
    //     side           : THREE.DoubleSide,
    //     transparent    : true,
    //     opacity        : 0.8,
    //     depthFunc      : THREE.LessDepth,
    //     depthTest      : false,
    //     depthWrite     : true,
    //     blending       : THREE.AdditiveBlending,
    //     alphaTest      : 1.0,
    //     morphTargets   : true,
    // });

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.renderOrder = 10;
    this.mesh.morphTargetInfluences[ 0 ] = 0.4; // strength of pinch effect
};

ZOR.DrainView.prototype.pinch = function pinch(x, h) {
    return Math.max(
        0,
        1 - Math.pow(x - h/2, 2) / Math.pow(h/2, 2)
    );
};

ZOR.DrainView.prototype.update = function ZORDrainViewUpdate( drainee ) {

    var drainer_pos = this.playerView.mainSphere.position;
    var drainee_pos = drainee.view.mainSphere.position;
    var drainer_scale = this.playerView.mainSphere.scale.x;
    var drainee_scale = drainee.view.mainSphere.scale.x;
    var distance = drainer_pos.distanceTo( drainee_pos ) - drainer_scale - drainee_scale;
    var visible;

    // make invisible if any required params are unavailable
    if (drainer_pos && drainee_pos && drainer_scale && drainee_scale) {
        visible = this.updateVisibility( distance );
    }
    else {
        visible = this.updateVisibility( -1 );
    }

    if (visible) {
        // this.updatePinch( distance );
        this.updateStretch( distance );
        // this.updateTaper( drainer_scale, drainee_scale ); // TODO impl
        // this.updateUniforms( drainee, distance ); // until shadermaterial is back
        this.updatePosition( drainer_pos, drainee_pos, drainer_scale, drainee_scale );
    }
};

ZOR.DrainView.prototype.updateVisibility = function ZORDrainViewUpdateVisibility( distance ) {
    // hide drain beam if spheres intersect
    var visible = distance > 0;
    this.mesh.material.visible = visible;
    return visible;
};

ZOR.DrainView.prototype.updatePosition = function ZORDrainViewUpdatePosition(  drainer_pos, drainee_pos, drainer_scale, drainee_scale ) {
    // position and angle the cylinder correctly
    var drainer_edge_pos = drainee_pos.clone().sub( drainer_pos ).normalize().multiplyScalar( -drainee_scale ).add( drainer_pos );
    var drainee_edge_pos = drainer_pos.clone().sub( drainee_pos ).normalize().multiplyScalar( -drainer_scale ).add( drainee_pos );
    this.mesh.position.copy( drainer_edge_pos.add( drainee_edge_pos ).divideScalar(2) );
    this.mesh.lookAt( drainer_pos );
};

ZOR.DrainView.prototype.updateUniforms = function ZORDrainViewUpdateUniforms( drainee, distance ) {
    this.time += ZOR.LagScale.get() / config.DRAIN_RADIO_FREQUENCY;
    // Set material parameters
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.eeColor.value = drainee.view.material.uniforms.color.value;
    this.material.uniforms.len.value = distance;
    // base cylinder's opacity on how large the drain is (percentage of
    // theoretical maximum drain)
    var opacity = 1 - distance / config.DRAIN_MAX_DISTANCE;
    this.material.uniforms.power.value = opacity;
};

ZOR.DrainView.prototype.updateStretch = function ZORDrainViewUpdateStretch( distance ) {
};

ZOR.DrainView.prototype.createPinch = function ZORDrainViewCreatePinch( distance ) {
    var pinchVertices = this.createPinchVertices( distance );
    this.geometry.morphTargets.push( { name: "pinch", vertices: pinchVertices } );
};

// ZOR.DrainView.prototype.updatePinch = function ZORDrainViewUpdatePinch( distance ) {
//     this.createPinchVertices( distance, this.geometry.morphTargets[0].vertices );
// };

ZOR.DrainView.prototype.createPinchVertices = function ZORDrainViewCreatePinchVertices( distance, o_array ) {
    var pinchVertices = o_array || [];
    for ( var i = 0; i < this.geometry.vertices.length; i ++ ) {
        pinchVertices[i] = this.geometry.vertices[ i ].clone();
        pinchVertices[i].x *= -this.pinch(pinchVertices[i].z + distance/2, distance);
        pinchVertices[i].y *= -this.pinch(pinchVertices[i].z + distance/2, distance);
    }
    return pinchVertices;
};

/**
 * Remove all drain objects from the scene.
 */
ZOR.DrainView.prototype.dispose = function ZORDrainViewDispose() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
};
