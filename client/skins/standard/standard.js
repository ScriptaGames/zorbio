// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global THREE:true
global playerFogCenter:true
global SPE:true
*/

ZOR.PlayerSkins = ZOR.PlayerSkins || {};

ZOR.PlayerSkins.standard = function ZORStandardSkin(playerView, metaData) {
    const opacity = playerView.is_current_player ? 0.2 : 0.6;
    const color   = metaData.color;
    const trail   = metaData.trail;
    const texture = metaData.texture;
    const capture = metaData.capture;

    // TODO: move this to it's on TrailTypes.js file to be used by all skins
    const trailTypes = {
        particle: {
            type : 'particle',
            group: {
                scale  : Math.max(window.innerWidth, window.innerHeight),
                texture: {
                    value: new THREE.TextureLoader().load( 'skins/standard/trail.png' ),
                },
                maxParticleCount: 800,
            },
            emitter: {
                maxAge: {
                    value: 8,
                    // spread: 2,
                },
                position: {
                    value       : new THREE.Vector3(0, 0, 0),
                    spread      : new THREE.Vector3(0, 0, 0),
                    spreadClamp : new THREE.Vector3(0, 0, 0),
                    radius      : 5,
                    distribution: SPE.distributions.SPHERE,
                },

                opacity: {
                    value: [opacity, 0],
                },

                angle: {
                    value : [0],
                    spread: [8, 0],
                },

                drag: {
                    value: 8.0,
                },

                color: {
                    value: new THREE.Color( color ),
                },

                size: {
                    value: [6, 0],
                },

                particleCount   : 800,
                activeMultiplier: 0.1,
            },
        },

        line: {
            type       : 'line',
            customScale: 1.0,
            lineWidth  : function lineWidth( p ) {
                return p;
            },
            origins: [
                new THREE.Vector3(0.9, 0, 0),
                new THREE.Vector3(-0.9, 0, 0),
            ],
            color: new THREE.Color( color ),
        },
    };

    const captureParticles = ZOR.ParticleFx[capture];

    if (capture === 'bubbles') {
        // customize bubble capture particles based on skin primary color
        captureParticles.emitter.color.value = [new THREE.Color( color )];
    }

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
                'sphereTexture': { type: 't',  value: new THREE.TextureLoader().load( texture ) },
            },
            vertexShader  : document.getElementById('skin-standard-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-standard-fragment-shader').textContent,
            transparent   : true,
        }),
        behavior: {
            faceCamera: false, // should OTHER player's spheres face the camera?
        },
        trail  : trailTypes[trail],
        capture: captureParticles,
    };
};

