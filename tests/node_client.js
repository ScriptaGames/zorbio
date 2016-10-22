var ZORClient = require('../common/Client.js');
var Zorbio    = require('../common/zorbio.js');
var handler   = require('./MockMessageHandler');

var model = new Zorbio.Model();

console.log("Starting headless zorbio node client...");

var zorClient = new ZORClient(model, handler);

var playerMeta = {
    colorCode: 3,
    colorHex: "#7135e5",
    key: "mathisfreedom",
    playerName: "test2",
    playerType: "PLAYER",
    skin: "default",
};

zorClient.z_connectToServer('ws://localhost:31000');

zorClient.z_sendEnterGame(playerMeta);


