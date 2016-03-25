/**
 * Client network related functions
 */

var ws;

var zorPingStart;
var zorPingDuration = 0;
var actorUpdateGap = 0;

// handles to setInterval methods so we can clear them later
var interval_id_heartbeat;

function connectToServer(playerType, playerName, color) {
    var key;

    if (!ws) {
        key = ZOR.UI.engine.get('alpha_key');

        var uri = new URI(config.BALANCER + ':' + config.PORT);
        uri.addQuery('type', playerType);
        uri.addQuery('name', playerName);
        uri.addQuery('color', color);
        uri.addQuery('key', key);

        ws = new WebSocket( uri.toString() );

        ws.onopen = function wsOpen () {
            console.log("WebSocket connection established and ready.");
            setupSocket( ws );
            sendRespawn(true);
        };
    }
    else if (ws.readyState === WebSocket.OPEN) {
        sendRespawn(true);
    }
}

function setupSocket(ws) {
    ws.onclose = function wsClose (e) {
        if (e.code != config.CLOSE_NO_RESTART) {
            handleNetworkTermination();
        }
        disconnected = true;
        console.log('Connection closed:', e.code, e.reason);
    };

    ws.onmessage = function wsMessage (msg) {
        if (typeof msg.data === "string") {
            var message = JSON.parse(msg.data);

            switch (message.op) {
                case 'welcome':
                    handle_msg_welcome(message);
                    break;
                case 'game_setup':
                    handle_msg_game_setup(message);
                    break;
                case 'player_join':
                    handle_msg_player_join(message);
                    break;
                case 'zor_pong':
                    handle_msg_zor_pong();
                    break;
            }
        }
        else {
            // handle binary message
        }
    };

    function handle_msg_welcome(msg) {
        var playerModel = msg.currentPlayer;
        var isFirstSpawn = msg.isFirstSpawn;

        player = new ZOR.PlayerController(playerModel, playerModel.sphere);
        ZOR.UI.engine.set('player', player.model);

        ws.send(JSON.stringify({op: 'player_ready', isFirstSpawn: isFirstSpawn}));
    }

    function handle_msg_game_setup(msg) {
        players[player.getPlayerId()] = player;

        zorbioModel = msg.model;

        // iterate over actors and create THREE objects that don't serialize over websockets
        var actorIds = Object.getOwnPropertyNames(zorbioModel.actors);
        for (var i = 0, l = actorIds.length; i < l; i++) {
            var actorId = +actorIds[i];  // make sure id is a number
            var actor = zorbioModel.actors[actorId];
            var position = actor.position;
            actor.position = new THREE.Vector3(position.x, position.y, position.z);
        }

        if (msg.isFirstSpawn) {
            // create the scene
            createScene();
        } else {
            // re-add player to scene and reset camera
            initCameraAndPlayer();
        }

        gameStart = true;
        console.log('Game is started: ' + gameStart);

        setIntervalMethods();

        ws.send(JSON.stringify({op: "player_in_game"}));
        console.log('Game finished setting up');
    }

    function handle_msg_player_join(message) {
        if (!gameStart) return;
        var newPlayer = message.player;

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
    }

    function handle_msg_zor_pong() {
        zorPingDuration = Date.now() - zorPingStart;
        console.log('Ping: ' + zorPingDuration + 'ms');
    }
}

function handleNetworkTermination() {
    setTimeout(location.reload.bind(location), 500);
}

function sendRespawn(isFirstSpawn) {
    gameStart = false;
    ws.send(JSON.stringify({op: 'respawn', isFirstSpawn: isFirstSpawn}));
}

function sendPing() {
    zorPingStart = Date.now();

    // Send ping to track latency, client heartbeat, and fps
    ws.send(JSON.stringify({op: 'zor_ping', lastPing: zorPingDuration, fps: ZOR.LagScale.get_fps()}));
}

function setIntervalMethods() {
    // start sending heartbeat
    interval_id_heartbeat = window.setInterval(sendPing, config.HEARTBEAT_PULSE_INTERVAL);
}

//
//function sendPlayerSpherePosition() {
//    var nowTime = Date.now();
//    var gap = nowTime - player.model.pp_send_metric.last_time;
//    player.model.pp_send_metric.last_time = nowTime;
//
//    var bufferedAmount = socket.io.engine.transport.ws.bufferedAmount;
//
//    // Make sure model is synced with view
//    player.refreshSphereModel();
//
//    var sphereModel = player.model.sphere;
//
//    if (sphereModel.recentPositions.length < 2) {
//        player.addRecentPosition();  // make sure we always have at least 2 recent positions
//    }
//
//    // for now we only need to send the oldest position and the most recent position
//    var oldestPosition = sphereModel.recentPositions[0];
//    var latestPosition = sphereModel.recentPositions[sphereModel.recentPositions.length - 1];
//
//    var bufferView = new Float32Array(config.BIN_PP_POSITIONS_LENGTH + (player.food_capture_queue.length * 2));
//    var index = 0;
//    bufferView[index++] = sphereModel.id;            // Actor ID
//    bufferView[index++] = gap;                       // Gap since last pp update
//    bufferView[index++] = actorUpdateGap;            // Gap since last au update
//    bufferView[index++] = bufferedAmount;            // Amount of bytes currently buffered to send in the ws
//    bufferView[index++] = oldestPosition.position.x; // Old position X
//    bufferView[index++] = oldestPosition.position.y; // Old position Y
//    bufferView[index++] = oldestPosition.position.z; // Old position Z
//    bufferView[index++] = oldestPosition.radius;     // Old radius
//    bufferView[index++] = oldestPosition.time;       // Old time
//    bufferView[index++] = latestPosition.position.x; // New position X
//    bufferView[index++] = latestPosition.position.y; // New position Y
//    bufferView[index++] = latestPosition.position.z; // New position Z
//    bufferView[index++] = latestPosition.radius;     // New radius
//    bufferView[index++] = latestPosition.time;       // New time
//
//    // Now add any queued food captures
//    for(var i = 0, l = player.food_capture_queue.length; i < l; i++) {
//        var food_cap = player.food_capture_queue[i];
//        bufferView[index++] = food_cap.fi;
//        bufferView[index++] = food_cap.radius;
//    }
//
//    // clear food queue
//    player.food_capture_queue = [];
//
//    // pp "Player Position"
//    socket.emit('pp', bufferView.buffer);
//}
//
//var throttledSendPlayerSpherePosition = _.throttle(sendPlayerSpherePosition, config.ACTOR_UPDATE_INTERVAL);
//
//
//function clearIntervalMethods() {
//    window.clearInterval(interval_id_heartbeat);
//}
//
//function setupSocket(socket) {
//
//
//    socket.on('au', function actorUpdates(buf) {
//
//        if (!gameStart) {
//            return; // don't start updating player positions in the client until their game has started
//        }
//
//        // Record gap since last actor update was received
//        var nowTime = Date.now();
//        actorUpdateGap = nowTime - player.model.au_receive_metric.last_time;
//        player.model.au_receive_metric.last_time = nowTime;
//
//        var actorArray;
//        var drainArray;
//
//        var actor_parts = 6;
//        var drain_bytes = config.MAX_PLAYERS - 1;
//        var actor_bytes = 32 * actor_parts;
//        var player_bytes = UTIL.fourPad( actor_bytes + drain_bytes ); // bytes per player
//        var player_count = buf.byteLength / player_bytes; // number of player frames in this update
//
//        // sync the actors positions from the server model to the client model
//        var i = player_count;
//        while ( i-- ) {
//
//            actorArray = new Float32Array(buf, i * player_bytes, actor_parts);
//            drainArray = new Uint8Array(buf, i * player_bytes + actor_bytes, drain_bytes);
//
//            var id = +actorArray[ 0 ];
//            var actor = zorbioModel.actors[id];
//
//            if (actor) {
//                var x = actorArray[ 1 ];
//                var y = actorArray[ 2 ];
//                var z = actorArray[ 3 ];
//                var s = actorArray[ 4 ];
//                var serverAdjust = actorArray[ 5 ];
//
//                actor.position.set(x, y, z);
//                actor.scale = s;
//                actor.serverAdjust = serverAdjust;
//                actor.drains = drainArray;
//            }
//        }
//    });
//
//    // TODO: queue this into the actorUpdate message from the server
//    socket.on('foodCaptureComplete', function foodCaptureComplete(fi) {
//        if (!gameStart) return;
//
//        foodController.hideFood( fi );
//    });
//
//    socket.on('kick', function kick(msg) {
//        console.log('Server said: ', msg);
//        setDeadState();
//        handlePlayerKick(msg);
//    });
//
//    socket.on('removePlayer', function playerKicked(playerId) {
//        if (!gameStart) return;
//
//        removePlayerFromGame(playerId);
//    });
//
//    // Handle error
//    socket.on('connect_failed', function connect_failed() {
//        handleNetworkTermination();
//        disconnected = true;
//        console.log('WebSocket Connection failed');
//    });
//
//    socket.on('serverTick', function serverTick(serverTickData) {
//        if (!gameStart) return;
//
//        handleServerTick(serverTickData);
//    });
//
//
//    socket.on('speedingWarning', function speedingWarning() {
//        if (!gameStart) return;
//
//        console.log("WARNING! You are speeding!");
//    });
//
//    socket.on('successfulCapture', function successfulCapture(targetPlayerId) {
//        if (!gameStart) return;
//
//        console.log("YOU CAPTURED PLAYER! ", targetPlayerId);
//        var targetPlayer = players[targetPlayerId];
//        handleSuccessfulPlayerCapture(targetPlayer);
//        removePlayerFromGame(targetPlayerId);
//        if (ZOR.pendingPlayerCaptures[targetPlayerId]) {
//            delete ZOR.pendingPlayerCaptures[targetPlayerId];
//        }
//    });
//
//    socket.on('youDied', function youDied(attackingPlayerId, targetPlayer) {
//        if (!gameStart) return;
//
//        var timeAlive = Math.floor((targetPlayer.deathTime - targetPlayer.spawnTime) / 1000);
//
//        console.log("YOU DIED! You were alive for " + timeAlive + " seconds. Killed by: ", attackingPlayerId);
//        setDeadState();
//
//        ZOR.UI.engine.set('attacker', zorbioModel.players[attackingPlayerId]);
//        ZOR.UI.engine.set('player', targetPlayer);
//        ZOR.UI.state( ZOR.UI.STATES.RESPAWN_SCREEN );
//    });
//
//    socket.on('playerDied', function playerDied(attackingPlayerId, targetPlayerId) {
//        if (!gameStart) return;
//
//        if (attackingPlayerId !== player.getPlayerId()) {
//            // someone else killed another player, lets remove it
//            console.log("Player died:  ", targetPlayerId);
//            removePlayerFromGame(targetPlayerId);
//        }
//    });
//
//}
