// Canvas
var scene;
var canvas = document.getElementById('renderCanvas');
var screenWidth = 0;
var screenHeight = 0;
setScreenDimensions();

// Player
var playerName;
var playerType;
var playerNameInput = document.getElementById('playerNameInput');
var player;

// Game state
var gameStart = false;
//var disconnected = false;
//var died = false;
//var kicked = false;

// Load the BABYLON 3D engine
var engine = new BABYLON.Engine(canvas, true);

// Model that represents all of the visual elements of the game
var zorbioModel;

var MOVE_SPEED_SCALE = 0.3;

function startGame(type) {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
    playerType = type;

    document.getElementById('gameAreaWrapper').style.display = 'block';
    document.getElementById('startMenuWrapper').style.display = 'none';

    setScreenDimensions();

    // Init the socket
    connectToServer(playerType, playerName);
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
                startGame();
            } else {
                nickErrorText.style.display = 'inline';
            }
        }
    });
};

// This begins the creation of a function that we will 'call' just after it's built
var createScene = function () {

    // Now create a basic Babylon Scene object
    scene = new BABYLON.Scene(engine);

    // IF fog enabled
     scene.fogMode = BABYLON.Scene._FOGMODE_LINEAR;
     scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
     scene.fogStart = 50;
     scene.fogEnd = 70;

    // Change the scene background color to green.
    scene.clearColor = new BABYLON.Color3(1, 1, 1);

    // This creates a light, aiming 0,1,0 - to the sky.
    // var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Dim the light a small amount
    // light.intensity = 0.5;

    var material = new BABYLON.StandardMaterial("kosh", scene);

    // Let's try our built-in 'sphere' shape. Params: name, subdivisions, size, scene
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

    // Set player sphere position
    sphere.position.x = player.sphere.position.x;
    sphere.position.y = player.sphere.position.y;
    sphere.position.z = player.sphere.position.z;

    // sphere material
    material.reflectionTexture = new BABYLON.CubeTexture("textures/skybox_grid_small", scene);
    material.diffuseColor = new BABYLON.Color3.White();
    material.emissiveColor = new BABYLON.Color3.White();
    material.alpha = 0.4;
    material.specularPower = 0;

    // Fresnel
    material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    material.reflectionFresnelParameters.bias = 0.1;

    material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    material.emissiveFresnelParameters.bias = 0.6;
    material.emissiveFresnelParameters.power = 4;
    material.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
    material.emissiveFresnelParameters.rightColor = BABYLON.Color3.Red();

    material.opacityFresnelParameters = new BABYLON.FresnelParameters();
    material.opacityFresnelParameters.leftColor = BABYLON.Color3.White();
    material.opacityFresnelParameters.rightColor = BABYLON.Color3.Black();

    sphere.material = material;

    // This creates and positions a camera
    // var camera = new BABYLON.ArcFollowCamera("camera1", 1, 1, 100, sphere, scene);
    var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 10, new BABYLON.Vector3(0, 5, -10), scene);
    // var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.inertia = 0.01;
    camera.target = sphere;
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 150;
    camera.speed = 5;
    camera.angularSensibility = 200;
    camera.maxZ = 70; // View distance

    //This attaches the camera to the canvas
    camera.attachControl(canvas, false);

    //var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    //camera.setPosition(new BABYLON.Vector3(-15, 3, 0));

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", zorbioModel.worldSize.x, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox_grid", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    drawActors();

    scene.registerBeforeRender(function updateSpherePosition() {
        // move forward in the direction the camera is facing
        var move_speed = MOVE_SPEED_SCALE * (player.sphere.throttle / 100);
        var camera_angle_vector = camera.position.subtract(sphere.position).normalize();
        camera_angle_vector.multiplyInPlace(new BABYLON.Vector3(move_speed, move_speed, move_speed));
        sphere.position.subtractInPlace(camera_angle_vector);

        updateActors();
    });

    //scene.registerBeforeRender(function() {
    //    camera.alpha += 0.01 * scene.getAnimationRatio();
    //});

    // Leave this function
    return scene;

};  // End of createScene function

function drawActors() {
    var actors = zorbioModel.actors;
    for (var i = 0; i < actors.length; i++) {
        var actor = actors[i];
        if (actor.type === ZOR.ActorTypes.FOOD) {
            drawFood(actor);
        }
    }
}


function updateActors() {
    var actors = zorbioModel.actors;
    for (var i = 0; i < actors.length; i++) {
        var actor = actors[i];
        if (actor.type === ZOR.ActorTypes.FOOD) {
            actor.geo.rotation.x += actor.rotation.x;
            actor.geo.rotation.y += actor.rotation.y;
            actor.geo.rotation.z += actor.rotation.z;
        }
    }
}

function drawFood(food) {
    //TODO: change food to particles
    var foodGeo = BABYLON.Mesh.CreateSphere("food", 3, 0.4, scene);
    foodGeo.position.x += food.position.x;
    foodGeo.position.y += food.position.y;
    foodGeo.position.z += food.position.z;

    //TODO: improve food material?
    var material = new BABYLON.StandardMaterial("food", scene);
    material.emissiveColor = food.color;
    foodGeo.material = material;

    food.geo = foodGeo;
}

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

window.addEventListener("keydown", handlePlayerControlKeydown);

function handlePlayerControlKeydown(evt) {
    if (!gameStart) {
        return;
    }

    var W_KEY = 87;
    var S_KEY = 83;
    var THROTTLE_STEP = 10;

    switch (evt.keyCode) {
        case W_KEY:
            // Increase throttle
            if (player.sphere.throttle < 100) {
                player.sphere.throttle += THROTTLE_STEP;

                if (player.sphere.throttle > 100) {
                    player.sphere.throttle = 100;
                }
            }
            break;
        case S_KEY:
            // Decrease throttle
            if (player.sphere.throttle > 0) {
                player.sphere.throttle -= THROTTLE_STEP;

                if (player.sphere.throttle < 0) {
                    player.sphere.throttle = 0;
                }
            }
            break;
        default:
            break;
    }
}

function setScreenDimensions() {
    screenWidth = canvas.width = window.innerWidth;
    screenHeight = canvas.height = window.innerHeight;
}
