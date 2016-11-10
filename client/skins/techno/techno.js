var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.techno = function ZORTechnoSkin(playerView) {
    var opacity = playerView.is_current_player ? 0.1 : 0.4;
    var color = new THREE.Color('#ffffff');

    return {
        geometry: {
            polycount_w: 20,
            polycount_h: 10,
        },
        material: new THREE.ShaderMaterial({
            uniforms: {
                "c"           : { type : "f",  value : 1.41803 },
                "p"           : { type : "f",  value : 2.71828 },
                spherePos     : { type : "v3", value : playerView.model.sphere.position },
                mainSpherePos : { type : "v3", value : playerFogCenter },
                FOG_FAR       : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
                sphereTexture : { type : "t",  value : new THREE.TextureLoader().load( "skins/techno/texture.jpg" ) },
            },
            vertexShader: document.getElementById('skin-techno-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-techno-fragment-shader').textContent,
            transparent: true,
            // this allows spheres to clip each other nicely, BUT it makes spheres appear on top of the cube boundary. :/
            // depthFunc      : THREE.LessDepth,
            // depthTest      : false,
            // depthWrite     : true,
            // blending       : THREE.AdditiveBlending,
        }),
        behavior: {
        },
        trail: {
            group: {
                scale: Math.max(window.innerWidth, window.innerHeight),
                texture: {
                    value:  new THREE.TextureLoader().load( "skins/techno/trail.png" ),
                    frames: new THREE.Vector2(2, 1),
                    loop: 4,
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
                    value: 8.0,
                },

                color: {
                    value: new THREE.Color('#B9D5EB'),
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

ZOR.PlayerSkins.techno.meta = {
    friendly_name: 'Techno',
    name: 'techno',
    preview: 'skins/techno/thumb.jpg',
    sort: 3,
};
