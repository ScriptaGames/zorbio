// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true,
 config:true,
 THREE:true,
 playerFogCenter:true,
 UTIL:true
*/

ZOR.DrainView = class ZORDrainView {
    /**
     * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
     * visually, and how to move it's different 3D pieces around.
     * @constructor
     */
    constructor() {
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
                time         : { type: 'f',  value: this.time },
                power        : { type: 'f',  value: 0 },
                erColor      : { type: 'c',  value: 0 },
                eeColor      : { type: 'c',  value: 0 },
                erSize       : { type: 'f',  value: 0 },
                eeSize       : { type: 'f',  value: 0 },
                sizeSpread   : { type: 'f',  value: config.MAX_PLAYER_RADIUS - config.INITIAL_PLAYER_RADIUS },
                len          : { type: 'f',  value: 0 },
                mainSpherePos: { type: 'v3', value: playerFogCenter },
                pos          : { type: 'v3', value: new THREE.Vector3() },
                FOG_FAR      : { type: 'f',  value: config.FOG_FAR },
                FOG_ENABLED  : { type: 'f',  value: ~~config.FOG_ENABLED },
            },
            side        : THREE.DoubleSide,
            transparent : true,
            opacity     : 0.8,
            depthFunc   : THREE.LessDepth,
            depthTest   : false,
            depthWrite  : true,
            blending    : THREE.AdditiveBlending,
            alphaTest   : 1.0,
            morphTargets: true,
        });
        let self = this;
        ZOR.UI.on('init', function injectDrainBeamShaders() {
            self.material.vertexShader   = document.getElementById('drain-vertex-shader').textContent;
            self.material.fragmentShader = document.getElementById('drain-frag-shader').textContent;
        });

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.renderOrder = 10;
        this.mesh.morphTargetInfluences[this.MORPH_INDEX_STRETCH]       = 0;     // length of stretch
        this.mesh.morphTargetInfluences[this.MORPH_INDEX_DRAINER_TAPER] = 0;     // radius at drainer's end
        this.mesh.morphTargetInfluences[this.MORPH_INDEX_DRAINEE_TAPER] = 0;     // radius at drainee's end
        this.mesh.morphTargetInfluences[this.MORPH_INDEX_PINCH]         = 0.065; // strength of pinch effect

        this.hide(); // initially hide
    }

    /**
     * @param {Object} view the view object of the player this drain belongs to
     */
    setPlayerView(view) {
        this.playerView = view;
        this.material.uniforms.erColor.value = new THREE.Color(this.playerView.playerColor);
    }

    /**
     * @param {Number} x the x position along the drain beam
     * @param {Number} h the total height of the drain beam
     * @return {Number} how much to pinch the beam at the x position along the beam
     */
    _pinch(x, h) {
        return Math.max(
            0,
            1 - Math.pow(x - h/2, 2) / Math.pow(h/2, 2)
        );
    }

    /**
     * Update tick for the drain beam.
     * @param {Number} drain_target_id the player id of the player being drained
     */
    update( drain_target_id ) {
        if (drain_target_id === 0) {
            this.hide();
            return;  // no drain target
        }

        let drainee = ZOR.Game.players[drain_target_id];

        // sometimes drainee isn't in the players array yet
        if (!drainee) return;

        let drainer_pos = this.playerView.mainSphere.position;
        let drainee_pos = drainee.view.mainSphere.position;
        let drainer_scale = this.playerView.mainSphere.scale.x;
        let drainee_scale = drainee.view.mainSphere.scale.x;
        let distance = drainer_pos.distanceTo( drainee_pos ) - drainer_scale - drainee_scale;

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
    }

    /**
     * Hide this drain beam.
     */
    hide() {
        if (this.mesh.material.visible) {
            this.mesh.material.visible = false;
        }
    }

    /**
     * Show this drain beam.
     */
    show() {
        if (!this.mesh.material.visible) {
            this.mesh.material.visible = true;
        }
    }

    /**
     * @return {Number} whether this drain beam is currently visible.
     */
    isVisible() {
        return this.material.visible;
    }

    /**
     * Update the drain beam's visibility based on the nearest player's distance.  Hide if the spheres are intersecting.
     * @param {Number} distance how far away the player is
     */
    updateVisibility( distance ) {
        // hide drain beam if spheres intersect
        if (distance > 0) {
            this.show();
        }
        else {
            this.hide();
        }
    }

    /**
     * Update drain beam position and size based on players' positions and sizes.
     * @param {Object} drainer_pos the position of the player doing the draining
     * @param {Object} drainee_pos the position of the player being drained
     * @param {Object} drainer_scale how big the drainer is
     * @param {Object} drainee_scale how big the drainee is
     */
    updatePosition(drainer_pos, drainee_pos, drainer_scale, drainee_scale) {
        // position and angle the cylinder correctly
        let drainer_edge_pos = drainee_pos.clone().sub(drainer_pos).normalize().multiplyScalar(-drainee_scale)
            .add(drainer_pos);
        let drainee_edge_pos = drainer_pos.clone().sub(drainee_pos).normalize().multiplyScalar(-drainer_scale)
            .add(drainee_pos);
        this.mesh.position.copy(drainer_edge_pos.add(drainee_edge_pos).divideScalar(2));
        this.mesh.lookAt(drainer_pos);
    }

    /**
     * @param {Object} drainee the player object of the player being drained
     * @param {Number} distance how far away the drainee is from this player
     */
    updateUniforms( drainee, distance ) {
        this.time += ZOR.LagScale.get() / config.DRAIN_RADIO_FREQUENCY;
        // Set material parameters
        this.material.uniforms.time.value = this.time;
        this.material.uniforms.eeColor.value = new THREE.Color(drainee.view.playerColor);
        this.material.uniforms.len.value = distance;
        // base cylinder's opacity on how large the drain is (percentage of
        // theoretical maximum drain)
        this.material.uniforms.power.value = 1 - Math.pow(distance / config.DRAIN_MAX_DISTANCE, 2);
    }

    /**
     * Create a morph target for stretching this drain beam.
     */
    createStretch() {
        let stretchVertices = this.createStretchVertices();
        this.geometry.morphTargets.push( { name: 'stretch', vertices: stretchVertices } );
    }

    /**
     * Create vertices for stretching the drain beam, to be used in a morph target.
     * @return {Object} the stretch vertices
     */
    createStretchVertices() {
        let stretchVertices = [];
        for ( let i = 0; i < this.geometry.vertices.length; i ++ ) {
            stretchVertices[i] = this.geometry.vertices[i].clone();
            stretchVertices[i].z = 0;
        }
        return stretchVertices;
    }

    /**
     * Update stretch based on distance.
     * @param {Number} distance how far away the drainee is
     */
    updateStretch( distance ) {
        this.mesh.morphTargetInfluences[this.MORPH_INDEX_STRETCH] = 1 - distance / config.DRAIN_MAX_DISTANCE;
    }

    /**
     * Update how much to taper the drain beam.
     * @param {Number} scale player scale
     * @param {Number} influence_index index of the morph target for this player's end of the beam
     */
    updateTaper( scale, influence_index ) {
        // https://www.desmos.com/calculator/dpjwagi0va
        let influence = 0.85 - Math.pow(scale / config.MAX_PLAYER_RADIUS, 2) / 2;
        this.mesh.morphTargetInfluences[influence_index] = influence;
    }

    /**
     * Create morph target for tapering the drainer's end of the beam.
     */
    createDrainerTaper() {
        let taperVertices = this.createDrainerTaperVertices();
        this.geometry.morphTargets.push( { name: 'drainer_taper', vertices: taperVertices } );
    }

    /**
     * Create vertices for tapering the drainer's end of the beam, to be used in a morph target.
     * @return {Object} tapering vertices
     */
    createDrainerTaperVertices() {
        let taperVertices = [];
        let radius;
        for ( let i = 0; i < this.geometry.vertices.length; i ++ ) {
            taperVertices[i] = this.geometry.vertices[i].clone();
            radius = 1 - (taperVertices[i].z + config.DRAIN_MAX_DISTANCE/2 ) / this.initialCylinderLength;
            taperVertices[i].x *= radius;
            taperVertices[i].y *= radius;
        }
        return taperVertices;
    }

    /**
     * Update the taper on the drainer's end of the beam.
     * @param {Number} scale the drainer's scale
     */
    updateDrainerTaper( scale ) {
        this.updateTaper( scale, this.MORPH_INDEX_DRAINER_TAPER );
    }

    /**
     * Create morph target for tapering the drainee's end of the beam.
     */
    createDraineeTaper() {
        let taperVertices = this.createDraineeTaperVertices();
        this.geometry.morphTargets.push( { name: 'drainee_taper', vertices: taperVertices } );
    }

    /**
     * Create vertices for tapering the drainee's end of the beam, to be used in a morph target.
     * @return {Object} tapering vertices
     */
    createDraineeTaperVertices() {
        let taperVertices = [];
        let radius;
        for ( let i = 0; i < this.geometry.vertices.length; i ++ ) {
            taperVertices[i] = this.geometry.vertices[i].clone();
            radius = (taperVertices[i].z + config.DRAIN_MAX_DISTANCE/2 ) / this.initialCylinderLength;
            taperVertices[i].x *= radius;
            taperVertices[i].y *= radius;
        }
        return taperVertices;
    }

    /**
     * Update the taper on the drainee's end of the beam.
     * @param {Number} scale the drainee's scale
     */
    updateDraineeTaper( scale ) {
        this.updateTaper( scale, this.MORPH_INDEX_DRAINEE_TAPER );
    }


    /**
     * Create morph target for pinching the beam.
     * @param {Number} distance how far apart the players are
     */
    createPinch( distance ) {
        let pinchVertices = this.createPinchVertices( distance );
        this.geometry.morphTargets.push( { name: 'pinch', vertices: pinchVertices } );
    }

    /**
     * Create vertices for pinching the beam, to be used in a morph target.
     * @param {Number} distance how far apart the players are
     * @return {Object} pinching vertices
     */
    createPinchVertices( distance ) {
        let pinchVertices = [];
        for ( let i = 0; i < this.geometry.vertices.length; i ++ ) {
            pinchVertices[i] = this.geometry.vertices[i].clone();
            pinchVertices[i].x *= -this._pinch(pinchVertices[i].z + distance/2, distance);
            pinchVertices[i].y *= -this._pinch(pinchVertices[i].z + distance/2, distance);
        }
        return pinchVertices;
    }

    /**
     * Clean up all memory used by this drain beam.
     * @param {Object} scene the three.js scene
     */
    dispose(scene) {
        UTIL.threeFree(scene, this.mesh);
    }
};
