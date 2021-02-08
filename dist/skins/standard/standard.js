// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global THREE:true
global playerFogCenter:true
*/

ZOR.PlayerSkins = ZOR.PlayerSkins || {};

ZOR.PlayerSkins.standard = function ZORStandardSkin(playerView, metaData) {
    const opacity = playerView.is_current_player ? 0.2 : 0.6;
    const color   = metaData.color;
    const trail   = ZOR.TrailTemplates.getTrail( metaData.trail, { color: color, opacity: opacity } );
    const capture = ZOR.ParticleTemplates.getParticleEffect( metaData.capture, { color: color } );

    return {
        poolname: 'spheres',
        material: new THREE.ShaderMaterial({
            uniforms: {
                'c'            : { type: 'f',  value: 1.41803 },
                'p'            : { type: 'f',  value: 2.71828 },
                'spherePos'    : { type: 'v3', value: playerView.model.sphere.position },
                'mainSpherePos': { type: 'v3', value: playerFogCenter },
                'FOG_FAR'      : { type: 'f',  value: config.FOG_FAR },
                'FOG_ENABLED'  : { type: 'f',  value: ~~config.FOG_ENABLED },
                'sphereTexture': { type: 't',  value: new THREE.TextureLoader().load( metaData.texture ) },
            },
            vertexShader  : document.getElementById('skin-standard-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-standard-fragment-shader').textContent,
            transparent   : true,
        }),
        behavior: {
            faceCamera: false, // should OTHER player's spheres face the camera?
        },
        trail  : trail,
        capture: capture,
    };
};

