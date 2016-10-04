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
    };
};

ZOR.PlayerSkins.reddit.meta = {
    friendly_name: 'Reddit',
    name: 'reddit',
    preview: 'skins/reddit/thumb.png',
    unlock_url: '?reddit',
    sort: 0,
};
