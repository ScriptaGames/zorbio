// Canvas
var scene;
var camera;
//TODO: rename controls to cameraControls
var controls;

var canvas = document.getElementById('renderCanvas');
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

// constants
var MOVE_SPEED_SCALE         = 0.5;
var PLAYER_POSITION_INTERVAL = 50;   // 50 milliseconds or 20 times per second
var HEARTBEAT_INTERVAL       = 3000; // How long to wait between sending heartbeat milliseconds
var INITIAL_CAMERA_DISTANCE  = 50;
var MAX_PLAYER_RADIUS        = 150;
var BASE_PLAYER_SPEED        = 2;
var FOOD_VALUE               = 0.16; // amount to increase sphere by when food is consumed
var FOOD_RESPAWN_FRAMES      = 10*60;
var FOOD_CAPTURE_ASSIST      = 2; // this number is added to player's radius for food capturing
var FOG_NEAR                 = 100;
var FOG_FAR                  = 1000;
var FOG_COLOR                = THREE.ColorKeywords.black;
var INITIAL_FOV              = 50;


// Player
var playerName;
var playerType;
var playerNameInput = document.getElementById('playerNameInput');
var player;
var playerSpeed = BASE_PLAYER_SPEED;
var playerVelocity = new THREE.Vector3();

// Game state
var players = {};
var food = {};
var gameStart = false;
var kicked = false;
var disconnected = false;
//var died = false;

var renderer;

// Model that represents the game state shared with server
var zorbioModel;

function startGame(type) {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
    playerType = type;

    showGame(true);

    // Connect to the server
    var colorCode = UTIL.getRandomIntInclusive(0, PlayerView.COLORS.length - 1);
    connectToServer(playerType, playerName, colorCode);
}

// check if nick is valid alphanumeric characters (and underscores)
function validNick() {
    var regex = /^\w*$/;
    console.log('Regex Test', regex.exec(playerNameInput.value));
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function () {
    'use strict';

    var btn = document.getElementById('startButton'),
        nickErrorText = document.querySelector('#startMenu .input-error');

    btn.onclick = function () {

        // check if the nick is valid
        if (validNick()) {
            startGame('player');
        } else {
            nickErrorText.style.display = 'inline';
        }
    };

    playerNameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
        var KEY_ENTER = 13;

        if (key === KEY_ENTER) {
            if (validNick()) {
                //TODO: allow ZOR.PlayerTypes.SPECTATOR type
                startGame(ZOR.PlayerTypes.PLAYER);
            } else {
                nickErrorText.style.display = 'inline';
            }
        }
    });
};

function createScene() {

    init();
    animate();

    function init() {

        scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );
        scene.fog = new THREE.Fog( FOG_COLOR, FOG_NEAR, FOG_FAR );

        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        renderer.setClearColor( FOG_COLOR );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        // orbit camera

        camera = new THREE.PerspectiveCamera(
            INITIAL_FOV,
            window.innerWidth / window.innerHeight,
            1,
            FOG_FAR
        );
        camera.position.z = 200;

        controls = new THREE.FollowOrbitControls( camera, renderer.domElement );
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = false;
        controls.minDistance = INITIAL_CAMERA_DISTANCE;
        controls.maxDistance = INITIAL_CAMERA_DISTANCE;
        // controls.minPolarAngle = Infinity; // radians
        // controls.maxPolarAngle = -Infinity; // radians

        // sphere
        // Create the player view and adds the player sphere to the scene
        player.initView(scene);

        // camera
        controls.target = player.view.mainSphere;

        // food
        drawFood();

        // skybox
        var materialArray = [];
        for (i = 0; i < 6; i++) {
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/skybox_grid_black.jpg' ) }));
            materialArray[i].side = THREE.BackSide;
        }
        var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyboxGeom = new THREE.BoxGeometry( zorbioModel.worldSize.x, zorbioModel.worldSize.y, zorbioModel.worldSize.z, 1, 1, 1 );
        var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
        scene.add( skybox );

        // lights

        light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function animate() {

        requestAnimationFrame( animate );

        handleKeysDown();

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        updateFoodRespawns();

        checkFoodCaptures();

        player.view.update(scene, camera, renderer);

        render();
    }

    function render() {

        renderer.render( scene, camera );

    }
}

function drawPlayers() {
    var playerModels = zorbioModel.players;
    // Iterate over player
    Object.getOwnPropertyNames(playerModels).forEach(function (id) {
        var playerModel = playerModels[id];
        if (playerModel.type === ZOR.PlayerTypes.PLAYER) {
            // Only draw other players
            if (id !== player.getPlayerId()) {
                players[id] = new PlayerController(playerModel);
            }
        }
    });
}

function radius(sphere) {
    return sphere.geometry.boundingSphere.radius;
}

function checkFoodCaptures() {

    var x, y, z, i, l;
    var vdist = checkFoodCaptures.vdist;
    var dist = 0;
    var mainSphere = player.view.mainSphere;
    var sphere_radius = radius(mainSphere); // x, y, and z scale should all be the same, always

    for ( i = 0, l = food.positions.length; i < l; i += 3 ) {
        if (aliveFood( i / 3 )) {
            x = food.positions[ i     ];
            y = food.positions[ i + 1 ];
            z = food.positions[ i + 2 ];
            vdist.set(x, y, z);

            dist = vdist.distanceTo(mainSphere.position);
            if (dist <= sphere_radius + FOOD_CAPTURE_ASSIST) {
                captureFood( i / 3 );
            }
        }
    }
}
checkFoodCaptures.vdist = new THREE.Vector3();


//function updateActors() {
//    var actors = zorbioModel.actors;
//
//    // Iterate over actor properties in the actors object
//    Object.getOwnPropertyNames(actors).forEach(function (id) {
//        var actor = actors[id];
//        if (actor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
//            if (id !== player.sphere.id) {
//                if (actors[id].geo) {
//                    // update players sphere geo position
//                    actors[id].geo.position = actors[id].position;
//                }
//            }
//        }
//    });
//}

function captureFood(fi) {
    if (aliveFood(fi)) {
        var mainSphere = player.view.mainSphere;

        captureFood.p = FOOD_VALUE / mainSphere.scale.x;

        hideFood( fi );

        // grow sphere, with diminishing returns on food as you get bigger.
        // prevents runaway growth.
        player.grow( captureFood.p );

        // push camera back a bit

        controls.minDistance += 16 * captureFood.p;
        controls.maxDistance = controls.minDistance;
    }
}
captureFood.p = 0;

function aliveFood(fi) {
    return food.respawning[fi] === 0;
}

function hideFood(fi) {
    food.respawning[fi] = FOOD_RESPAWN_FRAMES;
    food.particleSystem.geometry.attributes.respawning.needsUpdate = true;
}

function showFood(fi) {
    food.respawning[fi] = 0;
    food.particleSystem.geometry.attributes.respawning.needsUpdate = true;
}

function updateFoodRespawns() {
    for (var i = 0, l = food.respawning.length; i < l; ++i) {
        food.respawning[i] = Math.max( food.respawning[i] - 1, 0 );
        food.particleSystem.geometry.attributes.respawning.needsUpdate = true;
    }
}

function drawFood() {

    food.positions = new Float32Array( zorbioModel.foodCount * 3 );
    food.colors = new Float32Array( zorbioModel.foodCount * 3 );
    food.respawning = new Float32Array( zorbioModel.foodCount );

    var positions = food.positions;
    var colors = food.colors;
    var respawning = food.respawning;

    // copy food position and food color values from the zorbioModel.food array
    // into the typed arrays for the particle system

    var X, Y, Z, R, G, B;
    var particle_index = 0;
    var food_index = 0;
    var i = 0;
    for (i = 0; i < zorbioModel.foodCount; i++) {

        X = zorbioModel.food[ food_index     ];
        Y = zorbioModel.food[ food_index + 1 ];
        Z = zorbioModel.food[ food_index + 2 ];
        R = zorbioModel.food[ food_index + 3 ];
        G = zorbioModel.food[ food_index + 4 ];
        B = zorbioModel.food[ food_index + 5 ];

        respawning[ i ] = 0;

        positions[ particle_index     ] = X;
        positions[ particle_index + 1 ] = Y;
        positions[ particle_index + 2 ] = Z;

        colors[ particle_index     ] = R / 255;
        colors[ particle_index + 1 ] = G / 255;
        colors[ particle_index + 2 ] = B / 255;

        particle_index += 3;
        food_index += 6;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'respawning', new THREE.BufferAttribute( respawning, 1 ) );
    geometry.addAttribute( 'ca', new THREE.BufferAttribute( colors, 3 ) );

    //

    var texture = THREE.ImageUtils.loadTexture( "textures/solid-particle.png" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    var material = new THREE.ShaderMaterial( {

        uniforms: {
            amplitude: { type: "f", value: 1.0 },
            color:     { type: "c", value: new THREE.Color( 0xff0000 ) },
            texture:   { type: "t", value: texture },
            size:      { type: "f", value: 3000 }
        },
        vertexShader:   document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        transparent:    false,
        depthTest:      true,

    });

    //

    food.particleSystem = new THREE.Points( geometry, material );
    scene.add( food.particleSystem );

}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);

var KeysDown = {};
var KeyCodes = {
    87 : 'w',
    83 : 's',
    65 : 'a',
    68 : 'd',
    32 : 'space',
    16 : 'shift'
};

var ListenForKeys = Object.keys(KeyCodes);

function handleKeydown(evt) {
    var we_care_about_this_key;
    var already_pressed;

    if (!gameStart) return;

    // if key exists in keycodes, set its 'down' state to true
    we_care_about_this_key = ListenForKeys.indexOf(evt.keyCode+'') !== -1;
    if (we_care_about_this_key) {
        already_pressed = KeysDown[KeyCodes[evt.keyCode]];
        if (!already_pressed) {
            keyJustPressed(KeyCodes[evt.keyCode]);
        }
        KeysDown[KeyCodes[evt.keyCode]] = true;
    }
}

function handleKeyup(evt) {
    if (!gameStart) return;

    // if key exists in keycodes, set its 'down' state to false
    var we_care_about_this_key = ListenForKeys.indexOf(evt.keyCode+'') !== -1;
    if (we_care_about_this_key) {
        keyReleased(KeyCodes[evt.keyCode]);
        KeysDown[KeyCodes[evt.keyCode]] = false;
    }
}

function handleKeysDown() {
    for( var key in KeysDown ) {
        if (KeysDown[key]) {
            keyDown(key);
        }
    }
}

function keyDown( key ) {
    if ( key === 'w' ) {
        moveForward();
    }
    else if ( key === 's' ) {
        moveBackward();
    }
}

function keyJustPressed(key) {
    console.log('key ' + key + ' just pressed');
}

function keyReleased(key) {
    console.log('key ' + key + ' released');
}


// function updateMovement() {
//     var v = updateMovement.v;
//     v.copy( sphere.position );
//     v.sub( camera.position );
//     v.multiplyScalar( -1 );
//     v.normalize();
//     v.multiplyScalar( BASE_PLAYER_SPEED );
//     sphere.position.sub( v );
// }
// updateMovement.v = new THREE.Vector3();

function moveForward() {
    var v = moveForward.v;
    var mainSphere = player.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.multiplyScalar( -1 );
    v.normalize();
    v.multiplyScalar( BASE_PLAYER_SPEED );
    v = checkWallCollision( mainSphere.position, v, zorbioModel.worldSize );
    mainSphere.position.sub( v );
}
moveForward.v = new THREE.Vector3();

function checkWallCollision( p, v, w ) {

    var vs = v.clone();
    var r = radius( player.view.mainSphere );

    if ( hitxp( p, r, v, w ) || hitxn( p, r, v, w ) )
        vs.x = 0;

    if ( hityp( p, r, v, w ) || hityn( p, r, v, w ) )
        vs.y = 0;

    if ( hitzp( p, r, v, w ) || hitzn( p, r, v, w ) )
        vs.z = 0;

    return vs;

}

// TODO: make sure when a collision occurs with two or more walls at once
// happens, it is handled correctly

// functions to detect hitting the wall in the positive (p) and negative (n)
// directions, on x, y, and z axes.
function hitxp( p, r, v, w ) { return hitp( p, r, v, w, 'x' ); }
function hitxn( p, r, v, w ) { return hitn( p, r, v, w, 'x' ); }
function hityp( p, r, v, w ) { return hitp( p, r, v, w, 'y' ); }
function hityn( p, r, v, w ) { return hitn( p, r, v, w, 'y' ); }
function hitzp( p, r, v, w ) { return hitp( p, r, v, w, 'z' ); }
function hitzn( p, r, v, w ) { return hitn( p, r, v, w, 'z' ); }

function hitp( p, r, v, w, axis ) {
    return p[axis] + r - v[axis] > w[axis]/2;
}
function hitn( p, r, v, w, axis ) {
    return p[axis] - r - v[axis] < -w[axis]/2;
}

function moveBackward() {
    var v = moveBackward.v;
    var mainSphere = player.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.normalize();
    v.multiplyScalar( BASE_PLAYER_SPEED );
    mainSphere.position.sub( v );
}
moveBackward.v = new THREE.Vector3();

function cleanupMemory() {
    players = {};
    food = {};
    zorbioModel = null;
}

function removePlayerFromGame(playerId) {
    var kickedPlayer = zorbioModel.players[playerId];

    if (kickedPlayer && kickedPlayer.sphere) {
        var geo = zorbioModel.actors[kickedPlayer.sphere.id].geo;

        // remove player from model
        zorbioModel.actors[kickedPlayer.sphere.id] = null;
        delete zorbioModel.actors[kickedPlayer.sphere.id];
        zorbioModel.players[playerId] = null;
        delete zorbioModel.players[playerId];

        console.log('removed player from game', kickedPlayer.sphere.id);
    }
}
