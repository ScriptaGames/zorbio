var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.reddit = function ZORRedditSkin(playerView) {
    var opacity = playerView.is_current_player ? 0.2 : 0.6;

    return {
        geometry: {
            spin: {
                y: 0.001,
            },
        },
        material: {
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
        },
        trail: {
            group: {
                scale: Math.max(window.innerWidth, window.innerHeight),
                texture: {
                    value:  new THREE.TextureLoader().load( "skins/reddit/trail.png" ),
                },
                maxParticleCount: 800,
            },
            emitter: {
                maxAge: {
                    value: 8,
                    // spread: 2,
                },
                position: {
                    value: new THREE.Vector3(0, 0, 0),
                    spread: new THREE.Vector3(0, 0, 0),
                    spreadClamp: new THREE.Vector3(0, 0, 0),
                    radius: 5,
                    distribution: SPE.distributions.SPHERE,
                },

                opacity: {
                    value: [opacity, 0],
                },

                angle: {
                    value: [0],
                    spread: [8, 0],
                },

                drag: {
                    value: 8.0,
                },

                color: {
                    value: new THREE.Color('#B9D5EB'),
                },

                size: {
                    value: [6, 0],
                },

                particleCount: 800,
                activeMultiplier: 0.1,
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
