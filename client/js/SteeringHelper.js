/*
global ZOR:true
global gameStart:true
global player:true
global camera_controls:true
global config:true
 */

ZOR.SteeringHelper = class ZORSteeringHelper {

    /**
     * @constructor
     */
    constructor() {
        this._timeInCenter = 0;     // ms is mouse in center zone
        this._centerTimer  = null;  // handle to setInterval center zone timer
        this._canSteer     = false; // flag on weather we think this player can steer
        this._timerTick    = config.STEERING_HELPER_TIMER_TICK;    // ms interval center zone timer checks
        this._lingerTime   = config.STEERING_HELPER_LINGER_TIME;   // min time that cursor spent in center zone to consider linger
    }


    /**
     * Start detecting if a player can fly strait
     */
    detectStrait() {
        this._listener = this._handleMouseMove.bind(this);
        window.addEventListener('mousemove', this._listener, true);

        setTimeout(() => {
            if (!this._canSteer) {
                // display toast
                console.log("[SteeringHelper] player can't steer");
                let el = document.getElementById('steering-toast');
                el.style.display = 'block';
            }
            else {
                console.log('[SteeringHelper] player can steer');
            }
        }, config.STEERING_HELPER_DETECT_DURATION);
    }


    /**
     * Handle mouse move event
     * @param {Object} evt
     */
    _handleMouseMove(evt) {
        if (!gameStart || player.isDead) return;

        let vector = camera_controls.getMouseOnCircle( evt.pageX, evt.pageY );

        if (ZOR.SteeringHelper.isMouseInCenterZone(vector)) {
            if (!this._centerTimer) {
                // Start countdown to see how long the mouse is in center zone
                this._centerTimer = setInterval(() => {
                    this._timeInCenter += this._timerTick;
                    if (this._timeInCenter >= this._lingerTime) {
                        console.log('[SteeringHelper] In center for: ', this._timeInCenter);
                        this._canSteer = true;
                        clearInterval(this._centerTimer);
                        this._centerTimer = null;
                        let el = document.getElementById('steering-toast');
                        el.style.display = 'none';
                        window.removeEventListener('mousemove', this._listener, true);
                        console.log('[SteeringHelper] removed toast UI and mousemove listener');
                    }
                    else {
                        console.log('[SteeringHelper] timeInCenter', this._timeInCenter);
                    }
                }, this._timerTick);
            }
        }
        else {
            // clear countdown
            this._timeInCenter = 0;
            if (this._centerTimer) {
                console.log('[SteeringHelper] clearing timer');
                clearInterval(this._centerTimer);
                this._centerTimer = null;
            }
        }
    }

    /**
     * Returns true of mouse is in the center zone of screen
     * @param {Vector2} vector x, y values between 0-1 where 0 is dead center and 1 is far edge
     * @returns {boolean}
     */
    static isMouseInCenterZone(vector) {
        let x = Math.abs(+vector.x.toFixed(1));
        let y = Math.abs(+vector.y.toFixed(1));
        return (x <= 0.1 && y <= 0.1);
    }
};
