// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global THREE:true
global playerFogCenter:true
global SPE:true
*/

ZOR.PlayerSkins = ZOR.PlayerSkins || {};

ZOR.PlayerSkins.default = function ZORDefaultSkin(playerView) {
    const color = new THREE.Color(playerView.playerColor);

    return {
        poolname: 'spheres',
        material: new THREE.ShaderMaterial({
            uniforms: {
                "c"           : { type : "f",  value : 1.41803 },
                "p"           : { type : "f",  value : 2.71828 },
                color         : { type : "c",  value : color },
                colorHSL      : { type : "v3", value : color.getHSL() },
                spherePos     : { type : "v3", value : playerView.model.sphere.position },
                mainSpherePos : { type : "v3", value : playerFogCenter },
                FOG_FAR       : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
            },
            vertexShader: document.getElementById('skin-default-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-default-fragment-shader').textContent,
            transparent: true,
            // this allows spheres to clip each other nicely, BUT it makes spheres appear on top of the cube boundary. :/
            // depthFunc      : THREE.LessDepth,
            // depthTest      : false,
            // depthWrite     : true,
            // blending       : THREE.AdditiveBlending,
        }),
        behavior: {
            faceCamera: false, // should OTHER player's spheres face the camera?
        },
        trail: {
            type: 'line',
            customScale: 1.0,
            lineWidth: function lineWidth( p ) { return p; },
            origins: [
                new THREE.Vector3(0.9, 0, 0),
                new THREE.Vector3(-0.9, 0, 0),
            ],
            color: color,
        },
        capture: {
            customScale: 1.0,
            group: {
                scale: Math.max(window.innerWidth, window.innerHeight),
                maxParticleCount: 1000,
                texture: {
                    value: new THREE.TextureLoader().load( "skins/default/trail.png" ),
                },
                blending: THREE.AdditiveBlending,
            },
            emitter: {
                type: SPE.distributions.SPHERE,
                position: {
                    spread: new THREE.Vector3( 5 ),
                    radius: 10,
                },
                velocity: {
                    spread: new THREE.Vector3( 100 ),
                },
                size: {
                    value: [ 60, 0 ]
                },
                opacity: {
                    value: [1, 0]
                },
                color: {
                    value: [color],
                },
                particleCount: 70,
                alive: false,
                duration: 0.05,
                maxAge: {
                    value: 1,
                },
            },
        },
    };
};

ZOR.PlayerSkins.default.meta = {
    friendly_name: 'Smooth Shade',
    name: 'default',
    preview: 'skins/default/thumb.jpg',
    sort: 1,
};
