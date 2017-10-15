// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
*/

ZOR.LagScale = function ZORLagScale() {
    let IDEAL_FRAME_MS = 1/60 * 1000;

    let time  = get_time();
    let scale = 1;
    let fps   = IDEAL_FRAME_MS / 1000;

    /**
     * Wraps Date.now()
     * @returns {number}
     */
    function get_time() {
        return Date.now();
    }

    /**
     * Keeps a running average of the players fps
     */
    function update() {
        if (config.LAG_SCALE_ENABLE) {
            let new_time = get_time();
            let time_diff = new_time - time;
            let new_fps = 1 / (time_diff / 1000);
            time = new_time;
            scale = time_diff / IDEAL_FRAME_MS;
            fps = 0.2 * new_fps + 0.8 * fps; // running average of fps
        }
    }

    /**
     * Getter for scale
     * @returns {number}
     */
    function get() {
        return scale;
    }

    /**
     * Getter for fps
     * @returns {number}
     */
    function get_fps() {
        return fps;
    }

    return {
        update : update,
        get    : get,
        get_fps: get_fps,
    };
}();
