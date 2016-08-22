/**
 * Client network related functions
 */

var ws;

var zorPingStart;
var zorPingDuration = 0;
var actorUpdateGap = 0;

// handles to setInterval methods so we can clear them later
var interval_id_heartbeat;

function connectToServer() {
    var uri = new URI(config.BALANCER + ':' + config.PORT);

    ws = new WebSocket( uri.toString() );
    ws.binaryType = 'arraybuffer';

    ws.onopen = function wsOpen () {
        console.log("WebSocket connection established and ready.");
        setupSocket( ws );
    };
}

function sendEnterGame(playerType, playerName, color, key) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({op: 'enter_game', type: playerType, name: playerName, color: color, key: key}));
    }
}

function setupSocket(ws) {
    ws.onmessage = function wsMessage (msg) {
        if (typeof msg.data === "string") {
            var message = parseJson(msg.data);

            switch (message.op) {
                case 'init_game':
                    handle_msg_init_game(message);
                    break;
                case 'welcome':
                    handle_msg_welcome(message);
                    break;
                case 'game_setup':
                    handle_msg_game_setup();
                    break;
                case 'player_join':
                    handle_msg_player_join(message);
                    break;
                case 'zor_pong':
                    handle_msg_zor_pong();
                    break;
                case 'captured_player':
                    handle_msg_captured_player(message);
                    break;
                case 'you_died':
                    handle_msg_you_died(message);
                    break;
                case 'player_died':
                    handle_msg_player_died(message);
                    break;
                case 'food_captured':
                    handle_msg_food_captured(message);
                    break;
                case 'server_tick_slow':
                    handle_msg_server_tick_slow(message);
                    break;
                case 'kick':
                    handle_msg_kick(message);
                    break;
                case 'remove_player':
                    handle_msg_remove_player(message);
                    break;
                case 'speeding_warning':
                    handle_msg_speeding_warning();
                    break;
                case 'speed_boost_res':
                    handle_msg_speed_boost_res(message);
                    break;
                case 'speed_boost_stop':
                    handle_msg_speed_boost_stop();
                    break;
            }
        }
        else {
            var op = UTIL.readFirstByte(msg.data);

            switch (op) {
                case ZOR.Schemas.ops.INIT_GAME:
                    handle_msg_init_game( ZOR.Schemas.initGameSchema.decode(msg.data) );
                    break;
                case ZOR.Schemas.ops.ACTOR_UPDATES:
                    handle_msg_actor_updates( ZOR.Schemas.actorUpdatesSchema.decode(msg.data) );
                    break;
                default:
                    console.error("Error: Unknown binary op code: ", op);
            }
        }
    };

    ws.onclose = function wsClose (e) {
        if (e.code != config.CLOSE_NO_RESTART) {
            handleNetworkTermination();
        }
        disconnected = true;
        console.log('Connection closed:', e.code, e.reason);
    };

    ws.onerror = function wsError(e) {
        console.error("Websocket error occured", e);
    };

    function parseJson(msg) {
        // put in own function so we can see how long this takes in the profiler
        return JSON.parse(msg);
    }

    function handle_msg_init_game(msg) {
        // iterate over actors and create THREE objects that don't serialize over websockets
        msg.model.actors.forEach(function eachActor(actor) {
            UTIL.toVector3(actor, 'position');
            UTIL.toVector3(actor, 'velocity');
        });

        _.assign(zorbioModel, msg.model);

        ZOR.UI.on('init', createScene);

        console.log('Game initialzed');
    }

    function handle_msg_welcome(msg) {
        var playerModel = msg.currentPlayer;

        player = new ZOR.PlayerController(playerModel, null, true);
        ZOR.UI.engine.set('player', player.model);

        ws.send(JSON.stringify({op: 'player_ready'}));
    }

    function handle_msg_game_setup() {
        // add player to players and actors
        ZOR.Game.players[player.getPlayerId()] = player;
        zorbioModel.addActor(player.model.sphere);

        // add player to scene and reset camera
        initCameraAndPlayer();

        gameStart = true;

        setIntervalMethods();

        console.log('Game started!');
    }

    function handle_msg_player_join(message) {
        var newPlayer = message.player;

        if (player && (newPlayer.id === player.getPlayerId())) {
            return; // ignore own join message
        }

        //Add new player if it's already added
        if (!ZOR.Game.players[newPlayer.id]) {
            ZOR.Game.players[newPlayer.id] = new ZOR.PlayerController(newPlayer, scene);
            ZOR.Game.players[newPlayer.id].setAlpha(1);

            //Initialize THREE objects
            UTIL.toVector3(newPlayer.sphere, 'position');
            UTIL.toVector3(newPlayer.sphere, 'velocity');

            //Keep model in sync with the server
            zorbioModel.players.push(newPlayer);
            zorbioModel.addActor(newPlayer.sphere);
        }

        console.log('Player joined: ', newPlayer.id, newPlayer.name);
    }

    function handle_msg_zor_pong() {
        zorPingDuration = Date.now() - zorPingStart;
        console.log('Ping: ' + zorPingDuration + 'ms');
    }

    function handle_msg_actor_updates(msg) {
        if (player) {
            // Record gap since last actor update was received
            var nowTime = Date.now();
            actorUpdateGap = nowTime - player.model.au_receive_metric.last_time;
            player.model.au_receive_metric.last_time = nowTime;
        }

        msg.actors.forEach(function updateEachActor(serverActor) {
            var clientActor = zorbioModel.getActorById(serverActor.id);

            if (clientActor) {
                var last_pos_update = (clientActor.lastPosition || clientActor.position).clone();
                clientActor.position.copy(serverActor.position);
                clientActor.scale = serverActor.scale;
                clientActor.lastPosition = clientActor.position.clone();
                clientActor.velocity = clientActor.position.clone().sub(last_pos_update);

                if (clientActor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
                    clientActor.drain_target_id = serverActor.drain_target_id;
                    var playerController = ZOR.Game.players[clientActor.playerId];
                    if (playerController) {
                        playerController.setSpeedBoostActive(serverActor.speed_boosting);
                    }
                }
            }
        });
    }

    function handle_msg_captured_player(msg) {
        if (!gameStart) return;

        var targetPlayerId = msg.targetPlayerId;

        console.log("YOU CAPTURED PLAYER! ", targetPlayerId);
        var targetPlayer = ZOR.Game.players[targetPlayerId];
        handleSuccessfulPlayerCapture(targetPlayer);
        removePlayerFromGame(targetPlayerId);
    }

    function handle_msg_you_died(msg) {
        if (!gameStart) return;

        var targetPlayer = msg.targetPlayer;
        var attackingPlayerId = msg.attackingPlayerId;
        var timeAlive = Math.floor((targetPlayer.deathTime - targetPlayer.spawnTime) / 1000);

        console.log("YOU DIED! You were alive for " + timeAlive + " seconds. Killed by: ", attackingPlayerId);
        setDeadState();

        var attackingPlayer = zorbioModel.getPlayerById(attackingPlayerId);
        attackingPlayer.score = config.PLAYER_GET_SCORE(attackingPlayer.sphere.scale);
        targetPlayer.drainAmount = config.PLAYER_GET_SCORE(targetPlayer.drainAmount);

        ZOR.UI.engine.set('attacker', attackingPlayer);
        ZOR.UI.engine.set('player', targetPlayer);
        ZOR.UI.state( ZOR.UI.STATES.RESPAWN_SCREEN );
    }

    function handle_msg_player_died(msg) {
        var attackingPlayerId = msg.attackingPlayerId;
        var targetPlayerId = msg.targetPlayerId;

        if (!player || (attackingPlayerId !== player.getPlayerId())) {
            // someone else killed another player, lets remove it
            console.log("Player died:  ", targetPlayerId);
            removePlayerFromGame(targetPlayerId);
        }
    }

    function handle_msg_food_captured(msg) {
        if (foodController && foodController.isInitialized()) {
            foodController.hideFood( msg.fi );
        }
    }

    function handle_msg_server_tick_slow(msg) {
        if (!gameStart) return;
        handleServerTick(msg.serverTickData);
    }

    function handle_msg_kick(msg) {
        console.log('Server said: ', msg.reason);
        setDeadState();
        handlePlayerKick(msg.reason);
    }

    function handle_msg_remove_player(msg) {
        console.log("received remove_player", msg.playerId);
        removePlayerFromGame(msg.playerId);
    }

    function handle_msg_speeding_warning() {
        if (!gameStart) return;
        console.log("WARNING! You are speeding!");
    }

    function handle_msg_speed_boost_res(msg) {
        console.log("speed boost is valid:", msg.is_valid);
        player.speedBoostStart();
    }

    function handle_msg_speed_boost_stop() {
        console.log("Received speed boost STOP");
        player.speedBoostStop();
        sendSpeedBoostStop();
    }
}

function handleNetworkTermination() {
    setTimeout(location.reload.bind(location), 500);
}

function sendRespawn() {
    gameStart = false;
    ws.send(JSON.stringify({op: 'respawn'}));
}

function sendPing() {
    zorPingStart = Date.now();

    // Send ping to track latency, client heartbeat, and fps
    var fps = Math.round(ZOR.LagScale.get_fps());
    ws.send(JSON.stringify({op: 'zor_ping', lastPing: zorPingDuration, fps: fps}));
}

function setIntervalMethods() {
    // start sending heartbeat
    interval_id_heartbeat = window.setInterval(sendPing, config.HEARTBEAT_PULSE_INTERVAL);
}

function sendPlayerUpdate() {
    // save metrics
    var nowTime = Date.now();
    var gap = nowTime - player.model.pp_send_metric.last_time;
    player.model.pp_send_metric.last_time = nowTime;
    var bufferedAmount = ws.bufferedAmount;

    // Make sure model is synced with view
    player.refreshSphereModel();

    var sphereModel = player.model.sphere;

    // make sure we always have at least 4 recent positions
    while (sphereModel.recentPositions.length < 4) {
        player.addRecentPosition();
    }

    // Send oldest position and most recent 4 positions
    var playerUpdateMessage = {
        0: ZOR.Schemas.ops.PLAYER_UPDATE,
        player_id: player.getPlayerId(),
        sphere_id: sphereModel.id,
        pp_gap: gap,
        au_gap: actorUpdateGap,
        buffered_mount: bufferedAmount,
        latest_position: sphereModel.recentPositions[sphereModel.recentPositions.length - 1],
        prev_position_1: sphereModel.recentPositions[sphereModel.recentPositions.length - 2],
        prev_position_2: sphereModel.recentPositions[sphereModel.recentPositions.length - 3],
        prev_position_3: sphereModel.recentPositions[sphereModel.recentPositions.length - 4],
        oldest_position: sphereModel.recentPositions[0],
        food_capture_queue: player.food_capture_queue,
    };

    var buffer = ZOR.Schemas.playerUdateSchema.encode(playerUpdateMessage);

    // clear food queue
    player.food_capture_queue = [];

    // Send player update data
    ws.send(buffer);
}

function sendSpeedBoostStart() {
    ws.send(JSON.stringify({op: "speed_boost_start"}));
}

function sendSpeedBoostStop() {
    ws.send(JSON.stringify({op: "speed_boost_stop"}));
}

var throttledSendPlayerUpdate = _.throttle(sendPlayerUpdate, config.TICK_FAST_INTERVAL);


function clearIntervalMethods() {
    window.clearInterval(interval_id_heartbeat);
}
