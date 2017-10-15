/**
 * Zorbio Game Client
 */

// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global UTIL:true
global gameStart:true
*/

const NODEJS_CLIENT = typeof module !== 'undefined' && module.exports;

if (NODEJS_CLIENT) {
    global._ = require('lodash');
    global.UTIL = require('./util.js');
    global.config = require('./config.js');
    global.WebSocket = require('ws');
    ZOR.Schemas = require('./schemas');
}

/**
 * Zorbio game client can be used in a browser or headless
 * @param {Object} handler
 * @constructor
 */
ZOR.ZORClient = function ZORclient(handler) {
    this.z_zorPingDuration = -1;
    this.z_actorUpdateGap = 0;
    this.z_handler = handler;
    this.z_rapidSendBuffer = new ArrayBuffer(20);
    this.z_rapidSendView = new Float32Array(this.z_rapidSendBuffer);
};

/**
 * Connect to the game server based on config
 * @param {string} uri
 */
ZOR.ZORClient.prototype.z_connectToServer = function ZORconnectToServer(uri) {
    let self = this;

    this.z_ws = new WebSocket( uri );
    this.z_ws.binaryType = 'arraybuffer';

    this.z_ws.onopen = function wsOpen() {
        console.log('WebSocket connection established and ready.');
        self.z_setupSocket(self.z_ws);
    };
};

/**
 * Send message to enter the game.  This is the function that sends all the initial player
 * Meta data, like name, skin, etc.
 * @param {Object} meta
 */
ZOR.ZORClient.prototype.z_sendEnterGame = function ZORsendEnterGame(meta) {
    if (this.z_ws.readyState === WebSocket.OPEN) {
        this.z_ws.send(JSON.stringify({
            op   : 'enter_game',
            type : meta.playerType,
            name : meta.playerName,
            color: meta.color,
            skin : meta.skin,
            key  : meta.key
        }));

        console.log('Send enter game');
    }
};

/**
 * Sets up all the message and event handlers for the socket.
 * @param {Object} ws
 */
ZOR.ZORClient.prototype.z_setupSocket = function ZORsetupSocket(ws) {
    let self = this;

    ws.onmessage = function wsMessage(msg) {
        if (typeof msg.data === 'string') {
            let message = parseJson(msg.data);

            switch (message.op) {
                case 'game_setup':
                    handle_msg_game_setup();
                    break;
                case 'zor_pong':
                    handle_msg_zor_pong();
                    break;
                case 'player_join':
                    handle_msg_player_join(message);
                    break;
                case 'captured_player':
                    handle_msg_captured_player(message);
                    break;
                case 'player_died':
                    handle_msg_player_died(message);
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
            let op = UTIL.readFirstByte(msg.data);

            switch (op) {
                case ZOR.Schemas.ops.INIT_GAME:
                    handle_msg_init_game(ZOR.Schemas.initGameSchema.decode(msg.data));
                    break;
                case ZOR.Schemas.ops.WELCOME:
                    handle_msg_welcome(ZOR.Schemas.welcomeSchema.decode(msg.data));
                    break;
                case ZOR.Schemas.ops.ACTOR_UPDATES:
                    handle_msg_actor_updates(ZOR.Schemas.actorUpdatesSchema.decode(msg.data));
                    break;
                case ZOR.Schemas.ops.TICK_SLOW:
                    handle_msg_server_tick_slow(ZOR.Schemas.tickSlowSchema.decode(msg.data));
                    break;
                case ZOR.Schemas.ops.YOU_DIED:
                    handle_msg_you_died(ZOR.Schemas.youDied.decode(msg.data));
                    break;
                case ZOR.Schemas.ops.LEADERBOARDS_UPDATE:
                    handle_msg_leaderboard_update(ZOR.Schemas.leaderboardUpdateSchema.decode(msg.data));
                    break;
                default: {
                    // // see if this is a player fast update
                    const msgView = new Float32Array(msg.data);
                    if (msgView[0] === ZOR.Schemas.ops.CLIENT_POSITION_RAPID) {
                        handle_msg_client_position_rapid(msgView);
                    }
                    else {
                        console.error('Error: Unknown binary op code: ', op);
                    }
                }
            }
        }
    };

    ws.onclose = function wsClose(e) {
        if (e.code != config.CLOSE_NO_RESTART) {
            self.z_handleNetworkTermination();
        }
        console.log('Connection closed:', e.code, e.reason);
    };

    ws.onerror = function wsError(e) {
        console.error('Websocket error occured', e);
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

        self.z_NB_SRVID = msg.NB_SRVID;  // Linode nodebalancer node id that handled this socket connection

        self.z_handler.z_handle_init_game(msg.model);
    }

    function handle_msg_welcome(msg) {
        console.log('Welcome: ', msg.player.name);

        self.z_playerModel = self.z_handler.z_handle_welcome(msg);

        ws.send(JSON.stringify({op: 'player_ready'}));
    }

    function handle_msg_game_setup() {
        console.log('Game setup');
        self.z_handler.z_handle_game_setup();
        self.z_setIntervalMethods();
    }

    function handle_msg_player_join(message) {
        let newPlayer = message.player;

        if (self.z_playerModel && (newPlayer.id === self.z_playerModel.id)) {
            return; // ignore own join message
        }

        // Initialize THREE objects
        UTIL.toVector3(newPlayer.sphere, 'position');
        UTIL.toVector3(newPlayer.sphere, 'velocity');

        self.z_handler.z_handle_player_join(newPlayer);
    }

    function handle_msg_zor_pong() {
        self.z_zorPingDuration = Date.now() - self.z_zorPingStart;

        self.z_handler.z_handle_pong(self.z_zorPingDuration);
    }

    function handle_msg_client_position_rapid(messageView) {
        self.z_handler.z_handle_client_position_rapid(messageView);
    }

    function handle_msg_actor_updates(msg) {
        if (self.z_playerModel) {
            // Record gap since last actor update was received
            let nowTime = Date.now();
            self.z_actorUpdateGap = nowTime - self.z_playerModel.au_receive_metric.last_time;
            self.z_playerModel.au_receive_metric.last_time = nowTime;
        }

        self.z_handler.z_handle_actor_updates(msg.actors);
    }

    function handle_msg_captured_player(msg) {
        self.z_handler.z_handle_captured_player(msg.targetPlayerId);
    }

    function handle_msg_you_died(msg) {
        self.z_handler.z_handle_you_died(msg);
        self.z_clearIntervalMethods();
    }

    function handle_msg_leaderboard_update(msg) {
        self.z_handler.z_handle_leaderboard_update(msg);
    }

    function handle_msg_player_died(msg) {
        let attackingPlayerId = msg.attackingPlayerId;
        let targetPlayerId = msg.targetPlayerId;

        if (!self.z_playerModel || (attackingPlayerId !== self.z_playerModel.id)) {
            // someone else killed another player
            self.z_handler.z_handle_player_died(targetPlayerId);
        }
    }

    function handle_msg_server_tick_slow(msg) {
        if (!gameStart) return;

        self.z_handler.z_handle_server_tick(msg.tick_data);
    }

    function handle_msg_kick(msg) {
        self.z_handler.z_handle_kick(msg.reason);
    }

    function handle_msg_remove_player(msg) {
        self.z_handler.z_handle_remove_player(msg.playerId);
    }

    function handle_msg_speeding_warning() {
        console.log('WARNING! You are speeding!');
    }

    function handle_msg_speed_boost_res(msg) {
        self.z_handler.handle_speed_boost_res(msg.is_valid);
    }

    function handle_msg_speed_boost_stop() {
        console.log('Received speed boost STOP');
        self.z_handler.z_handle_speed_boost_stop();
        self.z_sendSpeedBoostStop();
    }
};

ZOR.ZORClient.prototype.z_handleNetworkTermination = function ZORhandleNetworkTermination() {
    this.z_clearIntervalMethods();
    this.z_handler.z_handleNetworkTermination();
};

ZOR.ZORClient.prototype.z_sendRespawn = function ZORsendRespawn() {
    gameStart = false;
    this.z_ws.send(JSON.stringify({op: 'respawn'}));
};

ZOR.ZORClient.prototype.z_sendPing = function sendPing() {
    this.z_zorPingStart = Date.now();

    let fps = this.z_handler.z_handle_send_ping();

    this.z_ws.send(JSON.stringify({op: 'zor_ping', lastPing: this.z_zorPingDuration, fps: fps}));
};


ZOR.ZORClient.prototype.z_setIntervalMethods = function ZORsetIntervalMethods() {
    let self = this;

    // start sending heartbeat
    self.z_interval_id_heartbeat = setInterval(function sendPing() {
        self.z_sendPing();
    }, config.HEARTBEAT_PULSE_INTERVAL);
};



ZOR.ZORClient.prototype.z_sendPlayerUpdate = function ZORsendPlayerUpdate(playerSphere, food_capture_queue) {
    // save metrics
    let nowTime = Date.now();
    let gap = nowTime - this.z_playerModel.pp_send_metric.last_time;
    this.z_playerModel.pp_send_metric.last_time = nowTime;
    let bufferedAmount = this.z_ws.bufferedAmount;

    // Send oldest position and most recent 4 positions
    let playerUpdateMessage = {
        0                 : ZOR.Schemas.ops.PLAYER_UPDATE,
        player_id         : this.z_playerModel.id,
        sphere_id         : playerSphere.id,
        pp_gap            : gap,
        au_gap            : this.z_actorUpdateGap,
        buffered_mount    : bufferedAmount,
        latest_position   : playerSphere.recentPositions[playerSphere.recentPositions.length - 1],
        prev_position_1   : playerSphere.recentPositions[playerSphere.recentPositions.length - 2],
        prev_position_2   : playerSphere.recentPositions[playerSphere.recentPositions.length - 3],
        prev_position_3   : playerSphere.recentPositions[playerSphere.recentPositions.length - 4],
        oldest_position   : playerSphere.recentPositions[0],
        food_capture_queue: food_capture_queue,
    };

    // Send player update data
    this.z_ws.send(ZOR.Schemas.playerUdateSchema.encode(playerUpdateMessage));
};

ZOR.ZORClient.prototype.z_sendClientPositionRapid = function ZORsendClientPositionRapid(actor_id, position) {
    if (!config.ENABLE_RAPID_UPDATES) return;

    // first byte op code
    this.z_rapidSendView[0] = ZOR.Schemas.ops.CLIENT_POSITION_RAPID;

    // actor id
    this.z_rapidSendView[1] = actor_id;

    // position
    this.z_rapidSendView[2] = position.x;
    this.z_rapidSendView[3] = position.y;
    this.z_rapidSendView[4] = position.z;

    this.z_ws.send(this.z_rapidSendBuffer);
};

ZOR.ZORClient.prototype.z_sendSpeedBoostStart = function ZORsendSpeedBoostStart() {
    this.z_ws.send(JSON.stringify({op: 'speed_boost_start'}));
};

ZOR.ZORClient.prototype.z_sendSpeedBoostStop = function ZORsendSpeedBoostStop() {
    this.z_ws.send(JSON.stringify({op: 'speed_boost_stop'}));
};

/**
 * Request the leaderboards from the server.
 */
ZOR.ZORClient.prototype.z_sendLeaderboardsRequest = function ZORsendLeaderboardsRequest() {
    let msg = {
        0: ZOR.Schemas.ops.LEADERBOARDS_REQUEST,
    };

    this.z_ws.send(ZOR.Schemas.leaderboardRequestSchema.encode(msg));
};

ZOR.ZORClient.prototype.z_clearIntervalMethods = function ZORclearIntervalMethods() {
    clearInterval(this.z_interval_id_heartbeat);
};

if (NODEJS_CLIENT) module.exports = ZOR.ZORClient;
