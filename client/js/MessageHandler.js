var ZOR = ZOR || {};

ZOR.MessageHandler = {};

ZOR.MessageHandler.z_handle_init_game = function handleInitGame() {
    ZOR.UI.on('init', createScene);
    console.log('Game initialzed');
};
