// Canvas
var scene;
var camera;
var sphere;
var food = {};
var canvas = document.getElementById('renderCanvas');
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

// Player
var playerName;
var playerType;
var playerNameInput = document.getElementById('playerNameInput');
var player;

// Game state
var gameStart = false;
var kicked = false;
var disconnected = false;
//var died = false;

var renderer;


// Model that represents all of the visual elements of the game
var zorbioModel;

// constants
var MOVE_SPEED_SCALE         = 0.5;
var PLAYER_POSITION_INTERVAL = 50;    // 50 milliseconds or 20 times per second
var HEARTBEAT_INTERVAL       = 3000;  // How long to wait between sending heartbeat milliseconds

//TODO: add more colors, only select ones not used.
var COLORS = [
    new THREE.Color(THREE.ColorKeywords.red),
    new THREE.Color(THREE.ColorKeywords.blue),
    new THREE.Color(THREE.ColorKeywords.yellow),
    new THREE.Color(THREE.ColorKeywords.green),
    new THREE.Color(THREE.ColorKeywords.purple),
    new THREE.Color(THREE.ColorKeywords.magenta),
];

function startGame(type) {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
    playerType = type;

    showGame(true);

    // Connect to the server
    var colorCode = UTIL.getRandomIntInclusive(0, 5);
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

var camera, controls, scene, renderer;
function createScene() {

    init();
    animate();

    function init() {

        scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );

        renderer = new THREE.WebGLRenderer({ canvas: canvas });
        // renderer.setClearColor( scene.fog.color );
        renderer.setClearColor( THREE.ColorKeywords.white );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        // orbit camera

        camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            1,
            4*Math.max(zorbioModel.worldSize.x, Math.max(zorbioModel.worldSize.y, zorbioModel.worldSize.z))
        );
        camera.position.z = 200;

        controls = new THREE.FollowOrbitControls( camera, renderer.domElement );
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        // controls.minDistance = 30;
        // controls.maxDistance = 30;
        // controls.minPolarAngle = 0; // radians
        // controls.maxPolarAngle = Math.PI*2; // radians

        // sphere

        // var sphereRef = drawPlayerSphere(player.sphere);
        var geometry = new THREE.SphereGeometry( 5, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: THREE.ColorKeywords.red } );
        material.transparent = true;
        material.depthTest = true;
        material.opacity = 0.5;
        sphere = new THREE.Mesh( geometry, material );
        // sphere.renderOrder = -1;
        scene.add( sphere );

        controls.target = sphere;
        // food

        drawFood();

        // skybox
        var materialArray = [];
        for (i = 0; i < 6; i++) {
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/skybox_grid.jpg' ) }));
            materialArray[i].side = THREE.BackSide;
        }
        var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyboxGeom = new THREE.BoxGeometry( zorbioModel.worldSize.x, zorbioModel.worldSize.y, zorbioModel.worldSize.z, 1, 1, 1 );
        var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
        scene.add( skybox );

        // register sphere with player object who owns it

        player.sphere.geo = sphere;

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

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
        // controls.target.set( sphere.position );

        render();

    }

    function render() {

        // // TODO: remove this, it's just a demo of toggling food particles
        // var time = (new Date()).getTime();
        // var fi = time % food.living.length;
        // hideFood(fi);
        // showFood( ( fi + food.living.length / 2 ) % food.living.length );
        // // ENDTODO: remove this, it's just a demo of toggling food particles

        handleKeysDown();

        renderer.render( scene, camera );

    }
}

function drawActors() {
    var actors = zorbioModel.actors;
    // Iterate over actor properties in the actors object
    Object.getOwnPropertyNames(actors).forEach(function (id) {
        var actor = actors[id];
        if (actor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
            // Only draw other players
            if (id !== player.sphere.id) {
                actors[id].geo = drawPlayerSphere(actor);
            }
        }
    });
}

function drawPlayerSphere() {

    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    return sphere;
}

function updateActors() {
    var actors = zorbioModel.actors;

    // Iterate over actor properties in the actors object
    Object.getOwnPropertyNames(actors).forEach(function (id) {
        var actor = actors[id];
        if (actor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
            if (id !== player.sphere.id) {
                if (actors[id].geo) {
                    // update players sphere geo position
                    actors[id].geo.position = actors[id].position;
                }
            }
        }
    });
}

function hideFood(fi) {
    food.living[fi] = 0;
    food.particleSystem.geometry.attributes.living.needsUpdate = true;
}

function showFood(fi) {
    food.living[fi] = 1;
    food.particleSystem.geometry.attributes.living.needsUpdate = true;
}

function drawFood() {

    food.positions = new Float32Array( zorbioModel.foodCount * 3 );
    food.colors = new Float32Array( zorbioModel.foodCount * 3 );
    food.living = new Float32Array( zorbioModel.foodCount );

    var positions = food.positions;
    var colors = food.colors;
    var living = food.living;

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

        living[ i ] = 1;

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
    geometry.addAttribute( 'living', new THREE.BufferAttribute( living, 1 ) );
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
    16 : 'shift',
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
var keyDownMoveVector;
function keyDown(key) {
    keyDownMoveVector = sphere.position.clone();
    if (key === 'w') {
        keyDownMoveVector.sub(camera.position);
        keyDownMoveVector.multiplyScalar(-1);
        keyDownMoveVector.normalize();
        sphere.position.sub(keyDownMoveVector);
    }
    else if (key === 's') {
        keyDownMoveVector.sub(camera.position);
        keyDownMoveVector.normalize();
        sphere.position.sub(keyDownMoveVector);
    }
}
function keyJustPressed(key) {
    console.log('key ' + key + ' just pressed');
}
function keyReleased(key) {
    console.log('key ' + key + ' released');
}

function cleanupMemory() {
    zorbioModel = null;
    scene = null;
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
