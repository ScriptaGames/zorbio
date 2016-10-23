var ZOR = ZOR || {};

ZOR.ZORMessageHandler = {};

ZOR.ZORMessageHandler.z_handle_init_game = function ZORhandleInitGame(model) {
    _.assign(zorbioModel, model);

    ZOR.UI.on('init', createScene);

    console.log('Game initialzed');
};

ZOR.ZORMessageHandler.z_handle_welcome = function ZORhandleWelcome(msg) {
    // Create the first person player
    player = new ZOR.PlayerController(msg.player, null, true);

    console.log('handle welcome');

    return player.model;
};

ZOR.ZORMessageHandler.z_handle_game_setup = function ZORhandleGameSetup() {
    // add player to players
    ZOR.Game.players[player.getPlayerId()] = player;  // Player controller reference
    zorbioModel.addPlayer(player.model, true);        // Player model

    // add player to scene and reset camera
    initCameraAndPlayer();

    gameStart = true;

    console.log('Game started!');
};

/**
 * Returns the players current fps for sending to server
 * @returns {number}
 */
ZOR.ZORMessageHandler.z_handle_send_ping = function ZORhandleSendPing() {
    // Send ping to track latency, client heartbeat, and fps
    var fps = Math.round(ZOR.LagScale.get_fps());

    player.model.fps_metric.add(fps);

    return fps;
};

ZOR.ZORMessageHandler.z_handle_pong = function ZORhandlePong(duration) {
    player.model.ping_metric.add(duration);

    console.log('Ping: ' + duration + 'ms, FPS: ' + Math.floor(ZOR.LagScale.get_fps()));
};

ZOR.ZORMessageHandler.z_handleNetworkTermination = function ZORhandleNetworkTermination() {
    console.log('Connection terminated');
    setTimeout(location.reload.bind(location), 500);
};

ZOR.ZORMessageHandler.z_handle_actor_updates = function ZORhandleActorUpdates(actors) {
    actors.forEach(function updateEachActor(serverActor) {
        var clientActor = zorbioModel.getActorById(serverActor.id);

        if (clientActor) {
            clientActor.position.copy(serverActor.position);
            clientActor.scale = serverActor.scale;

            if (clientActor.type === ZOR.ActorTypes.PLAYER_SPHERE) {
                clientActor.drain_target_id = serverActor.drain_target_id;
                var playerController = ZOR.Game.players[clientActor.playerId];
                if (playerController) {
                    playerController.setSpeedBoostActive(serverActor.speed_boosting);
                }
            }
        }
    });
};

ZOR.ZORMessageHandler.z_handle_player_join = function ZORhandlePlayerJoin(newPlayer) {
    //Add new player if it's already added
    if (!ZOR.Game.players[newPlayer.id]) {
        // Create new player controller and add to player controllers array
        ZOR.Game.players[newPlayer.id] = new ZOR.PlayerController(newPlayer, scene);
        ZOR.Game.players[newPlayer.id].setAlpha(1);
    }

    //Keep model in sync with the server
    zorbioModel.addPlayer(newPlayer);

    console.log('Player joined: ', newPlayer.id, newPlayer.name);
};



