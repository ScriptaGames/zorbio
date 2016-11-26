var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param playerView
 */

ZOR.DrainView = function ZORDrainView() {

    this.MORPH_INDEX_STRETCH       = 0;
    this.MORPH_INDEX_DRAINER_TAPER = 1;
    this.MORPH_INDEX_DRAINEE_TAPER = 2;
    this.MORPH_INDEX_PINCH         = 3;

    this.time = 0.1;

    this.initialCylinderLength = config.DRAIN_MAX_DISTANCE;
    this.initialCylinderRadius = config.MAX_PLAYER_RADIUS/2;

    this.geometry = new THREE.CylinderGeometry(
        this.initialCylinderRadius,
        this.initialCylinderRadius,
        this.initialCylinderLength,
        16,
        12,
        true
    );
    this.geometry.rotateX( Math.PI/2 );               // rotate geo so its ends point 'up'
    this.createStretch();                             // initialize stretch morphTarget
    this.createDrainerTaper();                        // initialize drainer taper morphTarget
    this.createDraineeTaper();                        // initialize drainee taper morphTarget
    this.createPinch( this.initialCylinderLength );   // initialize pinch morphTarget

    this.material = new THREE.ShaderMaterial({
        uniforms: {
            time          : { type : "f",  value : this.time },
            power         : { type : "f",  value : 0 },
            erColor       : { type : "c",  value : 0 },
            eeColor       : { type : "c",  value : 0 },
            erSize        : { type : "f",  value : 0 },
            eeSize        : { type : "f",  value : 0 },
            sizeSpread    : { type : "f",  value : config.MAX_PLAYER_RADIUS - config.INITIAL_PLAYER_RADIUS },
            len           : { type : "f",  value : 0 },
            mainSpherePos : { type : "v3", value : playerFogCenter },
            pos           : { type : "v3", value : new THREE.Vector3() },
            FOG_FAR       : { type : "f",  value : config.FOG_FAR },
            FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
        },
        side           : THREE.DoubleSide,
        transparent    : true,
        opacity        : 0.8,
        depthFunc      : THREE.LessDepth,
        depthTest      : false,
        depthWrite     : true,
        blending       : THREE.AdditiveBlending,
        alphaTest      : 1.0,
        morphTargets   : true,
    });
    var self = this;
    ZOR.UI.on('init', function injectDrainBeamShaders() {
        self.material.vertexShader   = document.getElementById('drain-vertex-shader').textContent;
        self.material.fragmentShader = document.getElementById('drain-frag-shader').textContent;
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.renderOrder = 10;
    this.mesh.morphTargetInfluences[ this.MORPH_INDEX_STRETCH       ] = 0;     // length of stretch
    this.mesh.morphTargetInfluences[ this.MORPH_INDEX_DRAINER_TAPER ] = 0;     // radius at drainer's end
    this.mesh.morphTargetInfluences[ this.MORPH_INDEX_DRAINEE_TAPER ] = 0;     // radius at drainee's end
    this.mesh.morphTargetInfluences[ this.MORPH_INDEX_PINCH         ] = 0.065; // strength of pinch effect

    this.hide(); // initially hide
};

ZOR.DrainView.prototype.setPlayerView = function ZORDrainViewSetPlayerView(view) {
    this.playerView = view;
    this.material.uniforms.erColor.value = new THREE.Color(this.playerView.playerColor);

};

ZOR.DrainView.prototype.pinch = function pinch(x, h) {
    return Math.max(
        0,
        1 - Math.pow(x - h/2, 2) / Math.pow(h/2, 2)
    );
};

ZOR.DrainView.prototype.update = function ZORDrainViewUpdate( drain_target_id ) {

    if (drain_target_id === 0) {
        this.hide();
        return;  // no drain target
    }

    var drainee = ZOR.Game.players[drain_target_id];

    // sometimes drainee isn't in the players array yet
    if (!drainee) return;

    var drainer_pos = this.playerView.mainSphere.position;
    var drainee_pos = drainee.view.mainSphere.position;
    var drainer_scale = this.playerView.mainSphere.scale.x;
    var drainee_scale = drainee.view.mainSphere.scale.x;
    var distance = drainer_pos.distanceTo( drainee_pos ) - drainer_scale - drainee_scale;

    this.material.uniforms.pos.value.copy(this.mesh.position);
    this.material.uniforms.erSize.value = drainer_scale;
    this.material.uniforms.eeSize.value = drainee_scale;

    // make invisible if any required params are unavailable
    if (drainee && drainer_pos && drainee_pos && drainer_scale && drainee_scale) {
        this.updateVisibility( distance );
    }
    else {
        this.hide();
    }

    if (this.isVisible()) {
        this.updateStretch( distance );
        this.updateUniforms( drainee, distance );
        this.updateDrainerTaper( this.playerView.mainSphere.scale.x );
        this.updateDraineeTaper( drainee.model.sphere.scale );
        this.updatePosition( drainer_pos, drainee_pos, drainer_scale, drainee_scale );
    }
};

ZOR.DrainView.prototype.hide = function ZORDrainViewHide() {
    if (this.mesh.material.visible) {
        this.mesh.material.visible = false;
    }
};

ZOR.DrainView.prototype.show = function ZORDrainViewShow() {
    if (!this.mesh.material.visible) {
        this.mesh.material.visible = true;
    }
};

ZOR.DrainView.prototype.isVisible = function ZORDrainViewShow() {
    return this.material.visible;
};

ZOR.DrainView.prototype.updateVisibility = function ZORDrainViewUpdateVisibility( distance ) {
    // hide drain beam if spheres intersect
    if (distance > 0) {
        this.show();
    }
    else {
        this.hide();
    }
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
    this.material.uniforms.eeColor.value = new THREE.Color(drainee.view.playerColor);
    this.material.uniforms.len.value = distance;
    // base cylinder's opacity on how large the drain is (percentage of
    // theoretical maximum drain)
    this.material.uniforms.power.value = 1 - distance / config.DRAIN_MAX_DISTANCE;
};

///////////////
//  Stretch  //
///////////////


ZOR.DrainView.prototype.createStretch = function ZORDrainViewCreateStretch() {
    var stretchVertices = this.createStretchVertices();
    this.geometry.morphTargets.push( { name: "stretch", vertices: stretchVertices } );
};

ZOR.DrainView.prototype.createStretchVertices = function ZORDrainViewCreateStretchVertices() {
    var stretchVertices = [];
    for ( var i = 0; i < this.geometry.vertices.length; i ++ ) {
        stretchVertices[i] = this.geometry.vertices[ i ].clone();
        stretchVertices[i].z = 0;
    }
    return stretchVertices;
};

ZOR.DrainView.prototype.updateStretch = function ZORDrainViewUpdateStretch( distance ) {
    this.mesh.morphTargetInfluences[ this.MORPH_INDEX_STRETCH ] = 1 - distance / config.DRAIN_MAX_DISTANCE;
};

ZOR.DrainView.prototype.updateTaper = function ZORDrainViewUpdateTaper( scale, influence_index ) {
    // https://www.desmos.com/calculator/dpjwagi0va
    var influence = 0.85 - Math.pow(scale / config.MAX_PLAYER_RADIUS, 2) / 2;
    this.mesh.morphTargetInfluences[ influence_index ] = influence;
};

/////////////////////
//  Drainer taper  //
/////////////////////

ZOR.DrainView.prototype.createDrainerTaper = function ZORDrainViewCreateDrainerTaper() {
    var taperVertices = this.createDrainerTaperVertices();
    this.geometry.morphTargets.push( { name: "drainer_taper", vertices: taperVertices } );
};

ZOR.DrainView.prototype.createDrainerTaperVertices = function ZORDrainViewCreateDrainerTaperVertices() {
    var taperVertices = [];
    var radius;
    for ( var i = 0; i < this.geometry.vertices.length; i ++ ) {
        taperVertices[i] = this.geometry.vertices[ i ].clone();
        radius = 1 - (taperVertices[i].z + config.DRAIN_MAX_DISTANCE/2 ) / this.initialCylinderLength;
        taperVertices[i].x *= radius;
        taperVertices[i].y *= radius;
    }
    return taperVertices;
};

ZOR.DrainView.prototype.updateDrainerTaper = function ZORDrainViewUpdateDrainerTaper( scale ) {
    this.updateTaper( scale, this.MORPH_INDEX_DRAINER_TAPER );
};

/////////////////////
//  Drainee taper  //
/////////////////////

ZOR.DrainView.prototype.createDraineeTaper = function ZORDrainViewCreateDraineeTaper() {
    var taperVertices = this.createDraineeTaperVertices();
    this.geometry.morphTargets.push( { name: "drainee_taper", vertices: taperVertices } );
};

ZOR.DrainView.prototype.createDraineeTaperVertices = function ZORDrainViewCreateDraineeTaperVertices() {
    var taperVertices = [];
    var radius;
    for ( var i = 0; i < this.geometry.vertices.length; i ++ ) {
        taperVertices[i] = this.geometry.vertices[ i ].clone();
        radius = (taperVertices[i].z + config.DRAIN_MAX_DISTANCE/2 ) / this.initialCylinderLength;
        taperVertices[i].x *= radius;
        taperVertices[i].y *= radius;
    }
    return taperVertices;
};

ZOR.DrainView.prototype.updateDraineeTaper = function ZORDrainViewUpdateDraineeTaper( scale ) {
    this.updateTaper( scale, this.MORPH_INDEX_DRAINEE_TAPER );
};

/////////////
//  Pinch  //
/////////////


ZOR.DrainView.prototype.createPinch = function ZORDrainViewCreatePinch( distance ) {
    var pinchVertices = this.createPinchVertices( distance );
    this.geometry.morphTargets.push( { name: "pinch", vertices: pinchVertices } );
};

ZOR.DrainView.prototype.createPinchVertices = function ZORDrainViewCreatePinchVertices( distance ) {
    var pinchVertices = [];
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
ZOR.DrainView.prototype.dispose = function ZORDrainViewDispose(scene) {
    UTIL.threeFree(scene, this.mesh);
};

