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
        document.getElementById('gameAreaWrapper').style.display = 'block';
        document.getElementById('startMenuWrapper').style.display = 'none';
    } else {
        document.getElementById('gameAreaWrapper').style.display = 'none';
        document.getElementById('startMenuWrapper').style.display = 'block';
    }
}
