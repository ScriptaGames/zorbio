/**
 *  This file should contain user interface functions, like displaying messages, manipulating the dom,
 *  handling chat display etc.
 */

var ZOR = ZOR || {};

ZOR.UI = function ZORUI() {

    var engine; // the UI engine, currently Ractive

    /**
     * A list of the browser features that are required to run Zorbio.  The
     * match the names provided by Modernizr.
     */

    var REQUIRED_FEATURES = [ 'json', 'websockets', 'webgl', 'flexbox' ];

    /**
     * An "enum" storing unique values for UI states.
     */

    var STATES = {
        INITIAL            : 'login-screen',
        LOGIN_SCREEN       : 'login-screen',
        PLAYING            : 'playing',
        CONFIG             : 'config',
        RESPAWN_SCREEN     : 'respawn-screen',
        KICKED_SCREEN      : 'kicked-screen',
        GAME_INIT_ERROR    : 'game-init-error',
        SERVER_MSG_SCREEN  : 'server-msg-screen',
        CREDITS_SCREEN     : 'credits-screen',
        TUTORIAL_SCREEN    : 'tutorial-screen',
    };

    /**
     * An "enum" storing unique values for UI state transitions.
     */

    var ACTIONS = {
        PLAYER_LOGIN_KEYPRESS : 'player-login-keypress',
        PLAYER_LOGIN          : 'player-login',
        PLAYER_RESPAWN        : 'player-respawn',
        PAGE_RELOAD           : 'page-reload',
        SHOW_CREDITS          : 'show-credits',
        SHOW_LOGIN            : 'show-login',
        SHOW_TUTORIAL         : 'show-tutorial',
        SHOW_CONFIG           : 'show-config',
        SHOW_PREVIOUS         : 'show-previous',
        TOGGLE_Y_AXIS         : 'toggle-y-axis',
        TOGGLE_X_AXIS         : 'toggle-x-axis',
        VOLUME_MUSIC          : 'volume-music',
        VOLUME_SFX            : 'volume-sfx',
    };
    /**
     * The data to pass into templates.
     */

    var uidata = {
        state            : '',
        prev_state       : STATES.INITIAL,
        STATES           : STATES,
        ACTIONS          : ACTIONS,
        COLORS           : ZOR.PlayerView.COLORS,
        MISSING_FEATURES : [],
        AUTHORS          : ['Michael Clayton', 'Jared Sprague'],
        leaders          : [],
        is_mobile        : isMobile.any,
        flip_x           : JSON.parse(localStorage.flip_x || "false"),
        flip_y           : JSON.parse(localStorage.flip_y || "false"),
        music_enabled    : config.MUSIC_ENABLED,
        volume           : {
            music : config.VOLUME_MUSIC_INITIAL,
            sfx   : config.VOLUME_SFX_INITIAL,
        },
    };

    // the public functions exposes by this module (may be modified during execution)
    var api = {
        STATES   : STATES,
        ACTIONS  : ACTIONS,
        data     : uidata,
        state    : state,
        on       : on,
    };

    // the previous state
    var previous = STATES.INITIAL;

    /**
     * The Ractive template engine.  Data + Templates = HTML
     */

    function register_partial( el ) {
        var name = el.id.replace('-template', '');
        engine.partials[name] = el.textContent;
    }

    /**
     * Given a state string, returns true if it's a real, defined state,
     * otherwise false.
     */

    function valid_state( newstate ) {
        return _.includes( _.values( STATES ), newstate );
    }

    /**
     * Given a valid state, change to that state.  With no arguments, returns
     * current state.
     */

    function state( newstate ) {
        if (newstate !== uidata.prev_state) {
            uidata.prev_state = uidata.state;
        }
        if (typeof newstate !== 'undefined' && valid_state( newstate ) ) {
            console.log('entering state ' + newstate);
            uidata.state = newstate;
            engine.update();
        }
        return uidata.state;
    }

    /**
     * Simple pass-through to Ractive's event handler.
     */

    function on( event, handler ) {
        engine.on( event, handler );
    }

    /**
     * Update the UI state with any missing browser features.
     */

    function validate_browser_features() {

        var missing_feature_names = _.chain(missing_browser_features())
            .keys()
            .union(config.BROWSER_FORCE_DISABLED_FEATURES)
            .intersection(REQUIRED_FEATURES)
            .value();

        _.assign(uidata.MISSING_FEATURES, missing_feature_names);

        if (missing_feature_names.length) {
            console.log('Missing browser feature(s) found: ' + JSON.stringify(missing_feature_names));
        }

        if (missing_feature_names.length) {
            state( STATES.GAME_INIT_ERROR );
        }
    }

    /**
     * Get an object representing the browser features we need that came up
     * false in the Modernizr check.
     */

    function missing_browser_features() {
        // find the own (non-inherited properties on the Modernizr object which
        // have a value of false (omitBy defaults to _.identity which grants us
        // falsy values only).
        return _.chain(Modernizr).forOwn().omitBy().value();
    }

    function init() {

        Ractive.DEBUG = config.DEBUG;
        engine = new Ractive({
            // The `el` option can be a node, an ID, or a CSS selector.
            el: '#ui-overlay',

            // We could pass in a string, but for the sake of convenience
            // we're passing the ID of the <script> tag above.
            template: '#ui-template',

            // Here, we're passing in some initial data
            data: uidata,
        });

        api.engine = engine;
        api.update = get_updater();

        validate_browser_features();
        _.each( document.querySelectorAll('script[type="text/ractive"]'), register_partial ); // register all ractive templates as partials
        state( STATES.INITIAL );

        init_events();
    }

    /**
     * Initialize all the UI event handlers.
     */
    function init_events() {
        'use strict';

        if (localStorage.alpha_key) {
            engine.set('alpha_key', localStorage.alpha_key)
        }
        if (localStorage.player_name) {
            engine.set('player_name', localStorage.player_name)
        }

        // volume change handlers

        on( ACTIONS.VOLUME_MUSIC, function ZORVolumeMusic() {
            var vol = this.get('volume.music');
            ZOR.Sounds.music.background.volume( vol );
            localStorage.volume_music = vol;
        });

        on( ACTIONS.VOLUME_SFX, function ZORVolumeSfx() {
            var vol = this.get('volume.sfx');
            _.each(
                ZOR.Sounds.sfx.food_capture,
                _.partial( _.invoke, _, 'volume', vol )
            );
            localStorage.volume_sfx = vol;
        });

        // show/hide UI panels

        on( ACTIONS.SHOW_CREDITS, function ZORShowCredits() {
            state( STATES.CREDITS_SCREEN );
        });

        on( ACTIONS.SHOW_TUTORIAL, function ZORShowTutorial() {
            state( STATES.TUTORIAL_SCREEN );
        });

        on( ACTIONS.SHOW_CONFIG, function ZORShowConfig() {
            state( STATES.CONFIG );
        });

        on( ACTIONS.SHOW_LOGIN, function ZORShowLogin() {
            state( STATES.LOGIN_SCREEN );
        });

        on( ACTIONS.SHOW_PREVIOUS, function ZORShowPrevious() {
            state( uidata.prev_state );
        });

        on( ACTIONS.PLAYER_LOGIN, function ZORLoginHandler() {
            // check if the nick is valid
            if (UTIL.validNick(engine.get('player_name'))) {
                startGame(ZOR.PlayerTypes.PLAYER);
            } else {
                engine.set( 'login_error_msg', 'Nick name must be alphanumeric characters only!' );

            }
        });


        config.X_AXIS_MULT = JSON.parse(localStorage.flip_x || "false") ? -1 : 1;
        config.Y_AXIS_MULT = JSON.parse(localStorage.flip_y || "false") ? -1 : 1;
        on( ACTIONS.TOGGLE_Y_AXIS, axisToggler('y'));
        on( ACTIONS.TOGGLE_X_AXIS, axisToggler('x'));

        function axisToggler(axis) {
            return function ZORToggleYAxis(e) {
                var lsKey = 'flip_'+axis.toLowerCase();
                var confKey = axis.toUpperCase()+'_AXIS_MULT';
                if ( e.node.checked ) {
                    config[confKey] = -1;
                    uidata[lsKey] = true;
                }
                else {
                    config[confKey] = 1;
                    uidata[lsKey] = false;
                }
                localStorage[lsKey] = uidata[lsKey];
            }
        }

        on( ACTIONS.PAGE_RELOAD, location.reload.bind(location) );

        on( ACTIONS.PLAYER_RESPAWN, function ZORRespawnButtonHandler() {
            if (window.respawnPlayer) {
                respawnPlayer();
            }
        });

        on( ACTIONS.PLAYER_LOGIN_KEYPRESS, function ZORPlayerLoginKeypressHandler(e) {
            var key = e.original.which || e.original.keyCode;
            var KEY_ENTER = 13;

            if (key === KEY_ENTER) {
                if (UTIL.validNick(engine.get('player_name'))) {
                    if (window.startGame) {
                        startGame(ZOR.PlayerTypes.PLAYER);
                    }
                } else {
                    engine.set( 'login_error_msg', 'Nick name must be alphanumeric characters only!' );
                }
            }
        });

        // init mobile
        if (isMobile.any) {
            // mobile must always use drag steering
            config.STEERING = config.STEERING_METHODS.MOUSE_DRAG;
        }

        if (config.AUTO_PLAY) {
            engine.fire( ACTIONS.PLAYER_LOGIN );
        }

    }

    /**
     * Automatically update UI every N frames.  The largest implication is how
     * quickly the leaderboard is updated when new leaderboard data is received
     * from the server.
     */
    function get_updater() {
        return UTIL.nth( engine.update.bind(engine), 20 );
    };

    /**
     * Fetch Ractive templates and GLSL shaders, then init UI.
     */
    function fetch_then_init() {
        var needs_fetching = document.querySelector('script[type="text/ractive"]').innerHTML === "";

        if (needs_fetching) {
            var scripts = document.querySelectorAll('script[type="text/ractive"], script[type^=x-shader]')
            Promise.all( _.map(scripts, fetch_inject) ).then( init );
        }
        else {
            init();
        }
    }

    /**
     * Given a script element, fetch its `src` and inject the response into the element.
     */
    function fetch_inject(el) {
        return fetch( el.src ).then( get_fetch_text ).then( mk_script_injector(el) );
    }

    /**
     * From a `fetch` API response, get the text.
     */
    function get_fetch_text(response) {
        return response.text();
    }

    /**
     * Return a function which will inject text into an element.
     */
    function mk_script_injector(element) {
        return function script_injector(text) {
            element.innerHTML = text;
        };
    }

    fetch_then_init();

    return api;

}();

