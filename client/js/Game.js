// Scene and canvas
var scene;
var canvas = document.getElementById('render-canvas');

// Camera
var camera;
var camera_controls;

// Player
var playerName;
var playerType;
var playerNameInput = document.getElementById('player-name-input');
var player;

//TODO: get rid of these globals, refactor into MVC Player and Food controllers
var playerFogCenter = new THREE.Vector3();

// Game state
var players = {};
var gameStart = false;
var kicked = false;
var disconnected = false;
var foodController = undefined;

var renderer;

// Model that represents the game state shared with server
var zorbioModel;


function startGame(type) {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
    playerType = type;

    ZOR.UI.state( ZOR.UI.STATES.PLAYING );

    // Connect to the server
    var colorCode = UTIL.getRandomIntInclusive(0, ZOR.PlayerView.COLORS.length - 1);
    console.log('Player color', ZOR.PlayerView.COLORS[colorCode]);
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

    ZOR.UI.on( ZOR.UI.ACTIONS.PLAYER_LOGIN, function ZORLoginHandler() {
        // check if the nick is valid
        if (validNick()) {
            startGame(ZOR.PlayerTypes.PLAYER);
        } else {
            ZOR.UI.state( ZOR.UI.STATES.LOGIN_SCREEN_ERROR );
        }
    });

    ZOR.UI.on( ZOR.UI.ACTIONS.PLAYER_RESPAWN, respawnPlayer );

    ZOR.UI.on( ZOR.UI.ACTIONS.PLAYER_LOGIN_KEYPRESS, function ZORPlayerLoginKeypressHandler(e) {
        var key = e.which || e.keyCode;
        var KEY_ENTER = 13;

        if (key === KEY_ENTER) {
            if (validNick()) {
                //TODO: allow ZOR.PlayerTypes.SPECTATOR type
                startGame(ZOR.PlayerTypes.PLAYER);
            } else {
                ZOR.UI.state( ZOR.UI.STATES.LOGIN_SCREEN_ERROR );
            }
        }
    });
};

function respawnPlayer() {
    console.log("Respawning player: ", player.getPlayerId());
    ZOR.UI.state( ZOR.UI.STATES.PLAYING );
    sendRespawn(false);
}

function createScene() {

    init();
    animate();

    function init() {

        scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );
        if (config.FOG_ENABLED) {
            scene.fog = new THREE.Fog( config.FOG_COLOR, config.FOG_NEAR, config.FOG_FAR );
        }

        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        renderer.setClearColor( config.FOG_COLOR );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        initCameraAndPlayer();

        //TODO: refactor this into MVC to get rid of globals
        playerFogCenter.copy(player.view.mainSphere.position);

        // food
        foodController = new FoodController(zorbioModel, player.view.mainSphere.position);
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
            materialArray[i].side = THREE.BackSide;
        }
        var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyboxGeom = new THREE.BoxGeometry( zorbioModel.worldSize.x, zorbioModel.worldSize.y, zorbioModel.worldSize.z, 1, 1, 1 );
        var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
        scene.add( skybox );

        // lights

        var light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function animate() {
        requestAnimationFrame(animate);

        updateActors();

        if (gameStart && !player.isDead) {

            player.resetVelocity();

            handleKeysDown();

            ZOR.LagScale.update();

            player.update(scene, camera, camera_controls, ZOR.LagScale.get());

            foodController.update(player.view.mainSphere.position);

            playerFogCenter.copy(player.view.mainSphere.position);

            foodController.checkFoodCaptures(player, captureFood);

            checkPlayerCaptures();

            camera_controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
        }

        render();
    }

    function render() {

        renderer.render( scene, camera );

    }
}

function initCameraAndPlayer() {
    // orbit camera
    camera = new THREE.PerspectiveCamera(
        config.INITIAL_FOV,
        window.innerWidth / window.innerHeight,
        1,
        config.WORLD_HYPOTENUSE + 100 // world hypot plus a little extra for camera distance
    );

    camera_controls = new THREE.FollowOrbitControls( camera, renderer.domElement );
    camera_controls.enableDamping = true;
    camera_controls.dampingFactor = 0.25;
    camera_controls.enableZoom = false;
    camera_controls.minDistance = config.INITIAL_CAMERA_DISTANCE;
    camera_controls.maxDistance = config.INITIAL_CAMERA_DISTANCE;
    // controls.minPolarAngle = Infinity; // radians
    // controls.maxPolarAngle = -Infinity; // radians

    // sphere
    // Create the player view and adds the player sphere to the scene
    player.initView(player.model.sphere, scene);

    // camera
    camera_controls.target = player.view.mainSphere;

    // move camera so that the player is facing towards the origin each time
    // they spawn
    camera.position.copy( player.model.sphere.position.clone().multiplyScalar(1.2) );

    adjustCamera( config.INITIAL_PLAYER_RADIUS );
}

function drawPlayers() {
    var playerModels = zorbioModel.players;
    // Iterate over player
    var playerIds = Object.getOwnPropertyNames(playerModels);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = playerIds[i];
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
        var otherPlayer = players[playerIds[i]];

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
        var id = actorIds[i];
        var actor = actors[id];
        if (actor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
            if (id !== player.getSphereId()) {
                var otherPlayer = players[actor.playerId];
                if (otherPlayer.view) {
                    // update players sphere position
                    otherPlayer.updatePosition(actor.position, scene, camera, renderer);
                    otherPlayer.setScale(actor.scale);
                }
            }
        }
    }
}

function captureFood(fi) {
    if (foodController.aliveFood(fi)) {
        var mainSphere = player.view.mainSphere;
        var origRadius = player.radius();

        // give food value diminishing returns to prevent runaway growth
        var value = config.FOOD_GET_VALUE( origRadius );

        // grow to new size!  yay!
        player.grow(value);

        var new_radius = player.radius();

        var safe_to_grow = !UTIL.checkWallCollision( mainSphere.position, new_radius, new THREE.Vector3(), zorbioModel.worldSize );

        foodController.hideFood(fi);

        if (safe_to_grow) {
            adjustCamera( player.radius() );
            sendFoodCapture(fi, player.model.sphere.id, origRadius, value);  // send the food capture to the server
        }
        else {
            // aw, wasn't save to grow, go back to original size
            player.grow(-value);
            console.log("NOT SAFE TO GROW!");
        }

    }
}

/**
 * Given a sphere radius, adjust the camera so the whole sphere is within view.
 */
function adjustCamera( radius ) {
    camera_controls.minDistance = radius / Math.tan( Math.PI * camera.fov / 360 ) + 100;
    camera_controls.maxDistance = camera_controls.minDistance;
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

function resetVelocity() {
    velocity.set( 0, 0, 0 );
}

function applyVelocity() {
    velocity.sub( camera_controls.velocityRequest );
    velocity.normalize();
    velocity.multiplyScalar( player.getVelocity() );

    player.view.mainSphere.position.sub(
        adjustVelocityWallHit(
            player.view.mainSphere.position,
            player.radius(),
            velocity,
            zorbioModel.worldSize
        )
    );

    // reset the velocity requested by camera controls.  this should be done
    // inside the camera controls but I couldn't find a good place to do it.
    camera_controls.velocityRequest.set( 0, 0, 0 );
}

function moveForward() {
    var v = moveForward.v;
    var mainSphere = player.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.normalize();
    velocity.sub( v );
}
moveForward.v = new THREE.Vector3();

function moveBackward() {
    var v = moveBackward.v;
    var mainSphere = player.view.mainSphere;
    v.copy( mainSphere.position );
    v.sub( camera.position );
    v.multiplyScalar( -1 );
    v.normalize();
    velocity.sub( v );
}
moveBackward.v = new THREE.Vector3();

function adjustVelocityWallHit( p, r, v, w ) {

    var vs = v.clone();
    if ( UTIL.hitxp( p, r, v, w ) || UTIL.hitxn( p, r, v, w ) )
        vs.x = 0;

    if ( UTIL.hityp( p, r, v, w ) || UTIL.hityn( p, r, v, w ) )
        vs.y = 0;

    if ( UTIL.hitzp( p, r, v, w ) || UTIL.hitzn( p, r, v, w ) )
        vs.z = 0;

    return vs;

}

function cleanupMemory() {
    players = {};
    zorbioModel = undefined;
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

        console.log('Removed player from game: ', playerId);
    }
}

function handleServerTick(serverTickData) {
    if (!gameStart) return;

    // handle food respawns
    for(var i = 0, l = serverTickData.fr.length; i < l; ++i) {
        foodController.showFood(serverTickData.fr[i]);  // Show the food index
    }

    // expire pending player captures
    ZOR.expirePendingPlayerCaptures();
}

function handleSuccessfulPlayerCapture(targetPlayer) {
    player.animatedGrow( config.PLAYER_CAPTURE_VALUE( targetPlayer.radius() ), 40 );
}
