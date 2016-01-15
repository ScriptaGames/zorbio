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

    var uidata = {
        state   : STATES.INITIAL,
        STATES  : STATES,
        ACTIONS : ACTIONS,
        eq      : _.eq,
        neq     : _.negate(_.eq),
    } ;

    var engine = new Ractive({
        // The `el` option can be a node, an ID, or a CSS selector.
        el: '#ui-overlay',

        // We could pass in a string, but for the sake of convenience
        // we're passing the ID of the <script> tag above.
        template: '#ui-template',

        // Here, we're passing in some initial data
        data: uidata,
    });

    function valid_state( newstate ) {
        return _.contains( _.values( ZOR.UI.STATES ), newstate );
    }

    function state( newstate ) {
        if (typeof newstate !== 'undefined' && valid_state( newstate ) ) {
            console.log('entering state ' + newstate);
            uidata.state = newstate;
            engine.update();
        }
        return uidata.state;
    }

    function on( event, handler ) {
        engine.on( event, handler );
    }

    return {
        STATES  : STATES,
        ACTIONS : ACTIONS,
        data    : uidata,
        engine  : engine,
        state   : state,
        on      : on,
    };

}();

