// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global THREE:true
global playerFogCenter:true
*/

ZOR.PlayerSkins = ZOR.PlayerSkins || {};

ZOR.PlayerSkins.default = function ZORDefaultSkin(playerView) {
    const color = new THREE.Color(playerView.playerColor);

    const captureParticles = ZOR.ParticleFx['bubbles'];

    // customize bubble capture particles based on skin primary color
    captureParticles.emitter.color.value = [color];

    return {
        poolname: 'spheres',
        material: new THREE.ShaderMaterial({
            uniforms: {
                'c'            : { type: 'f',  value: 1.41803 },
                'p'            : { type: 'f',  value: 2.71828 },
                'color'        : { type: 'c',  value: color },
                'colorHSL'     : { type: 'v3', value: color.getHSL() },
                'spherePos'    : { type: 'v3', value: playerView.model.sphere.position },
                'mainSpherePos': { type: 'v3', value: playerFogCenter },
                'FOG_FAR'      : { type: 'f',  value: config.FOG_FAR },
                'FOG_ENABLED'  : { type: 'f',  value: ~~config.FOG_ENABLED },
            },
            vertexShader  : document.getElementById('skin-default-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-default-fragment-shader').textContent,
            transparent   : true,
        }),
        behavior: {
            faceCamera: false, // should OTHER player's spheres face the camera?
        },
        trail: {
            type       : 'line',
            customScale: 1.0,
            lineWidth  : function lineWidth( p ) {
                return p;
            },
            origins: [
                new THREE.Vector3(0.9, 0, 0),
                new THREE.Vector3(-0.9, 0, 0),
            ],
            color: color,
        },
        capture: captureParticles,
    };
};

