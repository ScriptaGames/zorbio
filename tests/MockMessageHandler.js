var ZOR = {};

ZOR.MessageHandler = {};

ZOR.MessageHandler.z_handle_init_game = function handleInitGame() {
    console.log('Game initialzed');
};

ZOR.MessageHandler.z_handle_welcome = function handleWelcome(msg) {
    console.log('handle welcome');
};


module.exports = ZOR.MessageHandler;
