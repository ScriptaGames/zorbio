var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.earth = function ZOREarthSkin(playerView) {
    var opacity = playerView.is_current_player ? 0.1 : 0.4;
    var color = new THREE.Color('#ffffff');

    return {
        geometry: {},
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
                    spread: [6, 0],
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

ZOR.PlayerSkins.earth.meta = {
    friendly_name: 'Planet Earth',
    name: 'earth',
    preview: 'skins/earth/thumb.jpg',
    sort: 2,
};
