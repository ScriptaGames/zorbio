global.player = null;
global.players = [];

var ZORClient = require('../common/Client.js');
var Zorbio    = require('../common/zorbio.js');
var handler   = require('./HeadlessMessageHandler');

global.zorbioModel = new Zorbio.Model();

console.log("Starting headless zorbio node client...");

var zorClient = new ZORClient(global.zorbioModel, handler);

var playerMeta = {
    color: 3,
    key: "mathisfreedom",
    playerName: "test2",
    playerType: "PLAYER",
    skin: "default",
};

zorClient.z_connectToServer('ws://localhost:31000');

// Give the socket time to connect, then enter the game
setTimeout(function () {
    zorClient.z_sendEnterGame(playerMeta);
}, 500);


