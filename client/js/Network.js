/**
 * Client network related functions
 */

var socket;

var zorPingStart;
var zorPingDuration = 0;

// handles to setInterval methods so we can clear them later
var interval_id_heartbeat;

function connectToServer(playerType, playerName, color) {
    var key;
    if (!socket) {
        //TODO: make which balancer they use configurable on the client
        key = ZOR.UI.engine.get('alpha_key');
        socket = io(config.BALANCER + ':' + config.PORT, {query: 'type=' + playerType + '&name=' + playerName + '&color=' + color + '&key=' + key});
        setupSocket(socket);
    }
    sendRespawn(true);
}

function sendRespawn(isFirstSpawn) {
    gameStart = false;
    socket.emit('respawn', isFirstSpawn);
}

function sendPlayerSpherePosition() {
    var nowTime = Date.now();
    var gap = nowTime - player.pp_send_last_time;
    player.pp_send_last_time = nowTime;

    // Make sure model is synced with view
    player.refreshSphereModel();

    var sphereModel = player.model.sphere;

    if (sphereModel.recentPositions.length < 2) {
        player.addRecentPosition();  // make sure we always have at least 2 recent positions
    }

    // for now we only need to send the oldest position and the most recent position
    var oldestPosition = sphereModel.recentPositions[0];
    var latestPosition = sphereModel.recentPositions[sphereModel.recentPositions.length - 1];

    var bufferView = new Float32Array(config.BIN_PP_POSITIONS_LENGTH + (player.food_capture_queue.length * 2));
    var index = 0;
    bufferView[index++] = sphereModel.id;            // Actor ID
    bufferView[index++] = gap;                       // Gap since last update
    bufferView[index++] = oldestPosition.position.x; // Old position X
    bufferView[index++] = oldestPosition.position.y; // Old position Y
    bufferView[index++] = oldestPosition.position.z; // Old position Z
    bufferView[index++] = oldestPosition.radius;     // Old radius
    bufferView[index++] = oldestPosition.time;       // Old time
    bufferView[index++] = latestPosition.position.x; // New position X
    bufferView[index++] = latestPosition.position.y; // New position Y
    bufferView[index++] = latestPosition.position.z; // New position Z
    bufferView[index++] = latestPosition.radius;     // New radius
    bufferView[index++] = latestPosition.time;       // New time

    // Now add any queued food captures
    for(var i = 0, l = player.food_capture_queue.length; i < l; i++) {
        var food_cap = player.food_capture_queue[i];
        bufferView[index++] = food_cap.fi;
        bufferView[index++] = food_cap.radius;
    }

    // clear food queue
    player.food_capture_queue = [];

    // pp "Player Position"
    socket.emit('pp', bufferView.buffer);
}

var throttledSendPlayerSpherePosition = _.throttle(sendPlayerSpherePosition, config.ACTOR_UPDATE_INTERVAL);

function sendPlayerCapture(attackingPlayerId, targetPlayerId) {
    console.log("sendPlayerCapture: ", attackingPlayerId, targetPlayerId);

    if (!ZOR.pendingPlayerCaptures[targetPlayerId]) {

        if (targetPlayerId === player.getPlayerId()) {
            player.beingCaptured = true;
        } else {
            ZOR.pendingPlayerCaptures[targetPlayerId] = config.PENDING_PLAYER_CAPTURE_TTL;  // stop sending dupe player captures
        }

        console.log("socket.emit playerCapture: ", attackingPlayerId, targetPlayerId);
        socket.emit('playerCapture', attackingPlayerId, targetPlayerId, player.model.sphere);
    }
}

function sendPing() {
    zorPingStart = Date.now();

    // send binary message to server
    socket.emit('zorServerPing', {lastPing: zorPingDuration, fps: ZOR.LagScale.get_fps()});
}

function handleNetworkTermination() {
    location.reload();
}

function setIntervalMethods() {
    // start sending heartbeat
    interval_id_heartbeat = window.setInterval(sendPing, config.HEARTBEAT_PULSE_INTERVAL);
}

function clearIntervalMethods() {
    window.clearInterval(interval_id_heartbeat);
}

function setupSocket(socket) {
    // Handle connection
    socket.on('welcome', function welcome(playerModel, isFirstSpawn) {
        player = new ZOR.PlayerController(playerModel, playerModel.sphere);
        ZOR.UI.engine.set('player', player.model);

        socket.emit('gotit', player.model, isFirstSpawn);
    });

    socket.on('gameSetup', function gameSetup(model, isFirstSpawn) {
        players[player.getPlayerId()] = player;

        zorbioModel = model;

        // iterate over actors and create THREE objects that don't serialize over websockets
        var actorIds = Object.getOwnPropertyNames(zorbioModel.actors);
        for (var i = 0, l = actorIds.length; i < l; i++) {
            var actorId = +actorIds[i];  // make sure id is a number
            var actor = zorbioModel.actors[actorId];
            var position = actor.position;
            actor.position = new THREE.Vector3(position.x, position.y, position.z);
        }

        if (isFirstSpawn) {
            // create the scene
            createScene();
        } else {
            // re-add player to scene and reset camera
            initCameraAndPlayer();
        }

        gameStart = true;
        console.log('Game is started: ' + gameStart);

        setIntervalMethods();

        document.getElementById('render-canvas').focus();

        console.log('Game finished setting up');
    });

    socket.on('playerJoin', function playerJoin(newPlayer) {
        if (!gameStart) return;

        //Add new player if it's not the current player
        if (newPlayer.id !== player.getPlayerId()) {
            players[newPlayer.id] = new ZOR.PlayerController(newPlayer, player.model.sphere, scene);

            //Keep model in sync with the server
            zorbioModel.players[newPlayer.id] = newPlayer;
            zorbioModel.actors[newPlayer.sphere.id] = newPlayer.sphere;
            var position = newPlayer.sphere.position;
            zorbioModel.actors[newPlayer.sphere.id].position = new THREE.Vector3(position.x, position.y, position.z);
        }

        console.log('Player ' + newPlayer.name + ' joined!');
    });

    socket.on('au', function actorUpdates(buf) {

        if (!gameStart) {
            return; // don't start updating player positions in the client until their game has started
        }

        var actorsArray = new Float32Array(buf);

        // sync the actors positions from the server model to the client model
        for (var i = 0, l = actorsArray.length; i < l; i += 6) {
            var id = +actorsArray[ i ];
            var actor = zorbioModel.actors[id];

            if (actor) {
                var x = actorsArray[ i + 1 ];
                var y = actorsArray[ i + 2 ];
                var z = actorsArray[ i + 3 ];
                var s = actorsArray[ i + 4 ];
                var serverAdjust = actorsArray[ i + 5 ];

                actor.position.copy({x: x, y: y, z: z});
                actor.scale = s;
                actor.serverAdjust = serverAdjust;
            }
        }
    });

    // TODO: queue this into the actorUpdate message from the server
    socket.on('foodCaptureComplete', function foodCaptureComplete(fi) {
        if (!gameStart) return;

        foodController.hideFood( fi );
    });

    socket.on('kick', function kick(msg) {
        console.log('Server said: ', msg);
        setDeadState();
        handlePlayerKick(msg);
    });

    socket.on('removePlayer', function playerKicked(playerId) {
        if (!gameStart) return;

        removePlayerFromGame(playerId);
    });

    socket.on('connect', function connect() {
        console.log("Successfully connected to WebSocket");
    });

    socket.on('disconnect', function disconnect(data) {
        if (data.restart || data === 'transport close') {
            handleNetworkTermination();
        }
        disconnected = true;
        console.log('You were disconnected');
    });

    // Handle error
    socket.on('connect_failed', function connect_failed() {
        handleNetworkTermination();
        disconnected = true;
        console.log('WebSocket Connection failed');
    });

    socket.on('serverTick', function serverTick(serverTickData) {
        if (!gameStart) return;

        handleServerTick(serverTickData);
    });

    socket.on('processingPlayerCapture', function processingPlayerCapture(targetPlayerId) {
        if (!gameStart) return;

        console.log("processingPlayerCapture: ", targetPlayerId);
        ZOR.pendingPlayerCaptures[targetPlayerId] = config.PENDING_PLAYER_CAPTURE_TTL;  // stop sending dupe player captures
        socket.emit('continuePlayerCapture', player.getPlayerId(), targetPlayerId);
    });

    socket.on('invalidCaptureTargetNotInModel', function invalidCaptureTargetNotInModel(attackingPlayerId, targetPlayerId) {
        if (!gameStart) return;

        console.log("invalidCaptureTargetNotInModel: ", attackingPlayerId, targetPlayerId);

        // clean up
        var playerId = player.getPlayerId();
        if (attackingPlayerId === playerId) {
            if (ZOR.pendingPlayerCaptures[targetPlayerId]) {
                delete ZOR.pendingPlayerCaptures[targetPlayerId];
            }
        } else if (targetPlayerId === playerId) {
            player.beingCaptured = false;
        }

        // safe method to call if they are already removed just to make sure we stay in sync with server
        removePlayerFromGame(targetPlayerId);
    });

    socket.on("invalidCaptureTargetToFar", function invalidCaptureTargetToFar(attackingPlayerId, targetPlayerId) {
        console.log("invalidCaptureTargetToFar");

        if (ZOR.pendingPlayerCaptures[targetPlayerId]) {
            delete ZOR.pendingPlayerCaptures[targetPlayerId];
        }
    });

    socket.on('speedingWarning', function speedingWarning() {
        if (!gameStart) return;

        console.log("WARNING! You are speeding!");
    });

    socket.on('successfulCapture', function successfulCapture(targetPlayerId) {
        if (!gameStart) return;

        console.log("YOU CAPTURED PLAYER! ", targetPlayerId);
        var targetPlayer = players[targetPlayerId];
        handleSuccessfulPlayerCapture(targetPlayer);
        removePlayerFromGame(targetPlayerId);
        if (ZOR.pendingPlayerCaptures[targetPlayerId]) {
            delete ZOR.pendingPlayerCaptures[targetPlayerId];
        }
    });

    socket.on('youDied', function youDied(attackingPlayerId, targetPlayer) {
        if (!gameStart) return;

        var timeAlive = Math.floor((targetPlayer.deathTime - targetPlayer.spawnTime) / 1000);

        console.log("YOU DIED! You were alive for " + timeAlive + " seconds. Killed by: ", attackingPlayerId);
        setDeadState();

        ZOR.UI.engine.set('attacker', zorbioModel.players[attackingPlayerId]);
        ZOR.UI.engine.set('player', targetPlayer);
        ZOR.UI.state( ZOR.UI.STATES.RESPAWN_SCREEN );
    });

    socket.on('playerDied', function playerDied(attackingPlayerId, targetPlayerId) {
        if (!gameStart) return;

        if (attackingPlayerId !== player.getPlayerId()) {
            // someone else killed another player, lets remove it
            console.log("Player died:  ", targetPlayerId);
            removePlayerFromGame(targetPlayerId);
        }
    });

    //socket.on('pong', function pong(number) {
    //    console.log('Ping: ' + number + 'ms');
    //});

    socket.on('zorServerPong', function (msg) {
        zorPingDuration = Date.now() - zorPingStart;
        console.log('Ping: ' + zorPingDuration + 'ms');
    });
}
