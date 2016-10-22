/**
 * Zorbio Game Client
 */
var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

if (NODEJS) {
    global._ = require('lodash');
    global.UTIL = require('./util.js');
    global.config = require('./config.js');
    global.WebSocket = require('ws');
    ZOR.Schemas = require('./schemas');
}

/**
 * Zorbio game client can be used in a browser or headless
 * @param model
 * @param handler
 * @constructor
 */
ZOR.ZORClient = function ZORclient(model, handler) {
    this.z_ws = null;
    this.z_zorPingStart = 0;
    this.z_zorPingDuration = 0;
    this.z_actorUpdateGap = 0;
    this.z_NB_SRVID = '';
    this.z_model = model;
    this.z_handler = handler;

    // handles to setInterval methods so we can clear them later
    this.z_interval_id_heartbeat = null;
};

/**
 * Connect to the game server based on config
 */
ZOR.ZORClient.prototype.z_connectToServer = function ZORconnectToServer(uri) {
    var self = this;

    this.z_ws = new WebSocket( uri );
    this.z_ws.binaryType = 'arraybuffer';

    this.z_ws.onopen = function wsOpen () {
        console.log("WebSocket connection established and ready.");
        self.z_setupSocket(self.z_ws);
    };
};

/**
 * Send message to enter the game.  This is the function that sends all the initial player
 * Meta data, like name, skin, etc.
 * @param meta
 */
ZOR.ZORClient.prototype.z_sendEnterGame = function ZORsendEnterGame(meta) {
    if (this.z_ws.readyState === WebSocket.OPEN) {
        this.z_ws.send(JSON.stringify({
            op: 'enter_game',
            type: meta.playerType,
            name: meta.playerName,
            color: meta.color, skin:
            meta.skinName,
            key: meta.key
        }));

        console.log("Send enter game");
    }
};

/**
 * Sets up all the message and event handlers for the socket.
 * @param ws
 */
ZOR.ZORClient.prototype.z_setupSocket = function ZORsetupSocket(ws) {
    var self = this;

    ws.onmessage = function wsMessage(msg) {
        if (typeof msg.data === "string") {
            var message = parseJson(msg.data);

            // switch (message.op) {
            //     case 'game_setup':
            //         handle_msg_game_setup();
            //         break;
            //     case 'player_join':
            //         handle_msg_player_join(message);
            //         break;
            //     case 'zor_pong':
            //         handle_msg_zor_pong();
            //         break;
            //     case 'captured_player':
            //         handle_msg_captured_player(message);
            //         break;
            //     case 'player_died':
            //         handle_msg_player_died(message);
            //         break;
            //     case 'kick':
            //         handle_msg_kick(message);
            //         break;
            //     case 'remove_player':
            //         handle_msg_remove_player(message);
            //         break;
            //     case 'speeding_warning':
            //         handle_msg_speeding_warning();
            //         break;
            //     case 'speed_boost_res':
            //         handle_msg_speed_boost_res(message);
            //         break;
            //     case 'speed_boost_stop':
            //         handle_msg_speed_boost_stop();
            //         break;
            // }
        }
        else {
            var op = UTIL.readFirstByte(msg.data);

            switch (op) {
                case ZOR.Schemas.ops.INIT_GAME:
                    handle_msg_init_game( ZOR.Schemas.initGameSchema.decode(msg.data) );
                    break;
                // case ZOR.Schemas.ops.ACTOR_UPDATES:
                //     handle_msg_actor_updates( ZOR.Schemas.actorUpdatesSchema.decode(msg.data) );
                //     break;
                // case ZOR.Schemas.ops.TICK_SLOW:
                //     handle_msg_server_tick_slow( ZOR.Schemas.tickSlowSchema.decode(msg.data) );
                //     break;
                // case ZOR.Schemas.ops.YOU_DIED:
                //     handle_msg_you_died( ZOR.Schemas.youDied.decode(msg.data) );
                //     break;
                // case ZOR.Schemas.ops.WELCOME:
                //     handle_msg_welcome( ZOR.Schemas.welcomeSchema.decode(msg.data) );
                //     break;
                // default:
                //     // // see if this is a player fast update
                //     var msgView = new Float32Array(msg.data);
                //     if (msgView[0] === ZOR.Schemas.ops.CLIENT_POSITION_RAPID) {
                //         handle_msg_client_position_rapid(msgView);
                //     }
                //     else {
                //         console.error("Error: Unknown binary op code: ", op);
                //     }
            }
        }
    };

    ws.onclose = function wsClose(e) {
        if (e.code != config.CLOSE_NO_RESTART) {
            handleNetworkTermination();
        }
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

        self.NB_SRVID = msg.NB_SRVID;  // Linode nodebalancer node id that handled this socket connection

        _.assign(self.z_model, msg.model);

        self.z_handler.z_handle_init_game();
    }
    //
    // function handle_msg_welcome(msg) {
    //     console.log("Welcome: ", msg.player.name);
    //     player = new ZOR.PlayerController(msg.player, null, true);
    //     ws.send(JSON.stringify({op: 'player_ready'}));
    // }
    //
    // function handle_msg_game_setup() {
    //     // add player to players and actors
    //     ZOR.Game.players[player.getPlayerId()] = player;
    //     zorbioModel.addActor(player.model.sphere);
    //
    //     // add player to scene and reset camera
    //     initCameraAndPlayer();
    //
    //     gameStart = true;
    //
    //     setIntervalMethods();
    //
    //     console.log('Game started!');
    // }
    //
    // function handle_msg_player_join(message) {
    //     var newPlayer = message.player;
    //
    //     if (player && (newPlayer.id === player.getPlayerId())) {
    //         return; // ignore own join message
    //     }
    //
    //     //Add new player if it's already added
    //     if (!ZOR.Game.players[newPlayer.id]) {
    //         ZOR.Game.players[newPlayer.id] = new ZOR.PlayerController(newPlayer, scene);
    //         ZOR.Game.players[newPlayer.id].setAlpha(1);
    //
    //         //Initialize THREE objects
    //         UTIL.toVector3(newPlayer.sphere, 'position');
    //         UTIL.toVector3(newPlayer.sphere, 'velocity');
    //
    //         //Keep model in sync with the server
    //         zorbioModel.players.push(newPlayer);
    //         zorbioModel.addActor(newPlayer.sphere);
    //     }
    //
    //     console.log('Player joined: ', newPlayer.id, newPlayer.name);
    // }
    //
    // function handle_msg_zor_pong() {
    //     zorPingDuration = Date.now() - zorPingStart;
    //     player.model.ping_metric.add(zorPingDuration);
    //     console.log('Ping: ' + zorPingDuration + 'ms, FPS: ' + ZOR.LagScale.get_fps());
    // }
    //
    // function handle_msg_client_position_rapid(messageView) {
    //     //TODO: cache getActorById() for speed so we don't have to search each time
    //     var clientActor = zorbioModel.getActorById(messageView[1]);
    //
    //     if (clientActor) {
    //         clientActor.position.set(messageView[2], messageView[3], messageView[4]);
    //     }
    // }
    //
    // function handle_msg_actor_updates(msg) {
    //     if (player) {
    //         // Record gap since last actor update was received
    //         var nowTime = Date.now();
    //         actorUpdateGap = nowTime - player.model.au_receive_metric.last_time;
    //         player.model.au_receive_metric.last_time = nowTime;
    //     }
    //
    //     msg.actors.forEach(function updateEachActor(serverActor) {
    //         var clientActor = zorbioModel.getActorById(serverActor.id);
    //
    //         if (clientActor) {
    //             clientActor.position.copy(serverActor.position);
    //             clientActor.scale = serverActor.scale;
    //
    //             if (clientActor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
    //                 clientActor.drain_target_id = serverActor.drain_target_id;
    //                 var playerController = ZOR.Game.players[clientActor.playerId];
    //                 if (playerController) {
    //                     playerController.setSpeedBoostActive(serverActor.speed_boosting);
    //                 }
    //             }
    //         }
    //     });
    // }
    //
    // function handle_msg_captured_player(msg) {
    //     if (!gameStart) return;
    //
    //     var targetPlayerId = msg.targetPlayerId;
    //
    //     console.log("YOU CAPTURED PLAYER! ", targetPlayerId);
    //
    //     handleSuccessfulPlayerCapture(targetPlayerId);
    // }
    //
    // function handle_msg_you_died(msg) {
    //     if (!gameStart) return;
    //
    //     handleDeath(msg);
    // }
    //
    // function handle_msg_player_died(msg) {
    //     var attackingPlayerId = msg.attackingPlayerId;
    //     var targetPlayerId = msg.targetPlayerId;
    //
    //     if (!player || (attackingPlayerId !== player.getPlayerId())) {
    //         // someone else killed another player
    //         handleOtherPlayercapture(targetPlayerId);
    //     }
    // }
    //
    // function handle_msg_server_tick_slow(msg) {
    //     if (!gameStart) return;
    //
    //     handleServerTick(msg.tick_data);
    // }
    //
    // function handle_msg_kick(msg) {
    //     console.log('Server said: ', msg.reason);
    //     setDeadState();
    //     handlePlayerKick(msg.reason);
    // }
    //
    // function handle_msg_remove_player(msg) {
    //     console.log("received remove_player", msg.playerId);
    //     removePlayerFromGame(msg.playerId, 0);
    // }
    //
    // function handle_msg_speeding_warning() {
    //     if (!gameStart) return;
    //     console.log("WARNING! You are speeding!");
    // }
    //
    // function handle_msg_speed_boost_res(msg) {
    //     console.log("speed boost is valid:", msg.is_valid);
    //     player.speedBoostStart();
    // }
    //
    // function handle_msg_speed_boost_stop() {
    //     console.log("Received speed boost STOP");
    //     player.speedBoostStop();
    //     sendSpeedBoostStop();
    // }
};

// function handleNetworkTermination() {
//     setTimeout(location.reload.bind(location), 500);
// }
//
// function sendRespawn() {
//     gameStart = false;
//     ws.send(JSON.stringify({op: 'respawn'}));
// }
//
// function sendPing() {
//     zorPingStart = Date.now();
//
//     // Send ping to track latency, client heartbeat, and fps
//     var fps = Math.round(ZOR.LagScale.get_fps());
//     player.model.fps_metric.add(fps);
//     ws.send(JSON.stringify({op: 'zor_ping', lastPing: zorPingDuration, fps: fps}));
// }
//
// function setIntervalMethods() {
//     // start sending heartbeat
//     interval_id_heartbeat = window.setInterval(sendPing, config.HEARTBEAT_PULSE_INTERVAL);
// }
//
// function sendPlayerUpdate() {
//     // save metrics
//     var nowTime = Date.now();
//     var gap = nowTime - player.model.pp_send_metric.last_time;
//     player.model.pp_send_metric.last_time = nowTime;
//     var bufferedAmount = ws.bufferedAmount;
//
//     // Make sure model is synced with view
//     player.refreshSphereModel();
//
//     var sphereModel = player.model.sphere;
//
//     // make sure we always have at least 4 recent positions
//     while (sphereModel.recentPositions.length < 4) {
//         player.addRecentPosition();
//     }
//
//     // Send oldest position and most recent 4 positions
//     var playerUpdateMessage = {
//         0: ZOR.Schemas.ops.PLAYER_UPDATE,
//         player_id: player.getPlayerId(),
//         sphere_id: sphereModel.id,
//         pp_gap: gap,
//         au_gap: actorUpdateGap,
//         buffered_mount: bufferedAmount,
//         latest_position: sphereModel.recentPositions[sphereModel.recentPositions.length - 1],
//         prev_position_1: sphereModel.recentPositions[sphereModel.recentPositions.length - 2],
//         prev_position_2: sphereModel.recentPositions[sphereModel.recentPositions.length - 3],
//         prev_position_3: sphereModel.recentPositions[sphereModel.recentPositions.length - 4],
//         oldest_position: sphereModel.recentPositions[0],
//         food_capture_queue: player.food_capture_queue,
//     };
//
//     var buffer = ZOR.Schemas.playerUdateSchema.encode(playerUpdateMessage);
//
//     // clear food queue
//     player.food_capture_queue = [];
//
//     // Send player update data
//     ws.send(buffer);
// }
//
// var rapidSendBuffer = new ArrayBuffer(20);
// var rapidSendView = new Float32Array(rapidSendBuffer);
// function sendClientPositionRapid(actor_id, position) {
//     if (!config.ENABLE_RAPID_UPDATES) return;
//
//     //first byte op code
//     rapidSendView[0] = ZOR.Schemas.ops.CLIENT_POSITION_RAPID;
//
//     // actor id
//     rapidSendView[1] = actor_id;
//
//     // position
//     rapidSendView[2] = position.x;
//     rapidSendView[3] = position.y;
//     rapidSendView[4] = position.z;
//
//     ws.send(rapidSendBuffer);
// }
//
// function sendSpeedBoostStart() {
//     ws.send(JSON.stringify({op: "speed_boost_start"}));
// }
//
// function sendSpeedBoostStop() {
//     ws.send(JSON.stringify({op: "speed_boost_stop"}));
// }
// var throttledSendPlayerUpdate = _.throttle(sendPlayerUpdate, config.TICK_FAST_INTERVAL);
//
//
// function clearIntervalMethods() {
//     window.clearInterval(interval_id_heartbeat);
// }


if (NODEJS) module.exports = ZOR.ZORClient;
