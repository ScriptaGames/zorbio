// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
*/

ZOR.LagScaleClass = class ZORLagScale {
    /**
     * @constructor
     */
    constructor() {
        this.IDEAL_FRAME_MS = 1/60 * 1000;

        this.time  = this.get_time();
        this.scale = 1;
        this.fps   = this.IDEAL_FRAME_MS / 1000;
    }

    /**
     * Wraps Date.now()
     * @returns {number}
     */
    get_time() {
        return Date.now();
    }

    /**
     * Keeps a running average of the players fps
     */
    update() {
        if (config.LAG_SCALE_ENABLE) {
            let new_time = this.get_time();
            let time_diff = new_time - this.time;
            let new_fps = 1 / (time_diff / 1000);
            this.time = new_time;
            this.scale = time_diff / this.IDEAL_FRAME_MS;
            this.fps = 0.2 * new_fps + 0.8 * this.fps; // running average of fps
        }
    }

    /**
     * Getter for scale
     * @returns {number}
     */
    get() {
        return this.scale;
    }

    /**
     * Getter for fps
     * @returns {number}
     */
    get_fps() {
        return this.fps;
    }
};

ZOR.LagScale = new ZOR.LagScaleClass();
