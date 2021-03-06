/**
 *  This file should contain user interface functions, like displaying messages, manipulating the dom,
 *  handling chat display etc.
 */

// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true,
 ZOR:true,
 _:true,
 startGame:true,
 isMobile:true,
 ga:true,
 Modernizr:true,
 respawnPlayer:true,
 Ractive:true,
 adsbygoogle:true
*/


ZOR.UI = function ZORUI() {
    let engine; // the UI engine, currently Ractive
    let initialized = false;

    /**
     * A list of the browser features that are required to run Zorbio.  The
     * match the names provided by Modernizr.
     */

    let REQUIRED_FEATURES = ['json', 'websockets', 'webgl', 'flexbox'];

    /**
     * The types of mouse cursor.  Corresponds with image filenames.
     */
    const CURSOR_TYPES = {
        pointer: 'images/cursor.png',
        steer0 : 'images/cursor-steer0.png',
        steer1 : 'images/cursor-steer1.png',
        steer2 : 'images/cursor-steer2.png',
        steer3 : 'images/cursor-steer3.png',
    };


    /**
     * An "enum" storing unique values for UI states.
     */

    let STATES = {
        INITIAL                : 'menu-game-screen',
        MENU_SCREEN            : 'menu-game-screen',
        MENU_GAME_SCREEN       : 'menu-game-screen',
        MENU_STORE_SCREEN      : 'menu-store-screen',
        MENU_CONFIG_SCREEN     : 'menu-config-screen',
        MENU_CREDITS_SCREEN    : 'menu-credits-screen',
        MENU_TUTORIAL_SCREEN   : 'menu-tutorial-screen',
        MENU_LEADERBOARD_SCREEN: 'menu-leaderboard-screen',
        PLAYING                : 'playing',
        PLAYING_CONFIG         : 'playing-config',
        RESPAWN_SCREEN         : 'menu-respawn-screen',
        KICKED_SCREEN          : 'kicked-screen',
        GAME_INIT_ERROR        : 'game-init-error',
        SERVER_MSG_SCREEN      : 'server-msg-screen',
    };

    /**
     * An "enum" storing unique values for UI state transitions.
     */

    let ACTIONS = {
        PLAYER_LOGIN_KEYPRESS: 'player-login-keypress',
        PLAYER_LOGIN         : 'player-login',
        PLAYER_RESPAWN       : 'player-respawn',
        PAGE_RELOAD          : 'page-reload',
        SHOW_MENU            : 'show-menu',
        SHOW_MENU_TUTORIAL   : 'show-tutorial',
        SHOW_MENU_LEADERBOARD: 'show-leaderboard',
        SHOW_PLAYING_CONFIG  : 'show-playing-config',
        SHOW_PREVIOUS        : 'show-previous',

        UPDATE_LEADERBOARD  : 'update-leaderboard',
        SHOW_LEADERBOARD_1D : 'show-leaderboard-1d',
        SHOW_LEADERBOARD_7D : 'show-leaderboard-7d',
        SHOW_LEADERBOARD_30D: 'show-leaderboard-30d',

        SHOW_MENU_GAME_SCREEN   : 'show-menu-game-screen',
        SHOW_MENU_STORE_SCREEN  : 'show-menu-store-screen',
        SHOW_MENU_CONFIG_SCREEN : 'show-menu-config-screen',
        SHOW_MENU_CREDITS_SCREEN: 'show-menu-credits-screen',

        TOGGLE_Y_AXIS   : 'toggle-y-axis',
        TOGGLE_X_AXIS   : 'toggle-x-axis',
        TOGGLE_OWN_TRAIL: 'toggle-own-trail',
        VOLUME_MUSIC    : 'volume-music',
        VOLUME_SFX      : 'volume-sfx',
        SET_STEERING    : 'set-steering',
        MOUSE_MOVE      : 'mouse-move',
        CURSOR_ON_GEAR  : 'cursor-on-gear',
        CURSOR_OFF_GEAR : 'cursor-off-gear',

        SET_SKIN: 'set-skin',
    };

    /**
     * The data to pass into templates.
     */

    let uidata = {
        VERSION               : ZOR.VERSION,
        BUILD                 : ZOR.BUILD,
        REF                   : ZOR.REF,
        state                 : '',
        prev_state            : STATES.INITIAL,
        STATES                : STATES,
        ACTIONS               : ACTIONS,
        COLORS                : config.COLORS,
        REQUIRE_ALPHA_KEY     : config.REQUIRE_ALPHA_KEY,
        DEBUG                 : config.DEBUG,
        ENABLE_BACKEND_SERVICE: config.ENABLE_BACKEND_SERVICE,
        MISSING_FEATURES      : [],
        MAX_PLAYER_RADIUS     : config.MAX_PLAYER_RADIUS,
        CAMERA_ZOOM_STEPS     : _(config.CAMERA_ZOOM_STEPS).map('min').tail().value(),
        AUTHORS               : ['Michael Clayton', 'Jared Sprague'],
        skins                 : _.sortBy(ZOR.SkinCatalog, 'sort'), // Sorted skin catalog array
        selected_skin         : localStorage.skin || 'default',
        leaders               : [],
        leaderboard           : {
            activeBoard: 'leaders_1_day',
            data       : {},
        },
        is_mobile   : isMobile.any,
        loading     : true,
        screen_x    : 0,
        screen_y    : 0,
        player_size : 0,
        numberCommas: function numberCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        showAd        : showAd,
        flip_x        : JSON.parse(localStorage.flip_x || 'false'),
        flip_y        : JSON.parse(localStorage.flip_y || 'false'),
        hide_own_trail: JSON.parse(localStorage.hide_own_trail || 'false'),
        steering      : localStorage.steering || 'follow',
        music_enabled : config.MUSIC_ENABLED,
        volume        : {
            music: config.VOLUME_MUSIC_INITIAL,
            sfx  : config.VOLUME_SFX_INITIAL,
        },
        marquee_messages: [],
        marquee_index   : 0,
        target          : undefined,
    };

    // the public functions exposes by this module (may be modified during execution)
    let api = {
        STATES        : STATES,
        ACTIONS       : ACTIONS,
        data          : uidata,
        state         : state,
        on            : on,
        clearTarget   : clearTarget,
        setAndSave    : setAndSave,
        advanceMarquee: advanceMarquee,
    };

    // array of registered on-init handlers
    let init_handlers = [];

    /**
     * advance to the next marquee message
     */
    function advanceMarquee() {
        let i = engine.get('marquee_index');
        i += 1;
        i %= uidata.marquee_messages.length;
        engine.set('marquee_index', i);
    }

    /**
     * Clear the target player name that current player was aiming at
     */
    function clearTarget() {
        engine.set('target', undefined);
    }

    /**
     * Sets UI data and saves to local storage
     * @param {string} key
     * @param {Object} value
     */
    function setAndSave(key, value) {
        engine.set(key, value);
        localStorage.setItem(key, value);
    }

    /**
     * The Ractive template engine.  Data + Templates = HTML
     */

    /**
     * Returns an array with the name and template code
     * @param {Object} el
     * @returns {string[]}
     */
    function make_partial( el ) {
        let name = el.id.replace('-template', '');
        let template;
        try {
            template = JSON.parse(el.textContent);
        }
        catch (e) {
            template = el.textContent;
        }
        return [name, template];
    }

    /**
     * Given a state string, returns true if it's a real, defined state,
     * otherwise false.
     * @param {string} newstate
     * @returns {boolean}
     */
    function valid_state( newstate ) {
        return _.includes( _.values( STATES ), newstate );
    }

    /**
     * Given a valid state, change to that state.  With no arguments, returns
     * current state.
     * @param {string} newstate
     * @returns {string}
     */
    function state( newstate ) {
        if (!newstate || newstate === uidata.state) return uidata.state;

        // play the state change sound, so long as this isn't the *first* state change when the game boots
        if (uidata.state !== '') {
            ZOR.Sounds.sfx.state_change.play();
        }

        if (newstate !== uidata.prev_state) {
            uidata.prev_state = uidata.state;
        }

        if (typeof newstate !== 'undefined' && valid_state( newstate ) ) {
            console.log('entering state ' + newstate);
            uidata.state = newstate;

            // If respawn state show social share buttons
            if (newstate === STATES.RESPAWN_SCREEN) {
                showShareButtons();
            }

            engine.update();
        }

        // Send google analytics event
        ga('send', {
            hitType      : 'event',
            eventCategory: 'StateChange',
            eventAction  : newstate,
        });

        return uidata.state;
    }

    /**
     * Simple pass-through to Ractive's event handler.
     * @param {string} event
     * @param {Function} handler
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
        let missing_feature_names = _.chain(missing_browser_features())
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
     * @returns {Object}
     */
    function missing_browser_features() {
        // find the own (non-inherited properties on the Modernizr object which
        // have a value of false (omitBy defaults to _.identity which grants us
        // falsy values only).
        return _.chain(Modernizr).forOwn().omitBy().value();
    }

    /**
     * Sets the UI screen size based on window
     */
    function set_screen_size() {
        engine.set('screen_x', window.innerWidth);
        engine.set('screen_y', window.innerHeight);
    }

    /**
     * Init the UI
     */
    function init() {
        let partials = _.map( document.querySelectorAll('script[type="text/ractive"]'), make_partial ); // register all ractive templates as partials

        let mainTemplate;
        try {
            // if the Ractive template was precompiled into JSON, this will
            // succeed.  If it was not precompiled (ie, dev mode), this will
            // fail and fall back to catch.
            mainTemplate = JSON.parse(document.querySelector('#ui-template').textContent);
        }
        catch (e) {
            mainTemplate = document.querySelector('#ui-template').textContent;
        }

        Ractive.DEBUG = config.DEBUG;
        engine = new Ractive({
            el      : '#ui-overlay',
            data    : uidata,
            template: mainTemplate,
            partials: _.fromPairs(partials),
        });

        api.engine = engine;
        api.update = get_updater();

        validate_browser_features();

        state( STATES.INITIAL );

        ZOR.Sounds.playMusic('menu');

        init_events();

        // add active class to UI overlay so it'll show up
        engine.el.classList.add('active');

        // Strip any hidden skins that don't match unlock url
        let i = uidata.skins.length;
        while (i--) {
            let skin = uidata.skins[i];
            if (skin.unlock_url && skin.unlock_url !== window.location.search) {
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

        // Initialize the News link
        fetch_then_init_news();

        // call all the registered init handlers
        _.each(init_handlers, function(f) {
            f();
        });
    }

    /**
     * Returns a setter wrapper function for setting the state
     * @param {string} newState
     * @returns {Function}
     */
    function stateSetter(newState) {
        return function() {
            console.log('changing to ' + newState);
            state(newState);
        };
    }

    /**
     * Shows the google ad
     */
    function showAd() {
        // There is a weird race condition with googles ads that require a timeout to make it work
        setTimeout(function() {
            console.log('showing ad');
            (adsbygoogle = window.adsbygoogle || []).push({});
            if (adsbygoogle) {
                // suppress eslint no-unused-vars error
            }
        }, 250);
    }

    /**
     * shows the social share buttons
     */
    function showShareButtons() {
        // hide social share buttons
        const shareButtons = document.getElementById('st-2');
        if (shareButtons) shareButtons.style.display = 'block';
    }

    /**
     * hides the social share buttons
     */
    function hideShareButtons() {
        // hide social share buttons
        const shareButtons = document.getElementById('st-2');
        if (shareButtons) shareButtons.style.display = 'none';
    }

    /**
     * Wrapper for global startGame() to do any UI related tasks before starting the game
     * @param {string} playerType
     */
    function uiStartGame(playerType) {
        hideShareButtons();
        startGame(playerType);
    }

    /**
     * Initialize all the UI event handlers.
     */
    function init_events() {
        if (localStorage.alpha_key) {
            engine.set('alpha_key', localStorage.alpha_key);
        }
        if (localStorage.player_name) {
            engine.set('player_name', localStorage.player_name);
        }

        // volume change handlers

        on( ACTIONS.VOLUME_MUSIC, function ZORVolumeMusic() {
            let vol = this.get('volume.music');
            ZOR.Sounds.musicVolume(vol);
        });

        on( ACTIONS.VOLUME_SFX, function ZORVolumeSfx() {
            let vol = this.get('volume.sfx');
            ZOR.Sounds.sfxVolume(vol);
        });

        on( ACTIONS.SET_STEERING, function ZORSetSteering(context, e) {
            let value = e.target.value;
            if (value === 'follow') {
                config.STEERING = config.STEERING_METHODS.MOUSE_FOLLOW;
                localStorage.steering = 'follow';
            }
            else if (value === 'drag') {
                config.STEERING = config.STEERING_METHODS.MOUSE_DRAG;
                localStorage.steering = 'drag';
            }
            else {
                return;
            }

            engine.set('steering', value);
        });

        // mouse move handler for cursor positioning

        // first, a mildly hacky way to turn the cursor back into a pointer,
        // during gameplay, if it's over the gear
        let cursorOnGear = false;
        let cursorImg = document.querySelector('#cursor');
        on( ACTIONS.CURSOR_ON_GEAR, () => cursorOnGear = true );
        on( ACTIONS.CURSOR_OFF_GEAR, () => cursorOnGear = false );
        on( ACTIONS.MOUSE_MOVE, function ZORMouseMove(context, cursor) {
            let left = `${cursor.x}px`;
            let top = `${cursor.y}px`;
            let offset;
            let angle;
            let src;
            let transform;
            let transformOrigin;

            if (state() === STATES.PLAYING) {
                if (cursorOnGear) {
                    src    = CURSOR_TYPES.pointer;
                    angle  = 0;
                    offset = [0, 0];
                }
                else {
                    src    = CURSOR_TYPES[`steer${cursor.quantum}`];
                    angle  = cursor.angle;
                    offset = [20, 60];
                }
            }
            else {
                src    = CURSOR_TYPES.pointer;
                angle  = 0;
                offset = [0, 0];
            }

            // transform = `rotate(${angle}rad)`;
            transform = `translate(-${offset[0]}px, -${offset[1]}px) rotate(${angle}rad)`;
            transformOrigin = `${offset[0]}px ${offset[1]}px`;

            if (cursor.quantum === 0) {
                transform += ` scale(0.5)`;
            }

            cursorImg.style.display   = isMobile.any ? 'none' : 'block';
            cursorImg.src             = src;
            cursorImg.style.left      = left;
            cursorImg.style.top       = top;
            cursorImg.style.transform = transform;
            cursorImg.style.transformOrigin = transformOrigin;
        });

        // state change events

        on( ACTIONS.UPDATE_LEADERBOARD, function ZORUpdateLeaderboard(context, client) {
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

        on( ACTIONS.SHOW_MENU_GAME_SCREEN, stateSetter( STATES.MENU_GAME_SCREEN ) );
        on( ACTIONS.SHOW_MENU_GAME_SCREEN, stateSetter( STATES.MENU_GAME_SCREEN ) );
        on( ACTIONS.SHOW_MENU_STORE_SCREEN, stateSetter( STATES.MENU_STORE_SCREEN ) );
        on( ACTIONS.SHOW_MENU_CONFIG_SCREEN, stateSetter( STATES.MENU_CONFIG_SCREEN ) );
        on( ACTIONS.SHOW_MENU_CREDITS_SCREEN, stateSetter( STATES.MENU_CREDITS_SCREEN ) );
        on( ACTIONS.SHOW_MENU_TUTORIAL, stateSetter( STATES.MENU_TUTORIAL_SCREEN ) );
        on( ACTIONS.SHOW_MENU_LEADERBOARD, stateSetter( STATES.MENU_LEADERBOARD_SCREEN ) );
        on( ACTIONS.SHOW_PLAYING_CONFIG, stateSetter( STATES.PLAYING_CONFIG ) );
        on( ACTIONS.SHOW_MENU, stateSetter( STATES.MENU_SCREEN ) );
        on( ACTIONS.SHOW_PREVIOUS, function ZORShowPrevious() {
            state( uidata.prev_state );
        });

        on( ACTIONS.SET_SKIN, function ZORSetSkin(context, skin) {
            engine.set('selected_skin', skin);
            localStorage.setItem('skin', skin);

            // send event to google analytics
            ga('send', {
                hitType      : 'event',
                eventCategory: 'button',
                eventAction  : 'use_skin_button',
                eventLabel   : skin,
            });
            uiStartGame(ZOR.PlayerTypes.PLAYER);
        });

        on( ACTIONS.PLAYER_LOGIN, function ZORLoginHandler() {
            // send event to google analytics
            ga('send', {
                hitType      : 'event',
                eventCategory: 'button',
                eventAction  : 'play_button',
                eventLabel   : 'mouse_click',
            });
            uiStartGame(ZOR.PlayerTypes.PLAYER);
        });

        config.HIDE_OWN_TRAIL = JSON.parse(localStorage.hide_own_trail || 'false') ? true : false;

        config.STEERING = config.STEERING_METHODS['MOUSE_' + uidata.steering.toUpperCase()];

        config.X_AXIS_MULT = JSON.parse(localStorage.flip_x || 'false') ? -1 : 1;
        config.Y_AXIS_MULT = JSON.parse(localStorage.flip_y || 'false') ? -1 : 1;
        on( ACTIONS.TOGGLE_Y_AXIS, axisToggler('y'));
        on( ACTIONS.TOGGLE_X_AXIS, axisToggler('x'));
        on( ACTIONS.TOGGLE_OWN_TRAIL, trailToggler);

        /**
         * Returns a function for toggling the Y axis
         * @param {string} axis
         * @returns {Function}
         */
        function axisToggler(axis) {
            return function ZORToggleYAxis(context, e) {
                let lsKey = 'flip_'+axis.toLowerCase();
                let confKey = axis.toUpperCase()+'_AXIS_MULT';
                if (e.target.checked) {
                    config[confKey] = -1;
                    uidata[lsKey] = true;
                }
                else {
                    config[confKey] = 1;
                    uidata[lsKey] = false;
                }
                localStorage[lsKey] = uidata[lsKey];
            };
        }

        /**
         * toggles players trail based on checkbox
         * @param {object} context
         * @param {object} e
         */
        function trailToggler(context, e) {
            if (e.target.checked) {
                ZOR.UI.setAndSave( 'hide_own_trail', true );
                config.HIDE_OWN_TRAIL = true;
            }
            else {
                ZOR.UI.setAndSave( 'hide_own_trail', false );
                config.HIDE_OWN_TRAIL = false;
            }
        }

        on( ACTIONS.PAGE_RELOAD, location.reload.bind(location) );

        on( ACTIONS.PLAYER_RESPAWN, function ZORRespawnButtonHandler() {
            engine.set('player_size', 0);
            if (respawnPlayer) {
                // send event to google analytics
                ga('send', {
                    hitType      : 'event',
                    eventCategory: 'button',
                    eventAction  : 'respawn_button',
                });
                hideShareButtons();
                respawnPlayer();
            }
        });

        on( ACTIONS.PLAYER_LOGIN_KEYPRESS, function ZORPlayerLoginKeypressHandler(context, e) {
            let key = e.which || e.keyCode;
            let KEY_ENTER = 13;

            if (key === KEY_ENTER) {
                if (startGame) {
                    // send event to google analytics
                    ga('send', {
                        hitType      : 'event',
                        eventCategory: 'button',
                        eventAction  : 'play_button',
                        eventLabel   : 'enter_key',
                    });
                    uiStartGame(ZOR.PlayerTypes.PLAYER);
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

        uidata.marquee_messages.push('Hold S key or right mouse to stop.');

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

        let inIframe = window.frameElement && window.frameElement.nodeName === 'IFRAME';
        let indirectVisitor = inIframe || document.referrer !== '';
        if (indirectVisitor) {
            uidata.marquee_messages.unshift('Bookmark us at <a href="http://zorb.io" target="_top">http://<strong>zorb.io</strong></a>!');
        }
    }

    /**
     * Fetches the news from remote scripta-news repo and sets it in the engine
     */
    function fetch_then_init_news() {
        const url = 'https://raw.githubusercontent.com/ScriptaGames/scripta-news/master/news.json';

        fetch(url).then((response) => {
            if (response.status === 200) {
                response.text().then((body) => {
                    try {
                        const news = JSON.parse(body);

                        // TODO: In the future rotate through news articles with most recent first
                        if (Array.isArray(news) && news[0].link && news[0].text) {
                            engine.set('news_link', news[0].link);
                            engine.set('news_text', news[0].text);
                        }
                    }
                    catch (e) {
                        console.error('Caught exception parsing news.json', e);
                    }
                });
            }
        });
    }

    /**
     * Automatically update UI every N frames.  The largest implication is how
     * quickly the leaderboard is updated when new leaderboard data is received
     * from the server.
     * @returns {Function}
     */
    function get_updater() {
        return _.throttle( engine.update.bind(engine), 1000 );
    }

    /**
     * Fetch Ractive templates and GLSL shaders, then init UI.
     */
    function fetch_then_init() {
        let needs_fetching = document.querySelector('script[type="text/ractive"]').innerHTML === '';

        if (needs_fetching) {
            let scripts = document.querySelectorAll('script[type="text/ractive"], script[type^=x-shader]');
            Promise.all( _.map(scripts, fetch_inject) ).then( init );
        }
        else {
            init();
        }
    }

    /**
     * Given a script element, fetch its `src` and inject the response into the element.
     * @param {Object} el
     * @returns {Object}
     */
    function fetch_inject(el) {
        return fetch( el.src ).then( get_fetch_text ).then( mk_script_injector(el) );
    }

    /**
     * From a `fetch` API response, get the text.
     * @param {Object} response
     * @returns {string}
     */
    function get_fetch_text(response) {
        return response.text();
    }

    /**
     * Return a function which will inject text into an element.
     * @param {Object} element
     * @returns {Function}
     */
    function mk_script_injector(element) {
        return function script_injector(text) {
            element.innerHTML = text;
        };
    }

    fetch_then_init();

    return api;
}();

