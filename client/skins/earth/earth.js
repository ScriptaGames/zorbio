var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.earth = function ZOREarthSkin(playerView) {
    var opacity = playerView.is_current_player ? 0.4 : 0.8;
    var color = new THREE.Color('#ffffff');

    return {
        material: {
            uniforms: {
                "c"           : { type : "f",  value : 1.41803 },
                "p"           : { type : "f",  value : 2.71828 },
                spherePos     : { type : "v3", value : playerView.model.sphere.position },
                mainSpherePos : { type : "v3", value : playerFogCenter },
                FOG_FAR       : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
                sphereTexture : { type : "t",  value : new THREE.TextureLoader().load( "skins/earth/earth-sphere-map.jpg" ) },
            },
            vertexShader: document.getElementById('skin-earth-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-earth-fragment-shader').textContent,
            transparent: true,
            // this allows spheres to clip each other nicely, BUT it makes spheres appear on top of the cube boundary. :/
            // depthFunc      : THREE.LessDepth,
            // depthTest      : false,
            // depthWrite     : true,
            // blending       : THREE.AdditiveBlending,
        },
        trail: {
            group: {
                scale: Math.max(window.innerWidth, window.innerHeight),
                texture: {
                    value:  new THREE.TextureLoader().load( "skins/earth/trail.png" ),
                    frames: new THREE.Vector2(4, 2),
                    loop: 1,
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

                velocity: {
                    value: new THREE.Vector3(0, 0, 0),
                    spread: new THREE.Vector3(14, 14, 14),
                },

                drag: {
                    value: 8.0,
                },

                color: {
                    value: new THREE.Color('#B9D5EB'),
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

ZOR.PlayerSkins.earth.meta = {
    friendly_name: 'Planet Earth',
    name: 'earth',
    preview: 'skins/earth/thumb.jpg',
    sort: 2,
};
