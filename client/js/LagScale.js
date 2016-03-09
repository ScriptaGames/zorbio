var ZOR = ZOR || {};

ZOR.LagScale = function ZORLagScale() {

    var IDEAL_FRAME_MS = 1/60 * 1000;

    var time  = get_time();
    var scale = 1;
    var fps   = IDEAL_FRAME_MS / 1000;

    function get_time() {
        return Date.now();
    }

    function update() {
        if (config.LAG_SCALE_ENABLE) {
            var new_time = get_time();
            var time_diff = new_time - time;
            var new_fps = 1 / (time_diff / 1000);
            time = new_time;
            scale = time_diff / IDEAL_FRAME_MS;
            fps = 0.2 * new_fps + 0.8 * fps; // running average of fps
        }
    }

    function get() {
        return scale;
    }

    function get_fps() {
        return fps;
    }

    return {
        update  : update,
        get     : get,
        get_fps : get_fps,
    };
}();
