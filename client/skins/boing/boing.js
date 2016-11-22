var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.boing = function ZORBoingSkin(playerView) {
    var color = new THREE.Color('#D71C26');

    return {
        poolname: 'lowPolySpheres',
        material: new THREE.ShaderMaterial({
            uniforms: {
                "c"           : { type : "f",  value : 1.41803 },
                "p"           : { type : "f",  value : 2.71828 },
                spherePos     : { type : "v3", value : playerView.model.sphere.position },
                mainSpherePos : { type : "v3", value : playerFogCenter },
                FOG_FAR       : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED   : { type : "f",  value : ~~config.FOG_ENABLED },
                sphereTexture : { type : "t",  value : new THREE.TextureLoader().load( "skins/boing/texture.jpg" ) },
            },
            vertexShader: document.getElementById('skin-boing-vertex-shader').textContent,
            fragmentShader: document.getElementById('skin-boing-fragment-shader').textContent,
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
                    value: new THREE.TextureLoader().load( "skins/boing/trail.png" ),
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
                    value: [ 120, 0 ]
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

ZOR.PlayerSkins.boing.meta = {
    friendly_name: 'Boing',
    name: 'boing',
    preview: 'skins/boing/thumb.jpg',
    sort: 3,
};
