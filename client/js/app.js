// Canvas
var scene;
var camera;
var sphere;
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

        camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            1,
            4*Math.max(zorbioModel.worldSize.x, Math.max(zorbioModel.worldSize.y, zorbioModel.worldSize.z))
        );
        camera.position.z = 200;

        controls = new THREE.OrbitControls( camera, renderer.domElement );
        //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        // sphere

        // var sphereRef = drawPlayerSphere(player.sphere);
        var geometry = new THREE.SphereGeometry( 5, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: THREE.ColorKeywords.red } );
        material.transparent = true;
        material.depthTest = false;
        material.opacity = 0.8;
        sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );


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
        render();

    }

    function render() {

        renderer.render( scene, camera );

    }
}

// This begins the creation of a function that we will 'call' just after it's built
//function createScene() {

//    // Now create a basic Babylon Scene object
//    scene = new THREE.Scene();

//    scene = new THREE.Scene();
//    // scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );

//    renderer = new THREE.WebGLRenderer({ canvas: canvas });
//    renderer.setClearColor( THREE.ColorKeywords.white );
//    renderer.setPixelRatio( window.devicePixelRatio );
//    renderer.setSize( screenWidth, screenHeight );

//    // var sphereRef = drawPlayerSphere(player.sphere);
//    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
//    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
//    sphere = new THREE.Mesh( geometry, material );
//    scene.add( sphere );

//    // This creates and positions a camera
//    camera = new THREE.PerspectiveCamera( 60, screenWidth, screenHeight, 1, 1000);
//    camera.position.z = 500;
//    camera.lookAt(sphere);
//    // controls = new THREE.OrbitControls( camera, renderer.domElement);
//    // camera.inertia = 0.01;
//    // camera.target = sphereRef;
//    // camera.lowerRadiusLimit = 4;
//    // camera.upperRadiusLimit = 150;
//    // camera.speed = 5;
//    // camera.angularSensibility = 200;

//    //This attaches the camera to the canvas
//    // camera.attachControl(canvas, false);

//    //var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
//    //camera.setPosition(new BABYLON.Vector3(-15, 3, 0));

//    // Skybox
//    // var skybox = BABYLON.Mesh.CreateBox("skyBox", zorbioModel.worldSize.x, scene);
//    // var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
//    // skyboxMaterial.backFaceCulling = false;
//    // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox_grid", scene);
//    // skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
//    // skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
//    // skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
//    // skybox.material = skyboxMaterial;

//    // Draw other actors currently in the game to the scene
//    drawActors();
//    drawFood(zorbioModel, scene);

//    // Save a reference to the sphere created for the player
//    // player.sphere.geo = sphereRef;
//    // zorbioModel.actors[player.sphere.id] = player.sphere;

//    //scene.registerBeforeRender(function updateSpherePosition() {
//    //    var sphereGeo = player.sphere.geo;

//    //    // move forward in the direction the camera is facing
//    //    var move_speed = MOVE_SPEED_SCALE * (player.sphere.throttle / 100);
//    //    var camera_angle_vector = camera.position.subtract(sphereGeo.position).normalize();
//    //    camera_angle_vector.multiplyInPlace(new BABYLON.Vector3(move_speed, move_speed, move_speed));
//    //    sphereGeo.position.subtractInPlace(camera_angle_vector);

//    //    //TODO: talk to MC about this not sure if I have to re-assign the geo after changing it
//    //    player.sphere.geo = sphereGeo;
//    //    player.sphere.position = sphereGeo.position;
//    //    zorbioModel.actors[player.sphere.id] = player.sphere;

//    //    updateActors();
//    //});

//    //scene.registerBeforeRender(function() {
//    //    camera.alpha += 0.01 * scene.getAnimationRatio();
//    //});

//    // Leave this function

//    function animate() {
//        requestAnimationFrame( animate );
//        // controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
//        render();
//    }

//    function render() {
//        renderer.render(scene, camera);
//    }

//    animate();

//    return scene;
//}

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

function drawFood() {

    var foodTexture = THREE.ImageUtils.loadTexture( 'textures/solid-particle.png' );
    var material = new THREE.SpriteMaterial({ map: foodTexture, useScreenCoordinates: false});
    //var material = new THREE.SpriteMaterial();
    material.depthTest = false;
    material.transparent = true;
    material.opacity = 0.5;

    var particle;
    var size = 6;
    var offset = 0;
    for (var i = 0; i < zorbioModel.foodCount; i++) {

        var X = zorbioModel.food[offset];
        var Y = zorbioModel.food[offset + 1];
        var Z = zorbioModel.food[offset + 2];
        var R = zorbioModel.food[offset + 3];
        var G = zorbioModel.food[offset + 4];
        var B = zorbioModel.food[offset + 5];

        //material.color.r = R;
        //material.color.g = G;
        //material.color.b = B;

        var colorStyle = R + ", " + G + ", " + B;

        //material.color = new THREE.Color("rgb(55, 222, 5)");
        material.color = new THREE.Color("rgb(" + colorStyle + ")");

        particle = new THREE.Sprite( material );
        particle.scale.x = particle.scale.y = 10;
        particle.position.x = X;
        particle.position.y = Y;
        particle.position.z = Z;

        scene.add( particle );

        offset += size;
    }

    ////Create a manager for the player's sprite animation
    //var spriteManager = new BABYLON.SpriteManager("playerManager", "textures/solid-particle.png", zorbioModel.foodCount, 64, scene);

    //// create sprite
    // for (var i = 0; i < zorbioModel.foodCount; i++) {
    //     var randX = zorbioModel.food[offset];
    //     var randY = zorbioModel.food[offset + 1];
    //     var randZ = zorbioModel.food[offset + 2];
    //     var randR = zorbioModel.food[offset + 3];
    //     var randG = zorbioModel.food[offset + 4];
    //     var randB = zorbioModel.food[offset + 5];
    //     var foodSprite = new BABYLON.Sprite("food" + i, spriteManager);
    //     foodSprite.color = new BABYLON.Color4.FromInts(randR, randG, randB, 255);
    //     foodSprite.position.x = randX;
    //     foodSprite.position.y = randY;
    //     foodSprite.position.z = randZ;
    //     //foodSprite.size = 0.3;
    //     //foodSprite.playAnimation(0, 40, true, 100);
    //     offset += size;
    // }
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);

var KeysDown = {};
var KeyCodes = {
    87 : 'w',
    83 : 'a',
    65 : 's',
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
            keyPressed(KeyCodes[evt.keyCode]);
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
function keyPressed(key) {
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
