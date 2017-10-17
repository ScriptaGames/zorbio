// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global THREE:true
global playerFogCenter:true
*/

ZOR.PlayerSkins = ZOR.PlayerSkins || {};

ZOR.PlayerSkins.default = function ZORDefaultSkin(playerView) {
    const playerColor = playerView.playerColor;
    const threeColor  = new THREE.Color(playerColor);

    return {
        poolname: 'spheres',
        material: new THREE.ShaderMaterial({
            uniforms: {
                'c'            : { type: 'f',  value: 1.41803 },
                'p'            : { type: 'f',  value: 2.71828 },
                'color'        : { type: 'c',  value: threeColor },
                'colorHSL'     : { type: 'v3', value: threeColor.getHSL() },
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
        trail  : ZOR.TrailTemplates.getTrail( 'line', { color: playerColor } ),
        capture: ZOR.ParticleTemplates.getParticleEffect( 'bubbles', { color: playerColor } ),
    };
};

