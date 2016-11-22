var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param playerView
 */

ZOR.DangerView = function ZORDangerView() {

    this.geometry = new THREE.SphereGeometry( 1, 64, 64 );
    this.material = new THREE.ShaderMaterial({
        uniforms: {
            riskSpread    : { type : "f",  value : 40 },
            playerSize    : { type : "f",  value : 50 },
            sphereSize    : { type : "f",  value : 50 },
            cameraPos     : { type : "v3", value : new THREE.Vector3() },
            dangerColor   : { type : "c",  value : new THREE.Color('#ff0000') },
            nearbyColor   : { type : "c",  value : new THREE.Color('#444444') },
            safetyColor   : { type : "c",  value : new THREE.Color('#00ff00') },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,

        // depthFunc      : THREE.LessDepth,
        depthTest      : true,
        depthWrite     : true,
        alphaTest      : 0.5,
    });
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.position.copy( this.mesh.position );
    this.mesh.renderOrder = 3;

    var self = this;
    ZOR.UI.on('init', function injectDangerBeamShaders() {
        self.material.vertexShader   = document.getElementById('danger-vertex-shader').textContent;
        self.material.fragmentShader = document.getElementById('danger-frag-shader').textContent;
    });

    this.hide(); // initially hide
};

ZOR.DangerView.prototype.setPlayerView = function ZORDangerViewSetPlayerView(view) {
    this.playerView = view;
};

ZOR.DangerView.prototype.update = function ZORDangerViewUpdate() {
    var playerScale = this.playerView.mainSphere.scale.x;
    this.mesh.position.copy(this.playerView.mainSphere.position);

    this.mesh.scale.setScalar( (playerScale + 2.0) + playerScale/60 );
    this.material.uniforms.sphereSize.value = playerScale;
    if (typeof player !== 'undefined') {
        this.material.uniforms.playerSize.value = player.model.sphere.scale;
    }
    this.material.uniforms.cameraPos.value.copy(camera.position);
};

ZOR.DangerView.prototype.hide = function ZORDangerViewHide() {
    if (this.mesh.material.visible) {
        this.mesh.material.visible = false;
    }
};

ZOR.DangerView.prototype.show = function ZORDangerViewShow() {
    if (!this.mesh.material.visible) {
        this.mesh.material.visible = true;
    }
};

ZOR.DangerView.prototype.isVisible = function ZORDangerViewShow() {
    return this.material.visible;
};

ZOR.DangerView.prototype.dispose = function ZORDangerViewDispose(scene) {
    UTIL.threeFree(scene, this.mesh);
};

