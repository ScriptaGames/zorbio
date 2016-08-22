var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.default = function ZORDefaultSkin(playerView) {
    var opacity = playerView.is_current_player ? 0.1 : 0.4;
    var color = new THREE.Color(playerView.playerColor);

    return {
        friendly_name: 'Smooth Shade',
        material: {
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
        },
        trail: {
            group: {
                scale: Math.min(window.innerWidth, window.innerHeight),
                texture: {
                    value:  new THREE.TextureLoader().load( "skins/default/trail.png" ),
                },
                maxParticleCount: 800,
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

                particleCount: 800,
                activeMultiplier: 0.1,
            },
        },
    };
};
