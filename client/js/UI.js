/**
 *  This file should contain user interface functions, like displaying messages, manipulating the dom,
 *  handling chat display etc.
 */

var ZOR = ZOR || {};

ZOR.UI = function ZORUI() {

    var engine; // the UI engine, currently Ractive
    var initialized = false;

    /**
     * A list of the browser features that are required to run Zorbio.  The
     * match the names provided by Modernizr.
     */

    var REQUIRED_FEATURES = [ 'json', 'websockets', 'webgl', 'flexbox' ];

    /**
     * An "enum" storing unique values for UI states.
     */

    var STATES = {
        INITIAL             : 'menu-game-screen',
        MENU_SCREEN         : 'menu-game-screen',
        MENU_GAME_SCREEN    : 'menu-game-screen',
        MENU_STORE_SCREEN   : 'menu-store-screen',
        MENU_CONFIG_SCREEN  : 'menu-config-screen',
        MENU_CREDITS_SCREEN : 'menu-credits-screen',
        PLAYING             : 'playing',
        PLAYING_CONFIG      : 'playing-config',
        RESPAWN_SCREEN      : 'menu-respawn-screen',
        KICKED_SCREEN       : 'kicked-screen',
        GAME_INIT_ERROR     : 'game-init-error',
        SERVER_MSG_SCREEN   : 'server-msg-screen',
        TUTORIAL_SCREEN     : 'menu-tutorial-screen',
        LEADERBOARD_SCREEN  : 'menu-leaderboard-screen',
    };

    /**
     * An "enum" storing unique values for UI state transitions.
     */

    var ACTIONS = {
        PLAYER_LOGIN_KEYPRESS    : 'player-login-keypress',
        PLAYER_LOGIN             : 'player-login',
        PLAYER_RESPAWN           : 'player-respawn',
        PAGE_RELOAD              : 'page-reload',
        SHOW_MENU                : 'show-menu',
        SHOW_TUTORIAL            : 'show-tutorial',
        SHOW_LEADERBOARD         : 'show-leaderboard',
        SHOW_PLAYING_CONFIG      : 'show-playing-config',
        SHOW_PREVIOUS            : 'show-previous',

        UPDATE_LEADERBOARD       : 'update-leaderboard',
        SHOW_LEADERBOARD_1D      : 'show-leaderboard-1d',
        SHOW_LEADERBOARD_7D      : 'show-leaderboard-7d',
        SHOW_LEADERBOARD_30D     : 'show-leaderboard-30d',

        SHOW_MENU_GAME_SCREEN    : 'show-menu-game-screen',
        SHOW_MENU_STORE_SCREEN   : 'show-menu-store-screen',
        SHOW_MENU_CONFIG_SCREEN  : 'show-menu-config-screen',
        SHOW_MENU_CREDITS_SCREEN : 'show-menu-credits-screen',

        TOGGLE_Y_AXIS            : 'toggle-y-axis',
        TOGGLE_X_AXIS            : 'toggle-x-axis',
        TOGGLE_OWN_TRAIL         : 'toggle-own-trail',
        VOLUME_MUSIC             : 'volume-music',
        VOLUME_SFX               : 'volume-sfx',
        SET_STEERING             : 'set-steering',

        SET_SKIN                 : 'set-skin',
    };

    /**
     * The data to pass into templates.
     */

    var uidata = {
        state            : '',
        prev_state       : STATES.INITIAL,
        STATES           : STATES,
        ACTIONS          : ACTIONS,
        COLORS           : config.COLORS,
        REQUIRE_ALPHA_KEY: config.REQUIRE_ALPHA_KEY,
        DEBUG            : config.DEBUG,
        MISSING_FEATURES : [],
        MAX_PLAYER_RADIUS: config.MAX_PLAYER_RADIUS,
        CAMERA_ZOOM_STEPS: _(config.CAMERA_ZOOM_STEPS).map('min').tail().value(),
        AUTHORS          : ['Michael Clayton', 'Jared Sprague'],
        skins            : _(ZOR.PlayerSkins).map(_.partial(_.pick, _, 'meta')).sortBy('meta.sort').value(), // get the meta for every skin and sort them
        selected_skin    : localStorage.skin || 'default',
        leaders          : [],
        leaderboard      : {
            activeBoard: 'leaders_1_day',
            data: {},
        },
        is_mobile        : isMobile.any,
        loading          : true,
        screen_x         : 0,
        screen_y         : 0,
        player_size      : 0,
        numberCommas     : function numberCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        showAd           : showAd,
        flip_x           : JSON.parse(localStorage.flip_x || "false"),
        flip_y           : JSON.parse(localStorage.flip_y || "false"),
        hide_own_trail   : JSON.parse(localStorage.hide_own_trail || "false"),
        steering         : localStorage.steering || "follow",
        music_enabled    : config.MUSIC_ENABLED,
        volume           : {
            music : config.VOLUME_MUSIC_INITIAL,
            sfx   : config.VOLUME_SFX_INITIAL,
        },
        marquee_messages : [],
        marquee_index    : 0,
    };

    // the public functions exposes by this module (may be modified during execution)
    var api = {
        STATES      : STATES,
        ACTIONS     : ACTIONS,
        data        : uidata,
        state       : state,
        on          : on,
        clearTarget : clearTarget,
        setAndSave  : setAndSave,
        advanceMarquee: advanceMarquee,
    };

    // array of registered on-init handlers
    var init_handlers = [];

    function advanceMarquee() {
        var i = engine.get('marquee_index');
        i += 1;
        i %= uidata.marquee_messages.length;
        engine.set('marquee_index', i);
    }

    function clearTarget() {
        uidata.target = undefined;
    }

    /**
     * Sets UI data and saves to local storage
     * @param key
     * @param value
     */
    function setAndSave(key, value) {
        engine.set(key, value);
        localStorage.setItem(key, value);
    }

    /**
     * The Ractive template engine.  Data + Templates = HTML
     */

    function make_partial( el ) {
        var name = el.id.replace('-template', '');
        var template;
        try {
            template = JSON.parse(el.textContent);
        } catch (e) {
            template = el.textContent;
        }
        return [name, template];
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
        if (!newstate) return uidata.state;
        if (newstate === state()) {
            return;
        }
        else {
            ZOR.Sounds.sfx.state_change.play();
        }
        if (newstate !== uidata.prev_state) {
            uidata.prev_state = uidata.state;
        }
        if (typeof newstate !== 'undefined' && valid_state( newstate ) ) {
            console.log('entering state ' + newstate);
            uidata.state = newstate;
            engine.update();
        }

        // Send google analytics event
        ga('send', {
            hitType: 'event',
            eventCategory: 'StateChange',
            eventAction: newstate,
        });

        return uidata.state;
    }

    /**
     * Simple pass-through to Ractive's event handler.
     */

    function on( event, handler ) {

        // 'init' is a custom event owned by UI.js
        if (event === 'init') {
            if (initialized) {
                handler.call(this);
            }
            else {
                init_handlers.push(handler.bind(this));
            }
        }
        // let Ractive handle the other events
        else {
            engine.on( event, handler );
        }
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
            console.log('Missing browser feature(s): ' + JSON.stringify(missing_feature_names));
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

    function set_screen_size() {
        engine.set('screen_x', window.innerWidth);
        engine.set('screen_y', window.innerHeight);
    }

    function init() {

        var partials = _.map( document.querySelectorAll('script[type="text/ractive"]'), make_partial ); // register all ractive templates as partials

        var mainTemplate;
        try {
            // if the Ractive template was precompiled into JSON, this will
            // succeed.  If it was not precompiled (ie, dev mode), this will
            // fail and fall back to catch.
            mainTemplate = JSON.parse(document.querySelector('#ui-template').textContent);
        } catch (e) {
            mainTemplate = document.querySelector('#ui-template').textContent;
        }

        Ractive.DEBUG = config.DEBUG;
        engine = new Ractive({
            el: '#ui-overlay',
            data: uidata,
            template: mainTemplate,
            partials: _.fromPairs(partials),
        });

        api.engine = engine;
        api.update = get_updater();

        validate_browser_features();

        state( STATES.INITIAL );

        init_events();

        // add active class to UI overlay so it'll show up
        engine.el.classList.add('active');

        // Strip any hidden skins that don't match unlock url
        var i = uidata.skins.length;
        while (i--) {
            var skin = uidata.skins[i];
            if (skin.meta.unlock_url && skin.meta.unlock_url != window.location.search) {
                uidata.skins.splice(i, 1);
            }
        }

        // mark initialized true so future on('init') handlers will be executed
        // immediately
        initialized = true;

        // capture screen size, and future adjustments to screen size
        set_screen_size();
        window.addEventListener( 'resize', set_screen_size, false );

        // periodically advance the help marquee
        setInterval(advanceMarquee, 5432);

        // call all the registered init handlers
        _.each(init_handlers, function (f) { f(); });
    }

    function stateSetter(newState) {
        return function () {
            console.log('changing to ' + newState);
            state(newState);
        };
    }

    function showAd() {
        // There is a weird race condition with googles ads that require a timeout to make it work
        setTimeout(function () {
            console.log("showing ad");
            (adsbygoogle = window.adsbygoogle || []).push({});
        }, 250);
    }

    /**
     * Initialize all the UI event handlers.
     */
    function init_events() {

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
                ZOR.Sounds.sfx,
                _.partial( _.invoke, _, 'setVolume', vol )
            );
            localStorage.volume_sfx = vol;
        });

        on( ACTIONS.SET_STEERING, function ZORSetSteering(e) {
            var value = e.original.target.value;
            if (value === 'follow') {
                config.STEERING = config.STEERING_METHODS.MOUSE_FOLLOW;
                localStorage.steering = 'follow';
            }
            else if (value === 'drag') {
                config.STEERING = config.STEERING_METHODS.MOUSE_DRAG;
                localStorage.steering = 'drag';
            }
            else { return }

            engine.set('steering', value);
        });

        // state change events

        on( ACTIONS.UPDATE_LEADERBOARD, function ZORUpdateLeaderboard(client) {
            client.z_sendLeaderboardsRequest();
        });
        on( ACTIONS.SHOW_LEADERBOARD_1D, function ZORShowLeaderboard1D() {
            engine.set('leaderboard.activeBoard', 'leaders_1_day');
        });
        on( ACTIONS.SHOW_LEADERBOARD_7D, function ZORShowLeaderboard7D() {
            engine.set('leaderboard.activeBoard', 'leaders_7_day');
        });
        on( ACTIONS.SHOW_LEADERBOARD_30D, function ZORShowLeaderboard30D() {
            engine.set('leaderboard.activeBoard', 'leaders_30_day');
        });

        //

        on( ACTIONS.SHOW_MENU_GAME_SCREEN   , stateSetter( STATES.MENU_GAME_SCREEN ) );
        on( ACTIONS.SHOW_MENU_GAME_SCREEN   , stateSetter( STATES.MENU_GAME_SCREEN ) );
        on( ACTIONS.SHOW_MENU_STORE_SCREEN  , stateSetter( STATES.MENU_STORE_SCREEN ) );
        on( ACTIONS.SHOW_MENU_CONFIG_SCREEN , stateSetter( STATES.MENU_CONFIG_SCREEN ) );
        on( ACTIONS.SHOW_MENU_CREDITS_SCREEN, stateSetter( STATES.MENU_CREDITS_SCREEN ) );
        on( ACTIONS.SHOW_TUTORIAL           , stateSetter( STATES.TUTORIAL_SCREEN ) );
        on( ACTIONS.SHOW_LEADERBOARD        , stateSetter( STATES.LEADERBOARD_SCREEN ) );
        on( ACTIONS.SHOW_PLAYING_CONFIG     , stateSetter( STATES.PLAYING_CONFIG ) );
        on( ACTIONS.SHOW_MENU               , stateSetter( STATES.MENU_SCREEN ) );
        on( ACTIONS.SHOW_PREVIOUS, function ZORShowPrevious() {
            state( uidata.prev_state );
        });

        on( ACTIONS.SET_SKIN, function ZORSetSkin(e) {
            engine.set('selected_skin', e.node.value);
            localStorage.setItem('skin', e.node.value);

            // send event to google analytics
            ga('send', {
                hitType: 'event',
                eventCategory: 'button',
                eventAction: 'use_skin_button',
                eventLabel: e.node.value,
            });
            startGame(ZOR.PlayerTypes.PLAYER);
        });

        on( ACTIONS.PLAYER_LOGIN, function ZORLoginHandler() {
            // send event to google analytics
            ga('send', {
                hitType: 'event',
                eventCategory: 'button',
                eventAction: 'play_button',
                eventLabel: 'mouse_click'
            });
            startGame(ZOR.PlayerTypes.PLAYER);
        });

        config.HIDE_OWN_TRAIL = JSON.parse(localStorage.hide_own_trail || "false") ? true : false;

        config.STEERING = config.STEERING_METHODS["MOUSE_" + uidata.steering.toUpperCase()];

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
            engine.set('player_size', 0);
            if (respawnPlayer) {
                // send event to google analytics
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'button',
                    eventAction: 'respawn_button',
                });
                respawnPlayer();
            }
        });

        on( ACTIONS.PLAYER_LOGIN_KEYPRESS, function ZORPlayerLoginKeypressHandler(e) {
            var key = e.original.which || e.original.keyCode;
            var KEY_ENTER = 13;

            if (key === KEY_ENTER) {
                if (startGame) {
                    // send event to google analytics
                    ga('send', {
                        hitType: 'event',
                        eventCategory: 'button',
                        eventAction: 'play_button',
                        eventLabel: 'enter_key'
                    });
                    startGame(ZOR.PlayerTypes.PLAYER);
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

        // populate the marquee with some helpful messages

        uidata.marquee_messages.push('Hold W key or left mouse to speed boost.');

        if (config.STEERING.NAME === 'FOLLOW') {
            uidata.marquee_messages.push('Place your cursor in the middle of the screen to fly straight ahead.');
        }

        uidata.marquee_messages.push('Short speed boosts are best.');

        uidata.marquee_messages.push('Try to predict other players\' trajectories.');

        uidata.marquee_messages.push('Hide behind big spheres if someone is chasing you.');

        uidata.marquee_messages.push('Fly near big players to absorb mass, but be careful!');

        // shuffle the messages

        uidata.marquee_messages = _.shuffle(uidata.marquee_messages);

        // put important message(s) first

        var inIframe = window.frameElement && window.frameElement.nodeName == "IFRAME";
        var indirectVisitor = inIframe || document.referrer !== "";
        if (indirectVisitor) {
            uidata.marquee_messages.unshift('Bookmark us at <a href="http://zor.bio" target="_top">http://<strong>zor.bio</strong></a>!');
        }

    }

    /**
     * Automatically update UI every N frames.  The largest implication is how
     * quickly the leaderboard is updated when new leaderboard data is received
     * from the server.
     */
    function get_updater() {
        return _.throttle( engine.update.bind(engine), 1000 );
    }

    /**
     * Fetch Ractive templates and GLSL shaders, then init UI.
     */
    function fetch_then_init() {
        var needs_fetching = document.querySelector('script[type="text/ractive"]').innerHTML === "";

        if (needs_fetching) {
            var scripts = document.querySelectorAll('script[type="text/ractive"], script[type^=x-shader]');
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

