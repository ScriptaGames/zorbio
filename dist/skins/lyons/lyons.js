// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true,
 ZOR:true,
 THREE:true,
 playerFogCenter:true
*/

ZOR.PlayerSkins = ZOR.PlayerSkins || {};

ZOR.PlayerSkins.lyons = function ZORLyonsSkin(playerView, metaData) {
    const color = '#D71C26';
    // const trail = ZOR.TrailTemplates.getTrail(metaData.trail, {color: color, opacity: opacity});
    const trail = ZOR.TrailTemplates.getTrail('bubbles', { color: color });
    const capture = ZOR.ParticleTemplates.getParticleEffect(metaData.capture, { color: color });

    return {
        poolname: 'spheres',
        material: new THREE.ShaderMaterial({
            uniforms: {
                'c'            : { type: 'f', value: 1.41803 },
                'p'            : { type: 'f', value: 2.71828 },
                'spherePos'    : { type: 'v3', value: playerView.model.sphere.position },
                'mainSpherePos': { type: 'v3', value: playerFogCenter },
                'FOG_FAR'      : { type: 'f', value: config.FOG_FAR },
                'FOG_ENABLED'  : { type: 'f', value: ~~config.FOG_ENABLED },
                'sphereTexture': { type: 't', value: new THREE.TextureLoader().load(metaData.texture) },
            },
            vertexShader  : document.getElementById('skin-standard-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-standard-fragment-shader').textContent,
            transparent   : true,
        }),
        behavior: {
            faceCamera: true,
        },
        trail  : trail,
        capture: capture,
    };
};

