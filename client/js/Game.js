// this is here to prep for modularizing (de-globalifying) this file
var ZOR = ZOR || {};

ZOR.Game = {};

// Scene and canvas
var scene;
var canvas = document.getElementById('render-canvas');
var octree;

// Camera
var camera;
var camera_controls;

// Player
var playerType;
var player;

//TODO: get rid of this globals, refactor into MVC Player and Food controllers
var playerFogCenter = new THREE.Vector3();

// Game state
var players = {};
var gameStart = false;
var disconnected = false;
var foodController;

var drainView;

// Model that represents the game state shared with server
var zorbioModel;

ZOR.Game.fullscreen = function go_fullscreen() {
    var el = document.body;
    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    }
};

function startGame(type) {

    var fake_renderer, missing_extensions;

    // Before we do anything, make sure WebGL is supported by this browser
    try {
        fake_renderer = new THREE.WebGLRenderer();
        missing_extensions = _.chain( config.REQUIRED_WEBGL_EXTENSIONS )
            .map( fake_renderer.extensions.get )
            .some( _.isNull )
            .value();
        fake_renderer = undefined;
        if (missing_extensions) {
            throw new Error('missing WebGL extensions');
        }
    } catch (e) {
        console.error('Failed to init game.  Possible WebGL failure.  Original error below.');
        console.error(e.message);
        ZOR.UI.state( ZOR.UI.STATES.GAME_INIT_ERROR );
        return;
    }

    // only automatically fullscreen on mobile devices
    if (isMobile.any) {
        ZOR.Game.fullscreen();
    }

    ZOR.Sounds.music.background.play();

    playerType = type;

    ZOR.UI.state( ZOR.UI.STATES.PLAYING );

    // save player name and alpha key in storage
    localStorage.player_name = ZOR.UI.engine.get('player_name');
    localStorage.alpha_key = ZOR.UI.engine.get('alpha_key');

    // Connect to the server
    var colorCode = UTIL.getRandomIntInclusive(0, ZOR.PlayerView.COLORS.length - 1);
    var colorHex = ZOR.PlayerView.COLORS[colorCode];
    document.querySelector("meta[name=theme-color]").content = colorHex;
    console.log('Player color', colorHex);
    connectToServer(
        playerType,
        ZOR.UI.engine.get('player_name'),
        colorCode
    );
}

window.addEventListener('load', function ZORLoadHandler() {
    'use strict';

    if (localStorage.alpha_key) {
        ZOR.UI.engine.set('alpha_key', localStorage.alpha_key)
    }
    if (localStorage.player_name) {
        ZOR.UI.engine.set('player_name', localStorage.player_name)
    }

    ZOR.UI.on( ZOR.UI.ACTIONS.SHOW_CREDITS, function ZORShowCredits() {
        ZOR.UI.state( ZOR.UI.STATES.CREDITS_SCREEN );
    });

    ZOR.UI.on( ZOR.UI.ACTIONS.SHOW_TUTORIAL, function ZORShowTutorial() {
        ZOR.UI.state( ZOR.UI.STATES.TUTORIAL_SCREEN );
    });

    ZOR.UI.on( ZOR.UI.ACTIONS.SHOW_CONFIG, function ZORShowConfig() {
        ZOR.UI.state( ZOR.UI.STATES.CONFIG );
    });

    ZOR.UI.on( ZOR.UI.ACTIONS.SHOW_LOGIN, function ZORShowLogin() {
        ZOR.UI.state( ZOR.UI.STATES.LOGIN_SCREEN );
    });

    ZOR.UI.on( ZOR.UI.ACTIONS.SHOW_PREVIOUS, function ZORShowPrevious() {
        ZOR.UI.state( ZOR.UI.data.prev_state );
    });

    ZOR.UI.on( ZOR.UI.ACTIONS.PLAYER_LOGIN, function ZORLoginHandler() {

        // check if the nick is valid
        if (UTIL.validNick(ZOR.UI.engine.get('player_name'))) {
            startGame(ZOR.PlayerTypes.PLAYER);
        } else {
            ZOR.UI.engine.set( 'login_error_msg', 'Nick name must be alphanumeric characters only!' );

        }
    });


    config.X_AXIS_MULT = JSON.parse(localStorage.flip_x || "false") ? -1 : 1;
    config.Y_AXIS_MULT = JSON.parse(localStorage.flip_y || "false") ? -1 : 1;
    ZOR.UI.on( ZOR.UI.ACTIONS.TOGGLE_Y_AXIS, axisToggler('y'));
    ZOR.UI.on( ZOR.UI.ACTIONS.TOGGLE_X_AXIS, axisToggler('x'));

    function axisToggler(axis) {
        return function ZORToggleYAxis(e) {
            var lsKey = 'flip_'+axis.toLowerCase();
            var confKey = axis.toUpperCase()+'_AXIS_MULT';
            if ( e.node.checked ) {
                config[confKey] = -1;
                ZOR.UI.data[lsKey] = true;
            }
            else {
                config[confKey] = 1;
                ZOR.UI.data[lsKey] = false;
            }
            localStorage[lsKey] = ZOR.UI.data[lsKey];
        }
    }

    ZOR.UI.on( ZOR.UI.ACTIONS.PAGE_RELOAD, location.reload.bind(location) );

    ZOR.UI.on( ZOR.UI.ACTIONS.PLAYER_RESPAWN, respawnPlayer );

    ZOR.UI.on( ZOR.UI.ACTIONS.PLAYER_LOGIN_KEYPRESS, function ZORPlayerLoginKeypressHandler(e) {
        var key = e.original.which || e.original.keyCode;
        var KEY_ENTER = 13;

        if (key === KEY_ENTER) {
            if (UTIL.validNick(ZOR.UI.engine.get('player_name'))) {
                startGame(ZOR.PlayerTypes.PLAYER);
            } else {
                ZOR.UI.engine.set( 'login_error_msg', 'Nick name must be alphanumeric characters only!' );
            }
        }
    });

    // init mobile
    if (isMobile.any) {
        // mobile must always use drag steering
        config.STEERING = config.STEERING_METHODS.MOUSE_DRAG;
    }

});

function respawnPlayer() {
    console.log("Respawning player: ", player.getPlayerId());
    ZOR.UI.state( ZOR.UI.STATES.PLAYING );
    sendRespawn(false);
}

function createScene() {

    try {
        init();
        animate();
    } catch (e) {
        console.error('Failed to init game.  Possible WebGL failure.  Original error below.');
        console.error(e.message);
        ZOR.UI.state( ZOR.UI.STATES.GAME_INIT_ERROR );
    }

    function init() {

        scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );
        if (config.FOG_ENABLED) {
            scene.fog = new THREE.Fog( config.FOG_COLOR, config.FOG_NEAR, config.FOG_FAR );
        }

        ZOR.Game.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        ZOR.Game.renderer.setClearColor( config.FOG_COLOR );
        ZOR.Game.renderer.setPixelRatio( window.devicePixelRatio );
        ZOR.Game.renderer.setSize( window.innerWidth, window.innerHeight );




        initCameraAndPlayer();

        playerFogCenter.copy(player.view.mainSphere.position);

        // food
        foodController = new FoodController(zorbioModel, player.view.mainSphere.position, scene);
        foodController.drawFood(scene);

        // Hide currently respawning food
        foodController.hideFoodMultiple(zorbioModel.food_respawning_indexes);

        // Draw other players
        drawPlayers();

        // skybox
        var materialArray = [];
        var wall_texture;
        for (var i = 0; i < 6; i++) {
            wall_texture = THREE.ImageUtils.loadTexture( 'textures/skybox_grid_black.png' );
            wall_texture.wrapS = wall_texture.wrapT = THREE.MirroredRepeatWrapping;
            wall_texture.repeat.set(config.WALL_GRID_SEGMENTS, config.WALL_GRID_SEGMENTS);
            materialArray.push(new THREE.MeshBasicMaterial( { map: wall_texture }));
            materialArray[i].side = THREE.DoubleSide;
            materialArray[i].transparent = true;
            materialArray[i].alphaTest = 0.5;
            materialArray[i].map.magFilter = THREE.NearestFilter;
            materialArray[i].map.minFilter = THREE.LinearFilter;
        }
        var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyboxGeom = new THREE.BoxGeometry( zorbioModel.worldSize.x, zorbioModel.worldSize.y, zorbioModel.worldSize.z, 1, 1, 1 );
        var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
        skybox.renderOrder = -1;
        scene.add( skybox );

        // lights

        var light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        ZOR.Game.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function animate() {
        requestAnimationFrame(animate);

        updateActors();

        if (gameStart && !player.isDead) {
            throttledSendPlayerSpherePosition();

            player.resetVelocity();

            handleKeysDown();

            ZOR.LagScale.update();

            player.update(scene, camera, camera_controls, ZOR.LagScale.get());

            foodController.update(player.model.sphere.position);

            playerFogCenter.copy(player.model.sphere.position);

            foodController.checkFoodCaptures(player, captureFood);

            checkPlayerCaptures();

            // drainView.update(players);

            camera_controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
        }

        ZOR.UI.update();

        render();
    }

    function render() {

        ZOR.Game.renderer.render( scene, camera );

    }
}

function initCameraAndPlayer() {
    // sphere
    // Create the player view and adds the player sphere to the scene
    player.initView(player.model.sphere, scene);

    // orbit camera
    camera = new THREE.PerspectiveCamera(
        config.INITIAL_FOV,
        window.innerWidth / window.innerHeight,
        1,
        config.WORLD_HYPOTENUSE + 100 // world hypot plus a little extra for camera distance
    );

    if ( config.STEERING.NAME === 'FOLLOW' ) {
        // Trackball settings for steering Follow method
        camera_controls = new THREE.TrackballControls( camera, ZOR.Game.renderer.domElement );
        camera_controls.staticMoving = true;
        camera_controls.noZoom = false;
        camera_controls.noPan = true;
        camera_controls.dynamicDampingFactor = 0.0;
        camera_controls.rotateSpeed = config.STEERING.SPEED;
        camera_controls.target = player.view.mainSphere.position;
    }
    else if (config.STEERING.NAME === 'DRAG') {
        // FollowOrbit settings for drag steering method
        camera_controls = new THREE.FollowOrbitControls( camera, ZOR.Game.renderer.domElement );
        camera_controls.enableDamping = true;
        camera_controls.dampingFactor = 0.25;
        camera_controls.enableZoom = false;
        camera_controls.target = player.view.mainSphere;
    }

    // Common settings between Trackball and FollowOrbit
    camera_controls.minDistance = config.INITIAL_CAMERA_DISTANCE;
    camera_controls.maxDistance = config.INITIAL_CAMERA_DISTANCE;

    // move camera so that the player is facing towards the origin each time
    // they spawn
    camera.position.copy( player.model.sphere.position.clone().multiplyScalar(1.2) );

    player.setCameraControls( camera_controls );
    player.view.adjustCamera();
}

function drawPlayers() {
    var playerModels = zorbioModel.players;
    // Iterate over player
    var playerIds = Object.getOwnPropertyNames(playerModels);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = +playerIds[i];  // make sure id is a number
        var playerModel = playerModels[id];
        if (playerModel.type === ZOR.PlayerTypes.PLAYER) {
            // Only draw other players
            if (id !== player.getPlayerId()) {
                players[id] = new ZOR.PlayerController(playerModel, player.model.sphere, scene);
            }
        }
    }
}

function checkPlayerCaptures() {
    if (player.beingCaptured) {
        return;
    }

    var attackingPlayer = undefined;
    var targetPlayer = undefined;

    // Iterate over players
    var playerIds = Object.getOwnPropertyNames(players);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var playerId = +playerIds[i];  // make sure id is a number
        var otherPlayer = players[playerId];

        if ((otherPlayer.getPlayerId() !== player.getPlayerId()) && (otherPlayer.radius() !== player.radius())) {

            if (otherPlayer.radius() < player.radius()) {
                targetPlayer = otherPlayer;
                attackingPlayer = player;
            }
            else {
                targetPlayer = player;
                attackingPlayer = otherPlayer;
            }

            var targetPlayerPosition = targetPlayer.getPosition();
            var dist = targetPlayerPosition.distanceTo( attackingPlayer.getPosition() );

            if (dist < attackingPlayer.radius()) {
                console.log('player capture detected!');
                console.log('player.radius(): ', player.radius());
                console.log('otherPlayer.radius(): ', otherPlayer.radius());
                sendPlayerCapture( attackingPlayer.getPlayerId(), targetPlayer.getPlayerId() );
            }
        }
    }
}

function updateActors() {
    var actors = zorbioModel.actors;

    // Iterate over actor properties in the actors object
    var actorIds = Object.getOwnPropertyNames(actors);
    for (var i = 0, l = actorIds.length; i < l; i++) {
        var id = +actorIds[i];  // make sure id is a number
        var actor = actors[id];
        if (actor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
            if (id !== player.getSphereId()) {
                var otherPlayer = players[actor.playerId];
                if (otherPlayer.view) {
                    // update players sphere position
                    otherPlayer.updatePosition(actor.position, scene, camera, ZOR.Game.renderer);
                    otherPlayer.setScale(actor.scale);
                }
            }
        }
    }
}

function captureFood(fi) {
    player.queueFoodCapture(fi);
    foodController.hideFood(fi);
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

    if (!gameStart || player.isDead) return;

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
    if (!gameStart || player.isDead) return;

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
        player.moveForward(camera);
    }
    else if ( key === 's' ) {
        player.moveBackward(camera);
    }
}

function keyJustPressed(key) {
    //console.log('key ' + key + ' just pressed');
}

function keyReleased(key) {
    //console.log('key ' + key + ' released');
}

function removePlayerFromGame(playerId) {
    var thePlayer = players[playerId];

    if (thePlayer || zorbioModel.players[playerId]) {
        if (thePlayer && thePlayer.view) {
            // remove player from model actors
            var sphereId = thePlayer.getSphereId();
            delete zorbioModel.actors[sphereId];

            // Remove player from the scene
            thePlayer.removeView(scene);
            delete players[playerId];
        }

        if (zorbioModel.players[playerId]) {
            // remove the player from the model
            delete zorbioModel.players[playerId];
        }

        console.log('Removed player: ', playerId);
    }
}

function handleServerTick(serverTickData) {
    if (!gameStart) return;

    // ZOR.UI.engine.set( 'leaders', serverTickData.leaders );
    ZOR.UI.data.leaders = serverTickData.leaders;

    // handle food respawns
    for(var i = 0, l = serverTickData.fr.length; i < l; ++i) {
        foodController.showFood(serverTickData.fr[i]);  // Show the food index
    }

    // Send server message to the UI (either real message, or undefined)
    ZOR.UI.engine.set('server_message', serverTickData.sm);

    // expire pending player captures
    ZOR.expirePendingPlayerCaptures();
}

function handleSuccessfulPlayerCapture(targetPlayer) {
    player.grow( config.PLAYER_CAPTURE_VALUE( targetPlayer.radius() ) );
}

function handlePlayerKick(msg) {
    ZOR.UI.state( ZOR.UI.STATES.KICKED_SCREEN );

    // Send server message to the UI (either real message, or undefined)
    ZOR.UI.engine.set('kicked_message', msg);
}

function setDeadState() {
    player.beingCaptured = false;
    player.isDead = true;
    clearIntervalMethods();
    KeysDown = {};
}
