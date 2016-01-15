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
        INITIAL               : 'login-screen',
        LOGIN_SCREEN          : 'login-screen',
        LOGIN_SCREEN_ERROR    : 'login-screen-error',
        PLAYING               : 'playing',
        RESPAWN_SCREEN        : 'respawn-screen',
    };

    /**
     * An "enum" storing unique values for UI state transitions.
     */

    var ACTIONS = {
        PLAYER_LOGIN_KEYPRESS : 'player-login-keypress',
        PLAYER_LOGIN          : 'player-login',
        PLAYER_RESPAWN        : 'player-respawn',
    };

    /**
     * The data to pass into templates.
     */

    var uidata = {
        state   : STATES.INITIAL,
        STATES  : STATES,
        ACTIONS : ACTIONS,
        in_state : in_state,
    } ;

    /**
     * The Ractive template engine.  Data + Templates = HTML
     */

    var engine = new Ractive({
        // The `el` option can be a node, an ID, or a CSS selector.
        el: '#ui-overlay',

        // We could pass in a string, but for the sake of convenience
        // we're passing the ID of the <script> tag above.
        template: '#ui-template',

        // Here, we're passing in some initial data
        data: uidata,
    });

    /**
     * Given a state string, returns true if it's a real, defined state,
     * otherwise false.
     */

    function valid_state( newstate ) {
        return _.contains( _.values( ZOR.UI.STATES ), newstate );
    }

    /**
     * Given an array of state strings, or any number of state string
     * arguments, returns true if any of them are the current state.
     *
     * @example
     *     // returns true if we are in either the login screen or the respawn screen
     *     in_state( ZOR.UI.STATES.LOGIN_SCREEN, ZOR.UI.STATES.RESPAWN_SCREEN );
     */

    function in_state() {
        return _.chain( arguments )
            .toArray()
            .flatten()
            .intersection( [uidata.state] )
            .size()
            .gt(0)
            .value();
    }

    /**
     * Given a valid state, change to that state.  With no arguments, returns
     * current state.
     */

    function state( newstate ) {
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

    // public properties of ZOR.UI

    return {
        STATES   : STATES,
        ACTIONS  : ACTIONS,
        data     : uidata,
        engine   : engine,
        state    : state,
        in_state : in_state,
        on       : on,
    };

}();

