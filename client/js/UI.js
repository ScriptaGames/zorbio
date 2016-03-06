/**
 *  This file should contain user interface functions, like displaying messages, manipulating the dom,
 *  handling chat display etc.
 */

var ZOR = ZOR || {};

ZOR.UI = function ZORUI() {

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
    };

    /**
     * The data to pass into templates.
     */

    var uidata = {
        state            : STATES.INITIAL,
        prev_state       : STATES.INITIAL,
        STATES           : STATES,
        ACTIONS          : ACTIONS,
        COLORS           : ZOR.PlayerView.COLORS,
        MISSING_FEATURES : [],
        AUTHORS          : ['Michael Clayton', 'Jared Sprague'],
        leaders          : [],
        is_mobile        : isMobile.any,
    };

    /**
     * A list of the browser features that are required to run Zorbio.  The
     * match the names provided by Modernizr.
     */

    var REQUIRED_FEATURES = [ 'json', 'websockets', 'webgl', 'flexbox' ];

    // the previous state
    var previous = STATES.INITIAL;

    /**
     * The Ractive template engine.  Data + Templates = HTML
     */

    Ractive.DEBUG = config.DEBUG;
    var engine = new Ractive({
        // The `el` option can be a node, an ID, or a CSS selector.
        el: '#ui-overlay',

        // We could pass in a string, but for the sake of convenience
        // we're passing the ID of the <script> tag above.
        template: '#ui-template',

        // Here, we're passing in some initial data
        data: uidata,
    });

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
        console.log('entering state ' + newstate);
        if (newstate !== uidata.prev_state) {
            uidata.prev_state = uidata.state;
        }
        if (typeof newstate !== 'undefined' && valid_state( newstate ) ) {
            // console.log('entering state ' + newstate);
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

        console.log('Missing browser feature(s) found: ' + JSON.stringify(missing_feature_names));

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
        validate_browser_features();
        _.each( document.querySelectorAll('script[type="text/ractive"]'), register_partial ); // register all ractive templates as partials
        state( STATES.INITIAL );
    }

    init();

    // public properties of ZOR.UI

    return {
        STATES   : STATES,
        ACTIONS  : ACTIONS,
        data     : uidata,
        engine   : engine,
        state    : state,
        on       : on,
        update   : UTIL.nth( engine.update.bind(engine), 20 ), // automatically update UI every N frames, really only affects leaderboard
    };

}();

