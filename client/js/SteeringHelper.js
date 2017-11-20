/*
global ZOR:true
global gameStart:true
global player:true
global camera_controls:true
global config:true
global ga:true
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
        this._toastActive  = false; // is toast currently showing
    }


    /**
     * Start detecting if a player can fly straight
     */
    detectStraight() {
        this._listener = this._handleMouseMove.bind(this);
        window.addEventListener('mousemove', this._listener, true);

        setTimeout(() => {
            if (!this._canSteer) {
                // display toast
                console.log("[SteeringHelper] player can't steer");
                let steeringToast = document.getElementById('steering-toast');
                steeringToast.style.display = 'block';
                this._toastActive = true;

                // Send event to google analytics that toast was displayed
                ga('send', {
                    hitType      : 'event',
                    eventCategory: 'steering_toast',
                    eventAction  : 'display_toast',
                    eventLabel   : 'detect_straight',
                });

                // Clear the toast after a max time showing in case they just don't get it
                setTimeout(() => {
                    steeringToast.style.display = 'none';
                    window.removeEventListener('mousemove', this._listener, true);

                    if (this._toastActive) {
                        this._toastActive = false;

                        // Send event to google analytics that toast auto-removed
                        ga('send', {
                            hitType      : 'event',
                            eventCategory: 'steering_toast',
                            eventAction  : 'clear_toast',
                            eventLabel   : 'auto',
                        });
                    }

                }, config.STEERING_HELPER_MAX_TOAST_TIME);
            }
            else {
                console.log('[SteeringHelper] player can steer');

                // Send event to google analytics that no toast required because player can steer
                ga('send', {
                    hitType      : 'event',
                    eventCategory: 'steering_toast',
                    eventAction  : 'no_toast_required',
                    eventLabel   : 'detect_straight',
                });
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

                    this._timeInCenter += this._timerTick; // Increment the timer

                    if (this._timeInCenter >= this._lingerTime) {
                        console.log('[SteeringHelper] In center for: ', this._timeInCenter);
                        this._canSteer = true;  // Yay player knows how to steer now!

                        // Stop the timer
                        clearInterval(this._centerTimer);
                        this._centerTimer = null;

                        // Hide the toast circles
                        let toastCircles           = document.getElementById( 'toast-circles' );
                        toastCircles.style.display = 'none';

                        // Remove the event listener for performance
                        window.removeEventListener('mousemove', this._listener, true);
                        console.log('[SteeringHelper] removed toast UI and mousemove listener');

                        if (this._toastActive) {

                            this._toastActive = false;

                            // Toast was showing replace with reward message
                            let toastText = document.getElementById('steering-toast-message');
                            toastText.innerHTML = 'Nice!';

                            // Send event to google analytics that toast cleared by player
                            ga('send', {
                                hitType      : 'event',
                                eventCategory: 'steering_toast',
                                eventAction  : 'clear_toast',
                                eventLabel   : 'by_player',
                            });

                            // Remove the reward message after a few seconds
                            setTimeout(() => {
                                let toastContent = document.getElementById('steering-toast');
                                toastContent.style.display = 'none';
                            }, 3000);
                        }
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
