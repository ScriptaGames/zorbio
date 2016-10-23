var ZOR = ZOR || {};

ZOR.MessageHandler = {};

ZOR.MessageHandler.z_handle_init_game = function handleInitGame(model) {
    _.assign(zorbioModel, model);

    ZOR.UI.on('init', createScene);

    console.log('Game initialzed');
};

ZOR.MessageHandler.z_handle_welcome = function handleWelcome(msg) {
    // Create the first person player
    player = new ZOR.PlayerController(msg.player, null, true);

    console.log('handle welcome');

    return player.model;
};

ZOR.MessageHandler.z_handle_game_setup = function handleGameSetup() {
    // add player to players
    ZOR.Game.players[player.getPlayerId()] = player;  // Player controller reference
    zorbioModel.addPlayer(player.model, true);        // Player model

    // add player to scene and reset camera
    initCameraAndPlayer();

    gameStart = true;

    console.log('Game started!');
};

ZOR.MessageHandler.z_handle_send_ping = function handleSendPing() {
    // Send ping to track latency, client heartbeat, and fps
    var fps = Math.round(ZOR.LagScale.get_fps());

    player.model.fps_metric.add(fps);

    return fps;
};

ZOR.MessageHandler.z_handle_pong = function handlePong(duration) {
    player.model.ping_metric.add(duration);

    console.log('Ping: ' + duration + 'ms, FPS: ' + ZOR.LagScale.get_fps());
};

ZOR.MessageHandler.z_handleNetworkTermination = function handleNetworkTermination() {
    console.log('Connection terminated');
    setTimeout(location.reload.bind(location), 500);
};


