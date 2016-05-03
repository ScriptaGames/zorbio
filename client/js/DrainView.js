var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param actor
 * @constructor
 * @param scene
 */

ZOR.DrainView = function ZORDrainView(scene) {

    this.scene = scene;

    this.time = 0.1;

    this.meshes = [];

};

ZOR.DrainView.prototype.pinch = function pinch(x, h) {
    return Math.max(
        0,
        1 - Math.pow(x - h/2, 2) / Math.pow(h/2, 2)
    );
};


ZOR.DrainView.prototype.update = function ZORDrainViewUpdate( scene, players_obj ) {

    var players_arr = _.values( players_obj );
    var ai = players_arr.length;
    var di;
    var did;
    var obj;
    var dist;
    var drainer;
    var drainee;

    this.clear();

    this.time += ZOR.LagScale.get() / config.DRAIN_RADIO_FREQUENCY;

    while ( ai-- ) {
        drainer = players_arr[ai];
        if (drainer.drains) {
            di = drainer.drains.length;
            while ( di-- ) {
                did = drainer.drains[di];
                if (did) {
                    drainee = players_obj[ did ];
                    obj = this.createCylinder( drainer, drainee );
                    if (obj) {
                        this.meshes.push(obj);
                        scene.add(obj);
                    }
                }
            }
        }
    }
};

/**
 * Remove all drain objects from the scene.
 */
ZOR.DrainView.prototype.clear = function ZORDrainViewClear() {
    var i = this.meshes.length;
    var obj;
    while ( i-- ) {
        obj = this.meshes[i];
        this.scene.remove(obj); // remove from scene
        obj.geometry.dispose();
        obj.material.dispose();
    }
    this.meshes = []; // clear out meshes array
    // that should take care of removing ALL references to the lines
};

ZOR.DrainView.prototype.createCylinder = function ZORDrainViewCreateCylinder(drainer, drainee) {

    var drainer_pos = drainer.view.mainSphere.position;
    var drainee_pos = drainee.view.mainSphere.position;
    var drainer_scale = drainer.view.mainSphere.scale.x;
    var drainee_scale = drainee.view.mainSphere.scale.x;

    if (typeof drainer_pos === 'undefined') return;
    if (typeof drainee_pos === 'undefined') return;
    if (typeof drainer_scale === 'undefined') return;
    if (typeof drainee_scale === 'undefined') return;

    var dist = drainer_pos.distanceTo( drainee_pos ) - drainer_scale - drainee_scale;

    if (dist < 0) return;

    // base cylinder's opacity on how large the drain is (percentage of
    // theoretical maximum drain)
    var opacity = 1 - dist / config.DRAIN_MAX_DISTANCE;

    var geometry = new THREE.CylinderGeometry( drainer_scale/2, drainee_scale/2, dist, 16, 12, true );
    geometry.rotateX(Math.PI/2); // rotate geo so its ends point 'up'

    var material = new THREE.MeshNormalMaterial({color: 0x7777ff});
    //var material = new THREE.ShaderMaterial({
    //    uniforms: {
    //        time: { type: "f", value: this.time },
    //        power: { type: "f", value: opacity },
    //        erColor: { type: "c", value: drainer.view.material.uniforms.color.value },
    //        eeColor: { type: "c", value: drainee.view.material.uniforms.color.value },
    //        len: { type: "f", value: dist },
    //    },
    //    vertexShader   : document.getElementById( 'drain-vertex-shader' ).textContent,
    //    fragmentShader : document.getElementById( 'drain-frag-shader' ).textContent,
    //    side           : THREE.DoubleSide,
    //    transparent    : true,
    //    opacity        : 0.8,
    //    depthFunc      : THREE.LessDepth,
    //    depthTest      : false,
    //    depthWrite     : true,
    //    blending       : THREE.AdditiveBlending,
    //    alphaTest      : 1.0,
    //    morphTargets   : true,
    //});

    var pinchVertices = [];
    for ( var i = 0; i < geometry.vertices.length; i ++ ) {

        pinchVertices[i] = geometry.vertices[ i ].clone();

        pinchVertices[i].x *= -this.pinch(pinchVertices[i].z + dist/2, dist);
        pinchVertices[i].y *= -this.pinch(pinchVertices[i].z + dist/2, dist);

    }

    geometry.morphTargets.push( { name: "pinch", vertices: pinchVertices } );


    var cylinder = new THREE.Mesh( geometry, material );

    // strength of pinch effect
    cylinder.morphTargetInfluences[ 0 ] = 0.4;

    // position and angle the cylinder correctly
    // cylinder.position.copy( drainer_pos.clone().add( drainee_pos).divideScalar(2) );
    var drainer_edge_pos = drainee_pos.clone().sub( drainer_pos ).normalize().multiplyScalar( -drainee_scale ).add( drainer_pos );
    var drainee_edge_pos = drainer_pos.clone().sub( drainee_pos ).normalize().multiplyScalar( -drainer_scale ).add( drainee_pos );
    cylinder.position.copy( drainer_edge_pos.add( drainee_edge_pos ).divideScalar(2) );

    cylinder.lookAt( drainer_pos );

    cylinder.renderOrder = 10;
    return cylinder;
};
