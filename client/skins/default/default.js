var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.default = function ZORDefaultSkin(playerView) {
    var opacity = playerView.is_current_player ? 1.0 : 1.0;
    var color = new THREE.Color(playerView.playerColor);
    var particle_count = 200;

    return {
        geometry: {},
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
            customScale: 0.5,
            group: {
                scale: Math.max(window.innerWidth, window.innerHeight),
                texture: {
                    value:  new THREE.TextureLoader().load( "skins/default/trail.png" ),
                },
                maxParticleCount: particle_count,
            },
            emitter: {
                maxAge: {
                    value: 2,
                    // spread: 2,
                },
                position: {
                    value: new THREE.Vector3(0, 0, 0),
                },

                opacity: {
                    value: [opacity, 0],
                },

                color: {
                    value: new THREE.Color(playerView.playerColor),
                },

                size: {
                    value: [90],
                },

                particleCount: particle_count,
                activeMultiplier: 1.0,
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
