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
var kicked = false;
var disconnected = false;
//var died = false;


// Load the BABYLON 3D engine
var engine = new BABYLON.Engine(canvas, true);

// Model that represents all of the visual elements of the game
var zorbioModel;

// constants
var MOVE_SPEED_SCALE         = 0.3;
var PLAYER_POSITION_INTERVAL = 50;    // 50 milliseconds or 20 times per second
var HEARTBEAT_INTERVAL       = 3000;  // How long to wait between sending heartbeat milliseconds

//TODO: add more colors, only select ones not used.
var COLORS = [
    BABYLON.Color3.Red(),
    BABYLON.Color3.Blue(),
    BABYLON.Color3.Yellow(),
    BABYLON.Color3.Green(),
    BABYLON.Color3.Purple(),
    BABYLON.Color3.Magenta()
];

function startGame(type) {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
    playerType = type;

    showGame(true);

    setScreenDimensions();

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

    var sphereRef = drawPlayerSphere(player.sphere);
    var material = new BABYLON.StandardMaterial("kosh", scene);

    // This creates and positions a camera
    // var camera = new BABYLON.ArcFollowCamera("camera1", 1, 1, 100, sphere, scene);
    var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 10, new BABYLON.Vector3(0, 5, -10), scene);
    // var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.inertia = 0.01;
    camera.target = sphereRef;
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

    // Draw other actors currently in the game to the scene
    drawActors();
    drawFood(zorbioModel, scene);

    // Save a reference to the sphere created for the player
    player.sphere.geo = sphereRef;
    zorbioModel.actors[player.sphere.id] = player.sphere;

    scene.registerBeforeRender(function updateSpherePosition() {
        var sphereGeo = player.sphere.geo;

        // move forward in the direction the camera is facing
        var move_speed = MOVE_SPEED_SCALE * (player.sphere.throttle / 100);
        var camera_angle_vector = camera.position.subtract(sphereGeo.position).normalize();
        camera_angle_vector.multiplyInPlace(new BABYLON.Vector3(move_speed, move_speed, move_speed));
        sphereGeo.position.subtractInPlace(camera_angle_vector);

        //TODO: talk to MC about this not sure if I have to re-assign the geo after changing it
        player.sphere.geo = sphereGeo;
        player.sphere.position = sphereGeo.position;
        zorbioModel.actors[player.sphere.id] = player.sphere;

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

function drawPlayerSphere(sphereToDraw) {

    var material = new BABYLON.StandardMaterial("kosh", scene);

    // Let's try our built-in 'sphere' shape. Params: name, subdivisions, size, scene
    var newSphere = BABYLON.Mesh.CreateSphere("sphere-" + sphereToDraw.id, 16, 2, scene);

    // Set player sphere position
    newSphere.position.x = sphereToDraw.position.x;
    newSphere.position.y = sphereToDraw.position.y;
    newSphere.position.z = sphereToDraw.position.z;

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
    material.emissiveFresnelParameters.rightColor = COLORS[sphereToDraw.color];

    material.opacityFresnelParameters = new BABYLON.FresnelParameters();
    material.opacityFresnelParameters.leftColor = BABYLON.Color3.White();
    material.opacityFresnelParameters.rightColor = BABYLON.Color3.Black();

    newSphere.material = material;

    return newSphere;
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

function drawFood(model, scene) {
    // The object from which food particles are emitted
    var grocery = BABYLON.Mesh.CreateBox("foutain", 1.0, scene);
    grocery.isVisible = false;

    // Create a particle system
    particleSystem = new BABYLON.ParticleSystem("particles", model.foodCount, scene);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture("textures/solid-particle.png", scene);

    // Where the particles come from
    particleSystem.emitter = grocery; // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(1.0, 0.0, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.0, 1.0, 1.0, 1.0);
    //particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...
    particleSystem.minSize = 1;
    particleSystem.maxSize = 1;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = Infinity;
    particleSystem.maxLifeTime = Infinity;

    // Emission rate
    particleSystem.emitRate = model.foodCount;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0,0,0);

    // Direction of each particle after it has been emitted
    particleSystem.direction1 = new BABYLON.Vector3(0,0,0);
    particleSystem.direction2 = new BABYLON.Vector3(0,0,0);

    // Angular speed, in radians
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = 0;

    // Speed
    particleSystem.updateSpeed = 1.000;

    var offset = 0;
    var size = 6;
    particleSystem.startPositionFunction = function (worldMatrix, positionToUpdate) {
        var randX = model.food[offset];
        var randY = model.food[offset + 1];
        var randZ = model.food[offset + 2];
        offset += size;
        BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(randX, randY, randZ, worldMatrix, positionToUpdate);
    };

    // Start the particle system
    particleSystem.start();
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

        // remove from babalon scene
        geo.dispose();

        console.log('removed player from game', kickedPlayer.sphere.id);
    }
}
