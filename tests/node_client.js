// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
*/

global.player = null;

let ZORClient = require('../common/Client.js');
let Zorbio    = require('../common/zorbio.js');
let handler   = require('./HeadlessHandler.js');
let _         = require('lodash');

global.zorbioModel = new Zorbio.Model();

global.gameStart  = false;
global.playerDead = false;

console.log('Starting headless zorbio node client to: ' + process.argv[2]);

let zorClient = new ZORClient(handler);

let playerMeta = {
    color     : 3,
    key       : 'mathisfreedom',
    playerName: 'test2',
    playerType: 'PLAYER',
    skin      : 'default',
};

zorClient.z_connectToServer(process.argv[2]);

// Give the socket time to connect, then enter the game
setTimeout(function() {
    console.log('Entering game...');
    zorClient.z_sendEnterGame(playerMeta);
}, 6000);

// Simulates animate() loop
setInterval(function() {
    if (global.gameStart && !global.playerDead) {
        addRecentPosition();
        zorClient.z_sendClientPositionRapid(global.player.sphere.id, global.player.sphere.position);
        throttledPlayerUpdate(global.player.sphere, []);
    }
}, 16);

function sendPlayerUpdate() {
    if (!global.gameStart) return;

    // make sure we always have at least 4 recent positions
    while (global.player.sphere.recentPositions.length < 4) {
        addRecentPosition();
    }

    zorClient.z_sendPlayerUpdate(global.player.sphere, []);
}

let throttledPlayerUpdate = _.throttle(sendPlayerUpdate, config.TICK_FAST_INTERVAL);


function addRecentPosition() {
    let p = {
        x: global.player.sphere.position.x,
        y: global.player.sphere.position.y,
        z: global.player.sphere.position.z,
    };

    let time = Date.now() - global.player.createdTime;  // milliseconds since the player was created
    global.player.sphere.recentPositions.push({ position: p, radius: global.player.sphere.scale, time: time });

    if (global.player.sphere.recentPositions.length > config.PLAYER_POSITIONS_WINDOW) {
        global.player.sphere.recentPositions.shift();  // remove the oldest position
    }
}
