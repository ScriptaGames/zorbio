/**
 * Client network related functions
 */

var socket;

// handles to setInterval methods so we can clear them later
var interval_id_player_position;
var interval_id_heartbeat;

function connectToServer(playerType, playerName, color) {
    if (!socket) {
        socket = io(config.BALANCER_NA, {query: "type=" + playerType + "&name=" + playerName + "&color=" + color});
        setupSocket(socket);
    }
    sendRespawn(true);
}

function sendRespawn(isFirstSpawn) {
    gameStart = false;
    socket.emit('respawn', isFirstSpawn);
}

function sendPlayerSpherePosition() {
    var sphereModel = player.model.sphere;

    var sphere = {"id": sphereModel.id, "positions": [{"position":{"x":0,"y":0,"z":0},"radius":2,"time":1454115957242},{"position":{"x":0,"y":0,"z":0},"radius":2,"time":1454115957725}], "scale": sphereModel.scale};
    socket.emit('myPosition', sphere);
}

function sendHeartbeat() {
    socket.emit('playerHeartbeat');
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

        gameStart = true;
        console.log('Game is started: ' + gameStart);

        setIntervalMethods();

        console.log('Game finished setting up');
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

    socket.on('kick', function kick(msg) {
        console.log('Server said: ', msg);
        kicked = true;
    });

    socket.on('connect', function connect() {
        console.log("Successfully connected to WebSocket");
    });

    socket.on('disconnect', function disconnect() {
        clearIntervalMethods();
        disconnected = true;
        console.log('You were disconnected');
    });

    // Handle error
    socket.on('connect_failed', function connect_failed() {
        disconnected = true;
        console.log('WebSocket Connection failed');
    });

    socket.on('pong', function pong(number) {
        console.log('Ping: ' + number + 'ms');
    });
}
