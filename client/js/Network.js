/**
 * Client network related functions
 */

var socket;

var heartBeatStart;

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
    // Make sure model is synced with view
    player.refreshSphereModel();

    var sphereModel = player.model.sphere;
    var positions = [];

    if (sphereModel.recentPositions.length < 2) {
        player.addRecentPosition();  // make sure we always have at least 2 recent positions
    }

    if (config.PLAYER_POSITIONS_FULL_SAMPLE) {
        positions = sphereModel.recentPositions;
    } else {
        // for now we only need to send the oldest position and the most recent position
        var oldestPosition = sphereModel.recentPositions[0];
        var latestPosition = sphereModel.recentPositions[sphereModel.recentPositions.length - 1];
        positions.push(oldestPosition);
        positions.push(latestPosition);
    }

    var sphere = {"id": sphereModel.id, "positions": positions, "scale": sphereModel.scale};
    socket.emit('myPosition', sphere);
}

var throttledSendPlayerSpherePosition = _.throttle(sendPlayerSpherePosition, config.ACTOR_UPDATE_INTERVAL);

function sendFoodCapture(fi, sphere_id, radius, food_value) {
    socket.emit('foodCapture', fi, sphere_id, radius, food_value);
}

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

function sendHeartbeat() {
    heartBeatStart = performance.now();
    var bufArr = new ArrayBuffer(4);
    var bufView = new Uint8Array(bufArr);
    bufView[0]=6;
    bufView[1]=7;
    bufView[2]=8;
    bufView[3]=9;

    // heart beat send
    socket.emit('serverPing', bufArr);
}

function handleNetworkTermination() {
    location.reload();
}

function setIntervalMethods() {
    // start sending heartbeat
    interval_id_heartbeat = window.setInterval(sendHeartbeat, config.HEARTBEAT_PULSE_INTERVAL);
}

function clearIntervalMethods() {
    window.clearInterval(interval_id_heartbeat);
}

function setupSocket(socket) {
    // Handle connection
    socket.on('welcome', function welcome(playerModel, isFirstSpawn) {
        player = new ZOR.PlayerController(playerModel, playerModel.sphere);

        socket.emit('gotit', player.model, isFirstSpawn);
    });

    socket.on('gameSetup', function gameSetup(model, isFirstSpawn) {
        players[player.getPlayerId()] = player;

        zorbioModel = model;

        // iterate over actors and create THREE objects that don't serialize over websockets
        var actorIds = Object.getOwnPropertyNames(zorbioModel.actors);
        for (var i = 0, l = actorIds.length; i < l; i++) {
            var actor = zorbioModel.actors[actorIds[i]];
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

    socket.on('actorPositions', function actorPositions(actors) {
        if (!gameStart) {
            return; // don't start updating player positions in the client until their game has started
        }

        // sync the actors positions from the server model to the client model
        var actorIds = Object.getOwnPropertyNames(actors);
        for (var i = 0, l = actorIds.length; i < l; i++) {
            var id = actorIds[i];
            if (zorbioModel.actors[id]) {
                var actor = actors[id];
                zorbioModel.actors[id].position.copy(actor.p);
                zorbioModel.actors[id].scale = actor.s;
            }
        }
    });

    socket.on('foodCaptureComplete', function foodCaptureComplete(fi) {
        if (!gameStart) return;

        foodController.hideFood( fi );
    });

    socket.on('kick', function kick(msg) {
        console.log('Server said: ', msg);
        handleNetworkTermination();
        kicked = true;
    });

    socket.on('removePlayer', function playerKicked(playerId) {
        if (!gameStart) return;

        removePlayerFromGame(playerId);
    });

    socket.on('connect', function connect() {
        console.log("Successfully connected to WebSocket");
    });

    socket.on('disconnect', function disconnect() {
        handleNetworkTermination();
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

    socket.on('invalidFoodCapture', function invalidFoodCapture(fi, food_value) {
        if (!gameStart) return;

        console.log("invalidFoodCapture: ", fi, food_value, player.getPlayerId());

        // shrink player
        player.grow(-food_value);
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
        player.beingCaptured = false;
        player.isDead = true;
        clearIntervalMethods();
        KeysDown = {};

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

    socket.on('clientPing', function (bufArr) {
        var bufView = new Uint8Array(bufArr);
        var duration = performance.now() - heartBeatStart;
        console.log('Ping: ' + duration + 'ms');
        console.log("Data: ", bufView[0], bufView[1], bufView[2], bufView[3])
    });

    /*

     socket.on('leaderboard', function leaderboard(data) {
     leaderboard = data.leaderboard;
     var status = '<span class="title">Leaderboard</span>';
     for (var i = 0; i < leaderboard.length; i++) {
     status += '<br />';
     if (leaderboard[i].id == player.id){
     if(leaderboard[i].name.length !== 0)
     status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + "</span>";
     else
     status += '<span class="me">' + (i + 1) + ". A cell unnamed</span>";
     } else {
     if(leaderboard[i].name.length !== 0)
     status += (i + 1) + '. ' + leaderboard[i].name;
     else
     status += (i + 1) + '. A cell unnamed';
     }
     }
     //status += '<br />Players: ' + data.players;
     document.getElementById('status').innerHTML = status;
     });

     */
}
