var ZOR = ZOR || {};

ZOR.MessageHandler = {};

ZOR.MessageHandler.z_handle_init_game = function handleInitGame() {
    ZOR.UI.on('init', createScene);
    console.log('Game initialzed');
};

ZOR.MessageHandler.z_handle_welcome = function handleWelcome(msg) {

    // Create the first person player
    player = new ZOR.PlayerController(msg.player, null, true);

    console.log('handle welcome');
};

