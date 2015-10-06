var playerName;
var playerNameInput = document.getElementById('playerNameInput');
var socket;

var canvas = document.getElementById('renderCanvas');

// Load the BABYLON 3D engine
var engine = new BABYLON.Engine(canvas, true);

var MOVE_SPEED_SCALE = 0.08;

var KEY_ENTER = 13;

var game = new Game();

function startGame() {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
    document.getElementById('gameAreaWrapper').style.display = 'block';
    document.getElementById('startMenuWrapper').style.display = 'none';
    socket = io();
    SetupSocket(socket);

    canvas = document.getElementById('renderCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // create the scene
    var scene = createScene();

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
        gameLoop();
    });
}

// check if nick is valid alphanumeric characters (and underscores)
function validNick() {
    var regex = /^\w*$/;
    console.log('Regex Test', regex.exec(playerNameInput.value));
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function() {
    'use strict';

    var btn = document.getElementById('startButton'),
        nickErrorText = document.querySelector('#startMenu .input-error');

    btn.onclick = function () {

        // check if the nick is valid
        if (validNick()) {
            startGame();
        } else {
            nickErrorText.style.display = 'inline';
        }
    };

    playerNameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;

        if (key === KEY_ENTER) {
            if (validNick()) {
                startGame();
            } else {
                nickErrorText.style.display = 'inline';
            }
        }
    });
};

function SetupSocket(socket) {
  game.handleNetwork(socket);
}

// This begins the creation of a function that we will 'call' just after it's built
var createScene = function () {

    // Now create a basic Babylon Scene object
    var scene = new BABYLON.Scene(engine);

    // Change the scene background color to green.
    scene.clearColor = new BABYLON.Color3(1, 1, 1);

    // This creates a light, aiming 0,1,0 - to the sky.
    // var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Dim the light a small amount
    // light.intensity = 0.5;

    var material = new BABYLON.StandardMaterial("kosh", scene);

    // Let's try our built-in 'sphere' shape. Params: name, subdivisions, size, scene
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    var sphere2 = BABYLON.Mesh.CreateSphere("sphere2", 16, 2, scene);

    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;
    sphere2.position.z -= 5;

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

    // sphere 2 material
    material = new BABYLON.StandardMaterial("kosh2", scene);
    material.reflectionTexture = new BABYLON.CubeTexture("textures/skybox_grid_small", scene);
    material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    material.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    material.specularPower = 32;

    // Fresnel sphere 2
    material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    material.reflectionFresnelParameters.bias = 0.1;

    material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    material.emissiveFresnelParameters.bias = 0.5;
    material.emissiveFresnelParameters.power = 4;
    material.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
    material.emissiveFresnelParameters.rightColor = BABYLON.Color3.Black();

    sphere2.material = material;
    sphere2.isBlocker = true; // For intercepting lens flare



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

    //This attaches the camera to the canvas
    camera.attachControl(canvas, false);

    //var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    //camera.setPosition(new BABYLON.Vector3(-15, 3, 0));

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox_grid", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    scene.registerBeforeRender( function updateSpherePosition() {
        // move forward in the direction the camera is facing
        var move_speed = MOVE_SPEED_SCALE / sphere.scaling.x;
        var camera_angle_vector = camera.position.subtract(sphere.position).normalize();
        camera_angle_vector.multiplyInPlace(new BABYLON.Vector3(move_speed, move_speed, move_speed));
        sphere.position.subtractInPlace(camera_angle_vector);
        sphere.scaling.x += 0.001;
        sphere.scaling.y += 0.001;
        sphere.scaling.z += 0.001;
    } );

    //scene.registerBeforeRender(function() {
    //    camera.alpha += 0.01 * scene.getAnimationRatio();
    //});

    // Leave this function
    return scene;

};  // End of createScene function

function gameLoop() {
    game.handleLogic();
    game.handleGraphics(canvas);
}

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});
