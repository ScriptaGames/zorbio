// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
global THREE:true
global UTIL:true
global player:true
global camera:true
*/

ZOR.DangerView = class ZORDangerView {
    /**
     * This class represents the outline for a spheres size relative to the current player.
     * @constructor
     */
    constructor() {
        this.geometry = new THREE.SphereGeometry( 1, 64, 64 );
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                upperRiskRange: { type: 'f',  value: 0.1 },
                lowerRiskRange: { type: 'f',  value: 25 },
                playerSize    : { type: 'f',  value: 50 },
                sphereSize    : { type: 'f',  value: 50 },
                spherePos     : { type: 'v3', value: new THREE.Vector3() },
                cameraPos     : { type: 'v3', value: new THREE.Vector3() },
                dangerColor   : { type: 'c',  value: new THREE.Color('#ff0000') },
                nearbyColor   : { type: 'c',  value: new THREE.Color('#ffff00') },
                safetyColor   : { type: 'c',  value: new THREE.Color('#00ff00') },
            },
            transparent: true,
            blending   : THREE.AdditiveBlending,
        });
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.copy( this.mesh.position );

        let self = this;
        ZOR.UI.on('init', function injectDangerBeamShaders() {
            self.material.vertexShader   = document.getElementById('danger-vertex-shader').textContent;
            self.material.fragmentShader = document.getElementById('danger-frag-shader').textContent;
        });

        this.hide(); // initially hide
    }

    /**
     * @param {Object} view the player's view object
     */
    setPlayerView(view) {
        this.playerView = view;
    }

    /**
     * Update tick function for DangerView.
     */
    update() {
        let playerScale = this.playerView.mainSphere.scale.x;
        this.mesh.position.copy(this.playerView.mainSphere.position);

        this.mesh.scale.setScalar( (playerScale + 2.0) + playerScale/80 );
        this.material.uniforms.sphereSize.value = playerScale;
        if (typeof player !== 'undefined') {
            this.material.uniforms.playerSize.value = player.model.sphere.scale;
        }
        this.material.uniforms.cameraPos.value.copy(camera.position);
        this.material.uniforms.spherePos.value.copy(this.mesh.position);
    }

    /**
     * Hide this player's danger view.
     */
    hide() {
        if (this.mesh.material.visible) {
            this.mesh.material.visible = false;
        }
    }

    /**
     * Show this player's danger view.
     */
    show() {
        if (!this.mesh.material.visible) {
            this.mesh.material.visible = true;
        }
    }

    /**
     * @return {Boolean} whether this player's danger view is visible
     */
    isVisible() {
        return this.material.visible;
    }

    /**
     * Clean up memory for player's danger view.
     * @param {Object} scene the three.js scene
     */
    dispose(scene) {
        UTIL.threeFree(scene, this.mesh);
    }
};
