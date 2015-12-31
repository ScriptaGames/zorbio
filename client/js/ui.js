/**
 *  This file should contain user interface functions, like displaying messages, manipulating the dom,
 *  handling chat display etc.
 */
function displayModalMessage(msg) {
    // TODO: make a prettier modal message
    alert(msg);
}

function showGame(show) {
    if (show) {
        document.getElementById('game-area-wrapper').style.display = 'block';
        document.getElementById('start-menu').style.display = 'none';
    }
    else {
        document.getElementById('game-area-wrapper').style.display = 'none';
        document.getElementById('start-menu').style.display = 'block';
    }
    showOverlay(!show);
}

function showDeathScreen(show) {
    if (show) {
        document.getElementById('death-screen').style.display = 'flex';
    }
    else {
        document.getElementById('death-screen').style.display = 'none';
    }
    showOverlay(show);
}

function showOverlay(show) {
    if (show) {
        document.getElementById('ui-overlay').style.display = 'flex';
    }
    else {
        document.getElementById('ui-overlay').style.display = 'none';
    }
}
