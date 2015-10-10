/**
 * Client network related functions
 */

var socket;

function connectToServer(playerType, playerName) {
    if (!socket) {
        socket = io({query: "type=" + playerType + "&name=" + playerName});
        setupSocket(socket);
    }
    socket.emit('respawn');
}

function setupSocket(socket) {
    console.log('Game handleNetwork');

    // Handle connection
    socket.on('welcome', function (playerSettings) {
        player = playerSettings;
        socket.emit('gotit', player);
        gameStart = true;
        console.log('Game is started: ' + gameStart);


        // create the scene
        var scene = createScene();

        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () {
            scene.render();
        });

        //TODO: add chat system
        //chat.addSystemLine('Connected to the game!');
        //chat.addSystemLine('Type <b>-help</b> for a list of commands');
        if (isMobile.any) {
            //TODO: handle mobile UI stuff
            //document.getElementById('gameAreaWrapper').removeChild(document.getElementById('chatbox'));
        }
        document.getElementById('renderCanvas').focus();
    });

    socket.on('playerJoin', function (data) {
        //TODO: implement chat system
        //chat.addSystemLine('Player <b>' + data.name + '</b> joined!');
        console.log('Player ' + data.name + ' joined!');
    });

    socket.on('gameSetup', function (data) {
        console.log('Games finished setting up', data);
    });

    /*
     // Handle ping
     socket.on('pong', function () {
     var latency = Date.now() - startPingTime;
     debug('Latency: ' + latency + 'ms');
     chat.addSystemLine('Ping: ' + latency + 'ms');
     });

     // Handle error
     socket.on('connect_failed', function () {
     socket.close();
     disconnected = true;
     });

     socket.on('disconnect', function () {
     socket.close();
     disconnected = true;
     });

     // Handle connection
     socket.on('welcome', function (playerSettings) {
     player = playerSettings;
     player.name = playerName;
     player.screenWidth = screenWidth;
     player.screenHeight = screenHeight;
     player.target = target;
     socket.emit('gotit', player);
     gameStart = true;
     debug('Game is started: ' + gameStart);
     chat.addSystemLine('Connected to the game!');
     chat.addSystemLine('Type <b>-help</b> for a list of commands');
     if (mobile) {
     document.getElementById('gameAreaWrapper').removeChild(document.getElementById('chatbox'));
     }
     document.getElementById('cvs').focus();
     });

     socket.on('gameSetup', function(data) {
     gameWidth = data.gameWidth;
     gameHeight = data.gameHeight;
     resize();
     });

     socket.on('playerDied', function (data) {
     chat.addSystemLine('Player <b>' + data.name + '</b> died!');
     });

     socket.on('playerDisconnect', function (data) {
     chat.addSystemLine('Player <b>' + data.name + '</b> disconnected!');
     });

     socket.on('playerJoin', function (data) {
     chat.addSystemLine('Player <b>' + data.name + '</b> joined!');
     });

     socket.on('leaderboard', function (data) {
     leaderboard = data.leaderboard;
     var status = '<span class="title">Leaderboard</span>';
     for (var i = 0; i < leaderboard.length; i++) {
     status += '<br />';
     if (leaderboard[i].id == player.id){
     if(leaderboard[i].name.length !== 0)
     status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + "</span>";
     else
     status += '<span class="me">' + (i + 1) + ". A cell unnamed</span>";
     } else {
     if(leaderboard[i].name.length !== 0)
     status += (i + 1) + '. ' + leaderboard[i].name;
     else
     status += (i + 1) + '. A cell unnamed';
     }
     }
     //status += '<br />Players: ' + data.players;
     document.getElementById('status').innerHTML = status;
     });

     socket.on('serverMSG', function (data) {
     chat.addSystemLine(data);
     });

     // Chat
     socket.on('serverSendPlayerChat', function (data) {
     chat.addChatLine(data.sender, data.message, false);
     });

     // Handle movement
     socket.on('serverTellPlayerMove', function (userData, foodsList, massList) {
     var playerData;
     for(var i =0; i< userData.length; i++) {
     if(typeof(userData[i].id) == "undefined") {
     playerData = userData[i];
     i = userData.length;
     }
     }
     if(playerType == 'player') {
     var xoffset = player.x - playerData.x;
     var yoffset = player.y - playerData.y;

     player.x = playerData.x;
     player.y = playerData.y;
     player.hue = playerData.hue;
     player.massTotal = playerData.massTotal;
     player.cells = playerData.cells;
     player.xoffset = isNaN(xoffset) ? 0 : xoffset;
     player.yoffset = isNaN(yoffset) ? 0 : yoffset;
     }
     users = userData;
     foods = foodsList;
     fireFood = massList;
     });

     // Die
     socket.on('RIP', function () {
     gameStart = false;
     died = true;
     window.setTimeout(function() {
     document.getElementById('gameAreaWrapper').style.opacity = 0;
     document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
     died = false;
     if (animLoopHandle) {
     window.cancelAnimationFrame(animLoopHandle);
     animLoopHandle = undefined;
     }
     }, 2500);
     });

     socket.on('kick', function (data) {
     gameStart = false;
     reason = data;
     kicked = true;
     socket.close();
     });
     */
}
