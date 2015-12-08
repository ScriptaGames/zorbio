/**
 * Client network related functions
 */

var socket;

function connectToServer(playerType, playerName, color) {
    if (!socket) {
        socket = io({query: "type=" + playerType + "&name=" + playerName + "&color=" + color});
        setupSocket(socket);
    }
    socket.emit('respawn');
}

function sendPlayerSpherePosition() {
    // Make sure model is synced with view
    player.refreshSphereModel();

    var sphereModel = player.model.sphere;

    // cut down on the number of bytes sent across the wire
    var position = {
         x: sphereModel.position.x.toFixed(4),
         y: sphereModel.position.y.toFixed(4),
         z: sphereModel.position.z.toFixed(4)
    };

    //TODO: only send if the player is moving.  If their position hasn't changed, don't send.
    var sphere = {"id": sphereModel.id, "p": position, "s": sphereModel.scale};
    socket.emit('myPosition', sphere);

}

function sendHeartbeat() {
    socket.emit('playerHeartbeat', player.getPlayerId());
}

function handleNetworkTermination() {
    gameStart = false;
    cleanupMemory();
    showGame(false);
}

function setupSocket(socket) {
    // Handle connection
    socket.on('welcome', function (playerModel, model) {
        player = new PlayerController(playerModel);
        players[player.getPlayerId()] = player;

        zorbioModel = model;

        // iterate over actors and create THREE objects that don't serialize over websockets
        Object.getOwnPropertyNames(zorbioModel.actors).forEach(function (id) {
            var actor = zorbioModel.actors[id];
            var position = actor.position;
            actor.position = new THREE.Vector3(position.x, position.y, position.z);
        });

        socket.emit('gotit', player.model);
        gameStart = true;
        console.log('Game is started: ' + gameStart);

        // start sending the players position
        window.setInterval(sendPlayerSpherePosition, config.PLAYER_POSITION_INTERVAL);

        // start sending heartbeat
        window.setInterval(sendHeartbeat, config.HEARTBEAT_PULSE_INTERVAL);

        // create the scene
        createScene();

        document.getElementById('renderCanvas').focus();
    });

    socket.on('playerJoin', function (newPlayer) {
        //Add new player if it's not the current player
        if (newPlayer.id !== player.getPlayerId()) {
            players[newPlayer.id] = new PlayerController(newPlayer, scene);

            //Keep model in sync with the server
            zorbioModel.players[newPlayer.id] = newPlayer;
            zorbioModel.actors[newPlayer.sphere.id] = newPlayer.sphere;
            var position = newPlayer.sphere.position;
            zorbioModel.actors[newPlayer.sphere.id].position = new THREE.Vector3(position.x, position.y, position.z);
        }

        console.log('Player ' + newPlayer.name + ' joined!');
    });

    socket.on('gameSetup', function () {
        console.log('Games finished setting up');
    });

    socket.on('actorPositions', function (actors) {
        if (!gameStart) {
            return; // don't start updating player positions in the client until their game has started
        }

        // sync the actors positions from the server model to the client model
        Object.getOwnPropertyNames(actors).forEach(function (id) {
            if (zorbioModel.actors[id]) {
                var actor = actors[id];
                zorbioModel.actors[id].position.copy(actor.position);
                zorbioModel.actors[id].scale = actor.scale;
            }
        });
    });

     socket.on('kick', function (msg) {
         socket.close();
         handleNetworkTermination();
         kicked = true;
         displayModalMessage(msg);
         console.log('you were kicked', msg);
     });

    socket.on('playerKicked', function (playerId) {
        console.log('player kicked', playerId);
        removePlayerFromGame(playerId);
    });

    socket.on('connect', function () {
        console.log("Successfully connected to WebSocket");
    });

    socket.on('disconnect', function () {
        socket.close();
        handleNetworkTermination();
        disconnected = true;
        console.log('You were disconnected');
    });

    // Handle error
    socket.on('connect_failed', function () {
        socket.close();
        handleNetworkTermination();
        disconnected = true;
        console.log('WebSocket Connection failed');
    });

    /*
     // Handle ping
     socket.on('pong', function () {
     var latency = Date.now() - startPingTime;
     debug('Latency: ' + latency + 'ms');
     chat.addSystemLine('Ping: ' + latency + 'ms');
     });

     socket.on('playerDied', function (data) {
     chat.addSystemLine('Player <b>' + data.name + '</b> died!');
     });

     socket.on('leaderboard', function (data) {
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

     socket.on('serverMSG', function (data) {
     chat.addSystemLine(data);
     });

     // Chat
     socket.on('serverSendPlayerChat', function (data) {
     chat.addChatLine(data.sender, data.message, false);
     });

     // Die
     socket.on('RIP', function () {
     gameStart = false;
     died = true;
     window.setTimeout(function() {
     document.getElementById('gameAreaWrapper').style.opacity = 0;
     document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
     died = false;
     if (animLoopHandle) {
     window.cancelAnimationFrame(animLoopHandle);
     animLoopHandle = undefined;
     }
     }, 2500);
     });

     */
}
