var ZOR = {};

var Zorbio = require('../common/zorbio.js');

ZOR.MessageHandler = {};

ZOR.MessageHandler.z_handle_init_game = function handleInitGame() {
    console.log('Game initialzed');
};

ZOR.MessageHandler.z_handle_welcome = function handleWelcome(msg) {
    var model = msg.player;
    global.player = new Zorbio.Player(model.id, model.name, model.sphere.color, model.type, model.sphere.position,
        model.sphere.scale, model.sphere.velocity, model.sphere.skin);
    console.log('handle welcome');
};

ZOR.MessageHandler.z_handle_game_setup = function handleGameSetup() {
    global.zorbioModel.addActor(global.player.sphere);
    global.players[global.player.id] = global.player;
    console.log('Game Started!');
};

ZOR.MessageHandler.z_handle_send_ping = function handleSendPing() {
    return 60;  // FPS
};

ZOR.MessageHandler.z_handle_pong = function handlePong(duration) {
    global.player.ping_metric.add(duration);
    console.log("Ping: ", duration);
};

ZOR.MessageHandler.z_handleNetworkTermination = function handleNetworkTermination() {
    console.log('Connection terminated');
};

module.exports = ZOR.MessageHandler;
