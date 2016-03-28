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

    this.clock = new THREE.Clock();
    this.time = 0.1;

    this.geos = [];

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

    this.time += this.clock.getDelta();

    while ( ai-- ) {
        drainer = players_arr[ai];
        if (drainer.drains) {
            di = drainer.drains.length;
            while ( di-- ) {
                did = drainer.drains[di];
                if (did) {
                    drainee = players_obj[ did ];
                    obj = this.createCylinder( drainer, drainee );
                    this.geos.push(obj);
                    scene.add(obj);
                }
            }
        }
    }
};

/**
 * Remove all drain objects from the scene.
 */
ZOR.DrainView.prototype.clear = function ZORDrainViewClear() {
    var i = this.geos.length;
    var obj;
    while ( i-- ) {
        obj = this.geos[i];
        this.scene.remove(obj); // remove from scene
    }
    this.geos = []; // clear out geos array
    // that should take care of removing ALL references to the lines
};

ZOR.DrainView.prototype.createCylinder = function ZORDrainViewCreateCylinder(drainer, drainee) {

    var drainer_pos = drainer.view.mainSphere.position;
    var drainee_pos = drainee.view.mainSphere.position;
    var drainer_scale = drainer.view.mainSphere.scale.x;
    var drainee_scale = drainee.view.mainSphere.scale.x;

    var dist = drainer_pos.distanceTo( drainee_pos );

    // base cylinder's opacity on how large the drain is (percentage of
    // theoretical maximum drain)
    var opacity = 1 - dist / config.DRAIN_MAX_DISTANCE;

    var geometry = new THREE.CylinderGeometry( drainer_scale, drainee_scale, dist, 32, 1, true );
    geometry.rotateX(Math.PI/2); // rotate geo so its ends point 'up'

    var material = new THREE.ShaderMaterial({
        uniforms: {
            time: { type: "f", value: this.time },
            power: { type: "f", value: opacity },
            erColor: { type: "c", value: drainer.view.material.uniforms.color.value },
            eeColor: { type: "c", value: drainee.view.material.uniforms.color.value },
            len: { type: "f", value: dist },
        },
        vertexShader   : document.getElementById( 'drain-vertex-shader' ).textContent,
        fragmentShader : document.getElementById( 'drain-frag-shader' ).textContent,
        side           : THREE.DoubleSide,
        transparent    : true,
        opacity        : 0.8,
        depthFunc      : THREE.LessDepth,
        depthTest      : false,
        depthWrite     : true,
        blending       : THREE.AdditiveBlending,
        alphaTest      : 1.0,
    });
    var cylinder = new THREE.Mesh( geometry, material );

    // position and angle the cylinder correctly
    cylinder.position.copy( drainer_pos.clone().add( drainee_pos).divideScalar(2) );
    cylinder.lookAt( drainer_pos );

    cylinder.renderOrder = 10;
    return cylinder;
};
