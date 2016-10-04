var ZOR = ZOR || {};
ZOR.PlayerSkins = ZOR.PlayerSkins || {};

//

ZOR.PlayerSkins.boing = function ZORBoingSkin(playerView) {
    var opacity = playerView.is_current_player ? 0.1 : 0.4;
    var color = new THREE.Color('#ffffff');

    return {
        geometry: {
            polycount_w: 20,
            polycount_h: 10,
        },
        material: {
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
        },
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
            color: new THREE.Color('#D71C26'),
        },
    };
};

ZOR.PlayerSkins.boing.meta = {
    friendly_name: 'Boing',
    name: 'boing',
    preview: 'skins/boing/thumb.jpg',
    sort: 3,
};
