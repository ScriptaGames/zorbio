var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.default = function ZORDefaultSkin(playerView) {
    var opacity = playerView.is_current_player ? 0.2 : 0.6;

    return {
        friendly_name: 'Smooth Shade',
        material: {
            uniforms: {
                "c"           : { type : "f",  value : 1.41803 },
                "p"           : { type : "f",  value : 2.71828 },
                color         : { type : "c",  value : new THREE.Color(playerView.playerColor) },
                colorHSL      : { type : "v3",  value : new THREE.Color(playerView.playerColor).getHSL() },
                spherePos     : { type : "v3", value : playerView.position },
                mainSpherePos : { type : "v3", value : playerFogCenter },
                FOG_FAR       : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
            }
        },
        trail: {
            group: {
                scale: Math.min(window.innerWidth, window.innerHeight),
                texture: {
                    value:  new THREE.TextureLoader().load( "textures/trail-particle.png" ),
                },
                maxParticleCount: 200,
            },
            emitter: {
                maxAge: {
                    value: 4,
                    // spread: 2,
                },
                position: {
                    value: new THREE.Vector3(0, 0, 0),
                },

                opacity: {
                    value: [opacity, 0],
                },

                drag: {
                    value: 1.0,
                },

                color: {
                    value: new THREE.Color(playerView.playerColor),
                },

                size: {
                    value: [100, 0],
                },

                particleCount: 200,
                activeMultiplier: 0.1,
            },
        },
    };
};
