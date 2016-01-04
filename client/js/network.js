/**
 * Client network related functions
 */

var socket;
var pendingPlayerCaptures = {};
var startPingTime;

// handles to setInterval methods so we can clear them later
var interval_id_player_position;
var interval_id_heartbeat;

function connectToServer(playerType, playerName, color) {
    if (!socket) {
        socket = io({query: "type=" + playerType + "&name=" + playerName + "&color=" + color});
        setupSocket(socket);
    }
    sendRespawn(true);
}

function sendRespawn(isFirstSpawn) {
    socket.emit('respawn', isFirstSpawn);
}

function sendPlayerSpherePosition() {
    // Make sure model is synced with view
    player.refreshSphereModel();

    var sphereModel = player.model.sphere;

    // cut down on the number of bytes sent across the wire
    var position = {
         x: +sphereModel.position.x.toFixed(4),
         y: +sphereModel.position.y.toFixed(4),
         z: +sphereModel.position.z.toFixed(4)
    };

    //TODO: only send if the player is moving.  If their position hasn't changed, don't send.
    var sphere = {"id": sphereModel.id, "p": position, "s": sphereModel.scale};
    socket.emit('myPosition', sphere);
}

function sendFoodCapture(fi) {
    socket.emit('foodCapture', fi);
}

function sendPlayerCapture(attackingPlayerId, targetPlayerId) {
    console.log("sendPlayerCapture: ", attackingPlayerId, targetPlayerId);

    if (!pendingPlayerCaptures[targetPlayerId]) {

        if (targetPlayerId === player.getPlayerId()) {
            player.beingCaptured = true;
        } else {
            pendingPlayerCaptures[targetPlayerId] = players[targetPlayerId];
        }

        console.log("socket.emit playerCapture: ", attackingPlayerId, targetPlayerId);
        socket.emit('playerCapture', attackingPlayerId, targetPlayerId);
    }
}

function sendPing() {
    startPingTime = performance.now();
    socket.emit('ping');
}

function sendHeartbeat() {
    socket.emit('playerHeartbeat', player.getPlayerId());
}

function handleNetworkTermination() {
    gameStart = false;
    socket.close();
    socket = null;
    cleanupMemory();
    showGame(false);
    showDeathScreen(false);
    clearIntervalMethods();
}

function setIntervalMethods() {
    // start sending the players position
    interval_id_player_position = window.setInterval(sendPlayerSpherePosition, config.ACTOR_UPDATE_INTERVAL);

    // start sending heartbeat
    interval_id_heartbeat = window.setInterval(sendHeartbeat, config.HEARTBEAT_PULSE_INTERVAL);
}

function clearIntervalMethods() {
    window.clearInterval(interval_id_player_position);
    window.clearInterval(interval_id_heartbeat);
}

function setupSocket(socket) {
    // Handle connection
    socket.on('welcome', function welcome(playerModel, isFirstSpawn) {
        player = new PlayerController(playerModel, playerModel.sphere);

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

        gameStart = true;
        console.log('Game is started: ' + gameStart);

        setIntervalMethods();

        if (isFirstSpawn) {
            // create the scene
            createScene();
        } else {
            // re-add player to scene and reset camera
            initCameraAndPlayer();
        }

        document.getElementById('render-canvas').focus();

        console.log('Game finished setting up');
    });

    socket.on('playerJoin', function playerJoin(newPlayer) {
        //Add new player if it's not the current player
        if (newPlayer.id !== player.getPlayerId()) {
            players[newPlayer.id] = new PlayerController(newPlayer, player.model.sphere, scene);

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
                zorbioModel.actors[id].position.copy(actor.position);
                zorbioModel.actors[id].scale = actor.scale;
            }
        }
    });

    socket.on('foodCaptureComplete', function foodCaptureComplete(fi) {
        hideFood( fi );
    });

    socket.on('kick', function kick(msg) {
        handleNetworkTermination();
        kicked = true;
        displayModalMessage(msg);
        console.log('you were kicked', msg);
    });

    socket.on('playerKicked', function playerKicked(playerId) {
        console.log('player kicked', playerId);
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
        handleServerTick(serverTickData);
    });

    socket.on('processingPlayerCapture', function processingPlayerCapture(targetPlayerId) {
        console.log("processingPlayerCapture: ", targetPlayerId);
        pendingPlayerCaptures[targetPlayerId] = players[targetPlayerId];  // save player getting captured
        socket.emit('continuePlayerCapture', player.getPlayerId(), targetPlayerId);
    });

    socket.on('invalidCaptureTargetNotInModel', function invalidCaptureTargetNotInModel(attackingPlayerId, targetPlayerId) {
        console.log("invalidCaptureTargetNotInModel: ", attackingPlayerId, targetPlayerId);

        // clean up
        var playerId = player.getPlayerId();
        if (attackingPlayerId === playerId) {
            if (pendingPlayerCaptures[targetPlayerId]) {
                pendingPlayerCaptures[targetPlayerId] = null;
                delete pendingPlayerCaptures[targetPlayerId];
            }
        } else if (targetPlayerId === playerId) {
            player.beingCaptured = false;
        }

        // safe method to call if they are already removed just to make sure we stay in sync with server
        removePlayerFromGame(targetPlayerId);
    });

    socket.on('successfulCapture', function successfulCapture(targetPlayerId) {
        console.log("YOU CAPTURED PLAYER! ", targetPlayerId);
        var targetPlayer = pendingPlayerCaptures[targetPlayerId];
        handleSuccessfulPlayerCapture(targetPlayer);
        removePlayerFromGame(targetPlayerId);
        if (pendingPlayerCaptures[targetPlayerId]) {
            pendingPlayerCaptures[targetPlayerId] = null;
            delete pendingPlayerCaptures[targetPlayerId];
        }
    });

    socket.on('youDied', function youDied(attackingPlayerId) {
        console.log("YOU DIED! Killed by: ", attackingPlayerId);
        player.beingCaptured = false;
        player.isDead = true;
        clearIntervalMethods();
        KeysDown = {};
        showDeathScreen(true);
    });

    socket.on('playerDied', function playerDied(attackingPlayerId, targetPlayerId) {
        if (attackingPlayerId !== player.getPlayerId()) {
            // someone else killed another player, lets remove it
            console.log("Player died:  ", targetPlayerId);
            removePlayerFromGame(targetPlayerId);
        }
    });

    socket.on('pong', function pong() {
        var latency = performance.now() - startPingTime;
        console.log('Ping: ' + latency.toFixed(2) + 'ms');
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
