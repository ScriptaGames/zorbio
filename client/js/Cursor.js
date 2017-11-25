/**
 *  This file should contain user interface functions, like displaying messages, manipulating the dom,
 *  handling chat display etc.
 */

// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
global UTIL:true
*/


ZOR.Cursor = function ZORUI() {

    const STEPS = 4;

    let x       = -500;
    let y       = -500;
    let vecX    = -500;
    let vecY    = -500;
    let angle   = 0;
    let quantum = 0;

    window.addEventListener('mousemove', UTIL.nth(_handleCursorMove, 1));

    /**
     * Update the UI data model when the mouse cursor moves.
     * @param {Event} evt the mousemove event
     */
    function _handleCursorMove(evt) {
        x            = evt.clientX;
        y            = evt.clientY;
        [vecX, vecY] = _calculateVector(x, y);
        quantum      = _calculateQuanta(vecX, vecY);
        angle        = _calculateAngle(vecX, vecY);

        ZOR.UI.engine.fire( ZOR.UI.ACTIONS.MOUSE_MOVE, { x, y, angle, quantum });
    }

    /**
     * Calculate the vector from screen center to the mouse position.
     * @param {Number} mouseX mouse's X position
     * @param {Number} mouseY mouse's Y position
     * @return {Array} an array with the x and y components of the vector
     */
    function _calculateVector(mouseX = 0, mouseY = 0) {
        const [screenX, screenY] = [window.innerWidth, window.innerHeight];
        const [vecX, vecY] = [mouseX - screenX / 2, mouseY - screenY / 2];
        return [vecX, vecY];
    }

    /**
     * Calculate the angle of the mouse vector.
     * @param {Number} vecX the x component of the mouse vector
     * @param {Number} vecY the y component of the mouse vector
     * @return {Number} the angle of the vector
     */
    function _calculateAngle(vecX, vecY) {
        const adjust = vecX < 0 ? Math.PI / 2 : -Math.PI / 2;
        const angle = Math.atan( vecY / vecX ) - adjust;
        return angle;
    }

    /**
     * Calculate how far the mouse is from the screen center.  This value is quantized.
     * @param {Number} vecX the x component of the mouse vector
     * @param {Number} vecY the y component of the mouse vector
     * @return {Number} the quantized distance from screen center
     */
    function _calculateQuanta(vecX, vecY) {
        const mag = Math.sqrt(vecX * vecX + vecY * vecY);
        // scrinch in the quanta a bit
        const scrinch = Math.max(window.innerWidth / 2, window.innerHeight / 2);
        // find maximum magnitude, used to judge
        const maxMag = 0.8 * Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) - scrinch;
        const quanta = Math.max(0, Math.min(STEPS - 1, Math.floor(STEPS * mag / maxMag)));
        return quanta;
    }
}();


