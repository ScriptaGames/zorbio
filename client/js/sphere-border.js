var camera, scene, renderer;
var mesh, playerMesh, borderMesh, borderMaterial;
var playerSizeEl = document.querySelector('#player-size');
var sphereSizeEl = document.querySelector('#sphere-size');
var t = 0;
init();
animate();
function init() {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 600;
    scene = new THREE.Scene();
    var texture = new THREE.TextureLoader().load( 'skins/earth/earth-sphere-map.jpg' );
    var geometry = new THREE.SphereGeometry( 1, 32, 32, 32 );
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    mesh = new THREE.Mesh( geometry, material );
    mesh.position.setX(120);
    scene.add( mesh );

    playerMesh = new THREE.Mesh( geometry, material );
    playerMesh.position.setX(-120);
    scene.add( playerMesh );

    initBorder(mesh);
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize, false );

    setPlayerSize(50);
}

function initBorder(sphereMesh) {
    var geometry = new THREE.SphereGeometry( 1, 32, 32, 32 );
    // var material = new THREE.MeshBasicMaterial( {
    //     color: THREE.ColorKeywords.green,
    //     transparent: true,
    //     opacity: 0.5,
    //     depthTest      : false,
    //     depthWrite     : false,
    // } );
    borderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            riskSpread    : { type : "f",  value : 40 },
            playerSize    : { type : "f",  value : 50 },
            sphereSize    : { type : "f",  value : mesh.scale.x },
            dangerColor   : { type : "c",  value : new THREE.Color('#ff0000') },
            nearbyColor   : { type : "c",  value : new THREE.Color('#444444') },
            safetyColor   : { type : "c",  value : new THREE.Color('#00ff00') },
        },
        vertexShader: document.getElementById('vert').textContent,
        fragmentShader: document.getElementById('frag').textContent,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
    });
    borderMesh = new THREE.Mesh( geometry, borderMaterial );
    borderMesh.position.copy(sphereMesh.position);
    // borderMesh.renderOrder = -100;
    scene.add( borderMesh );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function setPlayerSize(x) {
    playerMesh.scale.setScalar(x);
    borderMaterial.uniforms.playerSize.value = x;
    playerSizeEl.textContent = 'player size: ' + x.toFixed(0);
}
function animate() {
    requestAnimationFrame( animate );
    mesh.rotation.y += 0.0005;
    playerMesh.rotation.y -= 0.0005;
    // mesh.rotation.y += 0.01;
    t += 0.005;

    mesh.scale.setScalar( ((Math.sin(t) + 1)/2) * 145 + 5 );
    borderMesh.scale.setScalar( mesh.scale.x + 5.0 );
    borderMaterial.uniforms.sphereSize.value = mesh.scale.x;
    mesh.scale.setScalar( ((Math.sin(t) + 1)/2) * 145 + 5 );


    sphereSizeEl.textContent = 'sphere size: ' + mesh.scale.x.toFixed(0);

    renderer.render( scene, camera );
}
