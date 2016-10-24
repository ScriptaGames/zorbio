// this is here to prep for modularizing (de-globalifying) this file
var ZOR = ZOR || {};

ZOR.Game = {};

// Scene and canvas
var scene;
var canvas;

// Camera
var camera;
var camera_controls;
var raycaster = new THREE.Raycaster();
if (config.FOG_ENABLED) {
    raycaster.far = config.FOG_FAR;
}

// Player
var player;

//TODO: get rid of this globals, refactor into MVC Player and Food controllers
var playerFogCenter = new THREE.Vector3();

// Game state
var gameStart = false;
var foodController;

// Model that represents the game state shared with server
var zorbioModel = new ZOR.Model();

// Game websocket client
var zorClient = new ZOR.ZORClient(zorbioModel, ZOR.ZORMessageHandler);

ZOR.Game.players = {};

ZOR.Game.player_meshes = [];

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

    if (config.MUSIC_ENABLED) {
        ZOR.Sounds.music.background.play();
    }

    ZOR.UI.state( ZOR.UI.STATES.PLAYING );



    // Assign player meta data and save to local storage
    var colorCode = UTIL.getRandomIntInclusive(0, config.COLORS.length - 1);
    var colorHex = config.COLORS[colorCode];
    var name = localStorage.player_name = UTIL.filterName(ZOR.UI.engine.get('player_name'));
    var key = localStorage.alpha_key = ZOR.UI.engine.get('alpha_key');
    ZOR.Game.playerMeta = {
        playerType: type,
        playerName: name,
        key: key,
        skin: localStorage.getItem('skin') || 'default',
        color: colorCode,
    };

    document.querySelector("meta[name=theme-color]").content = colorHex;

    // Initialize player size ui element
    ZOR.UI.engine.set('player_color', colorCode);
    ZOR.UI.engine.set('player_size', config.PLAYER_GET_SCORE(config.INITIAL_PLAYER_RADIUS));

    // Schedule one time Google Analytics tracking for Ping and FPS
    setTimeout(gaPerformanceMetrics, 15000);

    console.log('Player meta: ', ZOR.Game.playerMeta);

    zorClient.z_sendEnterGame(ZOR.Game.playerMeta);
}

function respawnPlayer() {
    console.log("Respawning player: ", player.getPlayerId());
    ZOR.UI.state( ZOR.UI.STATES.PLAYING );
    gameStart = false;
    zorClient.z_sendRespawn();
}

function createScene() {

    // a function to reveal the canvas after a few frames have been drawn.
    // turns into a noop afterwards.
    var revealCanvas = _.after(4, function () {
        canvas.classList.add('active');
    });

    try {
        init();
        animate();
    } catch (e) {
        console.error('Failed to init game.  Possible WebGL failure.  Original error below.');
        ZOR.UI.state( ZOR.UI.STATES.GAME_INIT_ERROR );
        throw e;
    }

    function init() {

        canvas = document.getElementById('render-canvas');
        scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );
        if (config.FOG_ENABLED) {
            scene.fog = new THREE.Fog( config.FOG_COLOR, config.FOG_NEAR, config.FOG_FAR );
        }

        ZOR.Game.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
        ZOR.Game.renderer.setClearColor( config.FOG_COLOR );
        ZOR.Game.renderer.setPixelRatio( window.devicePixelRatio );
        ZOR.Game.renderer.setSize( window.innerWidth, window.innerHeight );

        // Initial title screen camera
        camera = new THREE.PerspectiveCamera(
            config.INITIAL_FOV,
            window.innerWidth / window.innerHeight,
            1,
            config.WORLD_HYPOTENUSE + 100 // world hypot plus a little extra for camera distance
        );
        camera.position.set(0, 0, 0);

        // food
        foodController = new FoodController(zorbioModel, camera.position, scene);
        foodController.drawFood(scene);

        // Hide currently respawning food
        foodController.hideFoodMultiple(zorbioModel.food_respawning_indexes);

        // Draw other players
        drawPlayers();

        // skybox
        var materialArray = [];
        var wall_texture;
        for (var i = 0; i < 6; i++) {
            wall_texture = new THREE.TextureLoader().load( 'textures/skybox_grid_black.png' );
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
        skybox.renderOrder = -10;
        scene.add( skybox );

        // lights

        var light = new THREE.AmbientLight( 0x222222 );
        scene.add( light );

        // drain view

        //drainView = new ZOR.DrainView(scene);

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        ZOR.Game.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function animate() {
        requestAnimationFrame(animate);

        var ui_state = ZOR.UI.state();
        if (ui_state.indexOf('menu') === 0 || ui_state === ZOR.UI.STATES.CREDITS_SCREEN ) {
            camera.rotation.y -= config.TITLE_CAMERA_SPIN_SPEED * ZOR.LagScale.get();
        }

        var fogCenter;

        updateActors();

        if (gameStart && !player.isDead) {
            fogCenter = player.view.mainSphere.position;

            player.resetVelocity();

            handleKeysDown();

            ZOR.LagScale.update();

            player.update(scene, camera, camera_controls, ZOR.LagScale.get());

            throttledSendPlayerUpdate();

            zorClient.z_sendClientPositionRapid(player.model.sphere.id, player.view.mainSphere.position);

            foodController.checkFoodCaptures(player, captureFood);

            camera_controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

            raycaster.set(player.view.mainSphere.position, camera.getWorldDirection().normalize());

            throttledUpdatePlayerSizeUI();

            throttledUpdateTargetLock();
        }
        else if (ZOR.UI.state().indexOf('menu') === 0) {
            fogCenter = camera.position;
        }
        else if (player && player.isDead) {
            fogCenter = player.model.sphere.position;
        } else {
            fogCenter = {x: 0, y: 0, z: 0}
        }

        playerFogCenter.copy(fogCenter);
        foodController.update(fogCenter);

        ZOR.UI.update();

        render();
    }

    function render() {

        ZOR.Game.renderer.render( scene, camera );

        revealCanvas();

    }
}

function initCameraAndPlayer() {
    // sphere
    // Create the player view and adds the player sphere to the scene
    player.initView(scene);

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
    // camera.position.copy( player.model.sphere.position.clone().multiplyScalar(1.2) );

    player.setCameraControls( camera_controls );
    player.view.adjustCamera(player.radius());

    playerFogCenter.copy(player.view.mainSphere.position);
}

function drawPlayers() {
    // Iterate over player
    zorbioModel.players.forEach(function drawEachPlayer(playerModel) {
        if (playerModel.type != ZOR.PlayerTypes.SPECTATOR) {
            var id = playerModel.id;

            // Only draw other players
            if (!player || (id !== player.getPlayerId())) {
                ZOR.Game.players[id] = new ZOR.PlayerController(playerModel, scene);
                ZOR.Game.players[id].setAlpha(1);
            }
        }
    });
}

function updateActors() {
    // Iterate over actor properties in the actors object
    zorbioModel.actors.forEach(function updateEachActor(actor) {
        if (actor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
            if (!player || (actor.id !== player.getSphereId())) {
                var otherPlayer = ZOR.Game.players[actor.playerId];
                if (otherPlayer && otherPlayer.view) {
                    // update actor
                    otherPlayer.updatePosition(actor.position);
                    otherPlayer.updateScale(actor.scale);
                    otherPlayer.updateDrain(actor.drain_target_id);
                }
            }
            else {
                // update main player
                player.updateScale(actor.scale);
                player.updateDrain(actor.drain_target_id);
            }
        }
    });
}
updateActors.runningActorUpdateGap = config.TICK_FAST_INTERVAL;

function updatePlayerSizeUI() {
    var currentScore = player.getScore();
    if (currentScore != player.lastScore) {
        ZOR.UI.engine.set('player_size', currentScore);
        player.lastScore = currentScore;
    }
}
var throttledUpdatePlayerSizeUI = _.throttle(updatePlayerSizeUI, 70);

function updateTargetLock() {
    // calculate objects intersecting the ray
    var intersects = raycaster.intersectObjects( ZOR.Game.player_meshes );

    if (intersects && intersects.length > 0) {
        // looking at a player
        var playerMesh     = intersects[0].object;

        if (playerMesh && playerMesh.player_id > 0) {

            var targeting_self = playerMesh.player_id === player.model.id;

            if (!targeting_self) {
                // Update target locked UI
                var pointedPlayer = ZOR.Game.players[playerMesh.player_id];

                if (pointedPlayer) {
                    var target_changed = player.getTargetLock() !== playerMesh.player_id;
                    var currentScore = pointedPlayer.getScore();

                    var target = {
                        name: pointedPlayer.model.name,
                        score: currentScore,
                        color: pointedPlayer.model.sphere.color
                    };

                    if (target_changed) {
                        // Set new target
                        player.setTargetLock(playerMesh.player_id);
                        ZOR.UI.engine.set('target', target);
                        pointedPlayer.lastScore = currentScore;
                        clearTimeout(ZOR.UI.target_clear_timeout_id);
                    }
                    else if (currentScore != pointedPlayer.lastScore) {
                        // Update target score
                        ZOR.UI.engine.set('target', { name: pointedPlayer.model.name, score: currentScore, color: pointedPlayer.model.sphere.color });
                        pointedPlayer.lastScore = currentScore;
                    }
                }
            }
        }
    }
    else if (player.getTargetLock()) {
        // not looking at anything so clear target name after timeout
        player.setTargetLock(0);
        ZOR.UI.target_clear_timeout_id = setTimeout(ZOR.UI.clearTarget, 4000);
        console.log("clearing target lock");
    }
}
var throttledUpdateTargetLock = _.throttle(updateTargetLock, 100);

function sendPlayerUpdate() {
    // Make sure model is synced with view
    player.refreshSphereModel();

    // make sure we always have at least 4 recent positions
    while (player.model.sphere.recentPositions.length < 4) {
        player.addRecentPosition();
    }

    zorClient.z_sendPlayerUpdate(player.model.sphere, player.food_capture_queue);

    // clear food queue
    player.food_capture_queue = [];
}
var throttledSendPlayerUpdate = _.throttle(sendPlayerUpdate, config.TICK_FAST_INTERVAL);

function captureFood(fi) {
    player.queueFoodCapture(fi);
    foodController.hideFood(fi);
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mouseup", handleMouseUp);

window.onload = function homeOnload() {
    zorClient.z_connectToServer('ws://' + config.BALANCER + ':' + config.WS_PORT);
};

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

function handleMouseDown(evt) {
    if (!gameStart || player.isDead) return;

    if (evt.button === 0 && config.AUTO_RUN_ENABLED && !isMobile.any) {
        if (player.isSpeedBoostReady()) {
            zorClient.z_sendSpeedBoostStart();
        }
    }
}

function handleMouseUp(evt) {
    if (!gameStart || player.isDead) return;

    if (evt.button === 0 && config.AUTO_RUN_ENABLED && !isMobile.any) {
        player.speedBoostStop();
        zorClient.z_sendSpeedBoostStop();
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
    if ( key === 'w' && !config.AUTO_RUN_ENABLED) {
        player.moveForward(camera);
    }
    else if ( key === 's' ) {
        //TODO: refactor this to player.stop() based on autorun value
        player.moveBackward(camera);
    }
}

function keyJustPressed(key) {
    if ( key === 'w' && config.AUTO_RUN_ENABLED) {
        if (player.isSpeedBoostReady()) {
            zorClient.z_sendSpeedBoostStart();
        }
    }
}

function keyReleased(key) {
    //console.log('key ' + key + ' released');
    if (key === 'w' && config.AUTO_RUN_ENABLED) {
        if (player.isSpeedBoostActive()) {
            player.speedBoostStop();
            zorClient.z_sendSpeedBoostStop();
        }
    }
}

function removePlayerFromGame(playerId, time) {
    var thePlayer = ZOR.Game.players[playerId];

    setTimeout(function removePlayerNow() {
        // remove player from model
        zorbioModel.removePlayer(playerId);

        // remove player from scene and client
        if (thePlayer) {
            if (thePlayer.view) {
                // Remove player from the scene
                thePlayer.removeView();
            }

            // remove from player controllers
            delete ZOR.Game.players[playerId];
        }
        console.log('Removed player: ', playerId);
    }, time);
}

function handleServerTick(serverTickData) {
    if (!gameStart) return;

    serverTickData.leaders.forEach(function eachLeader(leader) {
        // get leader name and color
        var clientPlayer = ZOR.Game.players[leader.player_id];
        if (clientPlayer) {
            leader.name = clientPlayer.model.name;
            leader.color = clientPlayer.model.sphere.color;
        }
        else {
            leader.name = '';
            leader.color = 1;
        }
    });

    ZOR.UI.engine.set( 'leaders', serverTickData.leaders );
    ZOR.UI.data.leaders = serverTickData.leaders;

    if (foodController && foodController.isInitialized()) {
        // handle food respawns
        for (var i = 0, l = serverTickData.fr.length; i < l; ++i) {
            foodController.showFood( serverTickData.fr[i] );  // Show the food index
        }

        // handle food captures
        for (i = 0, l = serverTickData.fc.length; i < l; ++i) {
            foodController.hideFood( serverTickData.fc[i] );
        }
    }

    // Send server message to the UI (either real message, or undefined)
    ZOR.UI.engine.set('server_message', serverTickData.sm);

    // expire locks
    ZOR.expireLocks();
}

/**
 * Current player has captured someone.
 */
function handleSuccessfulPlayerCapture(capturedPlayerID) {
    var sound = ZOR.Sounds.sfx.player_capture;
    var capturedPlayer = ZOR.Game.players[capturedPlayerID];
    var windDownTime = 0;

    if (capturedPlayer) {
        ZOR.Sounds.playFromPos(sound, player.view.mainSphere, capturedPlayer.model.sphere.position);
        capturedPlayer.handleCapture();
        windDownTime = capturedPlayer.getWindDownTime();

        ZOR.UI.engine.set('capture_message', "You captured " + capturedPlayer.model.name);

        setTimeout(function clearCaptureMessage() {
            ZOR.UI.engine.set('capture_message', '');
        }, 5000);
    }

    removePlayerFromGame(capturedPlayerID, windDownTime);
}

/**
 * A player captured another player.  Current playre not involved.
 */
function handleOtherPlayercapture(capturedPlayerID) {
    var sound = ZOR.Sounds.sfx.player_capture;
    var capturedPlayer = ZOR.Game.players[capturedPlayerID];
    var windDownTime = 0;

    if (capturedPlayer) {
        ZOR.Sounds.playFromPos(sound, player.view.mainSphere, capturedPlayer.model.sphere.position);
        capturedPlayer.handleCapture();
        windDownTime = capturedPlayer.getWindDownTime();
    }

    console.log("Player died:  ", capturedPlayerID);
    removePlayerFromGame(capturedPlayerID, windDownTime);
}

function handleDeath(msg) {
    var attackingPlayerId = msg.attacking_player_id;

    console.log("YOU DIED! You were alive for " + msg.time_alive + " seconds. Killed by: ", attackingPlayerId);
    setDeadState();

    var attackingPlayer = zorbioModel.getPlayerById(attackingPlayerId);
    var attackingActor = zorbioModel.getActorById(attackingPlayer.sphere.id);
    attackingPlayer.score = config.PLAYER_GET_SCORE(attackingActor.scale);

    // Set finaly data about the player from the server
    var playerStats = {
        drainAmount: msg.drain_ammount,
        foodCaptures: msg.food_captures,
        playerCaptures: msg.player_captures,
        score: msg.score,
    };

    // stop woosh in case player was speed boosting
    ZOR.Sounds.sfx.woosh.stop();

    ZOR.UI.engine.set('attacker', attackingPlayer);
    ZOR.UI.engine.set('player', playerStats);
    ZOR.UI.state( ZOR.UI.STATES.RESPAWN_SCREEN );
}

function handlePlayerKick(reason) {
    setDeadState();

    ZOR.UI.state( ZOR.UI.STATES.KICKED_SCREEN );

    // Send server message to the UI (either real message, or undefined)
    ZOR.UI.engine.set('kicked_message', reason);

    console.log("you were kicked: ", reason);
}

function setDeadState() {
    player.beingCaptured = false;
    player.isDead = true;
    KeysDown = {};
}

function gaPerformanceMetrics() {
    if (gameStart && !player.isDead) {
        var ping = player.model.ping_metric.last;
        var fps = player.model.fps_metric.last;

        if (ping > 0) {
            ga('send', {
                hitType: 'timing',
                timingCategory: 'Ping',
                timingVar: 'ping',
                timingValue: ping,
                timingLabel: linodeNearLocation(),
            });
        }

        if (fps > 0) {
            ga('send', {
                hitType: 'timing',
                timingCategory: 'FPS',
                timingVar: 'fps',
                timingValue: fps,
            });
        }
    }
}
