var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.reddit = function ZORRedditSkin(playerView) {

    return {
        geometry: {
            spin: {
                y: 0.001,
            },
        },
        material: new THREE.ShaderMaterial({
            uniforms: {
                "c"           : { type : "f",  value : 1.41803 },
                "p"           : { type : "f",  value : 2.71828 },
                spherePos     : { type : "v3", value : playerView.model.sphere.position },
                mainSpherePos : { type : "v3", value : playerFogCenter },
                FOG_FAR       : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
                sphereTexture : { type : "t",  value : new THREE.TextureLoader().load( "skins/reddit/texture.jpg" ) },
            },
            vertexShader: document.getElementById('skin-reddit-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-reddit-fragment-shader').textContent,
            transparent: true,
        }),
        behavior: {
        },
        trail: {
            type: 'line',
            customScale: 1.5,
            lineWidth: function lineWidth( p ) { return p; },
            origins: [
                new THREE.Vector3(0.9, 0, 0),
                new THREE.Vector3(-0.9, 0, 0),
            ],
            color: new THREE.Color('#FF431D'),
        },
        capture: {
            customScale: 1.0,
            group: {
                scale: Math.max(window.innerWidth, window.innerHeight),
                maxParticleCount: 1000,
                texture: {
                    value: new THREE.TextureLoader().load( "textures/smokeparticle.png" ),
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
                    value: [ 30, 0 ]
                },
                opacity: {
                    value: [1, 0]
                },
                color: {
                    value: [new THREE.Color('yellow'),new THREE.Color('red')],
                },
                particleCount: 100,
                alive: true,
                duration: 0.05,
                maxAge: {
                    value: 1,
                },
            },
        },
    };
};

ZOR.PlayerSkins.reddit.meta = {
    friendly_name: 'Reddit',
    name: 'reddit',
    preview: 'skins/reddit/thumb.png',
    unlock_url: '?reddit',
    sort: 0,
};
