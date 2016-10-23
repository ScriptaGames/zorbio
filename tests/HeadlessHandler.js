var ZOR = {};

var Zorbio = require('../common/zorbio.js');

ZOR.ZORMessageHandler = {};

ZOR.ZORMessageHandler.z_handle_init_game = function ZORhandleInitGame(model) {
    _.assign(global.zorbioModel, model);

    console.log('Game initialzed');
};

ZOR.ZORMessageHandler.z_handle_welcome = function ZORhandleWelcome(msg) {
    var model = msg.player;

    global.player = new Zorbio.Player(model.id, model.name, model.sphere.color, model.type, model.sphere.position,
        model.sphere.scale, model.sphere.velocity, model.sphere.skin);

    console.log('handle welcome');

    return global.player;
};

ZOR.ZORMessageHandler.z_handle_game_setup = function ZORhandleGameSetup() {
    global.zorbioModel.addPlayer(global.player);
    console.log('Game Started!');
};

/**
 * @returns {number}
 */
ZOR.ZORMessageHandler.z_handle_send_ping = function ZORhandleSendPing() {
    return 60;  // FPS
};

ZOR.ZORMessageHandler.z_handle_pong = function ZORhandlePong(duration) {
    global.player.ping_metric.add(duration);
    console.log("Ping: ", duration);
};

ZOR.ZORMessageHandler.z_handleNetworkTermination = function ZORhandleNetworkTermination() {
    console.log('Connection terminated');
};

ZOR.ZORMessageHandler.z_handle_actor_updates = function ZORhandleActorUpdates(actors) {
    // Headless don't really care about updating other players positions or size
};

ZOR.ZORMessageHandler.z_handle_player_join = function ZORhandlePlayerJoin(newPlayer) {
    global.zorbioModel.addPlayer(newPlayer);

    console.log('Player joined: ', newPlayer.id, newPlayer.name);
};

module.exports = ZOR.ZORMessageHandler;
