/**
 * Configuration values.  Values defined here are available to both the client
 * and the server.
 */

// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global linodeNearLocation:true
global _:true
global ZOR:true
*/

const NODEJS_CONFIG = typeof module !== 'undefined' && module.exports;

if (NODEJS_CONFIG) {
    // noinspection JSConstantReassignment
    global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
    global._    = require( 'lodash' );
    global.ZOR  = { Env: require( '../common/environment.js' ) };
}

let config = {};

config.DEBUG             = false;
config.AUTO_PLAY         = false;
config.REQUIRE_ALPHA_KEY = false;

////////////////////////////////////////////////////////////////////////
//                           WORLD SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.WORLD_SIZE       = 2000;
config.WORLD_HYPOTENUSE = Math.sqrt( Math.pow( Math.sqrt( Math.pow( config.WORLD_SIZE, 2 )
    + Math.pow( config.WORLD_SIZE, 2 ) ), 2 ) + Math.pow( config.WORLD_SIZE, 2 ) );

////////////////////////////////////////////////////////////////////////
//                           BOT SETTINGS                             //
////////////////////////////////////////////////////////////////////////
config.MAX_BOTS             = 20;
config.MAX_BOT_RADIUS       = 100;
config.BOT_CHASE_TIME_MIN   = 20000;   // Min time a bot will chase a player
config.BOT_CHASE_TIME_MAX   = 45000;   // Max time a bot will chase a player
config.BOT_DEFAULT_MOVEMENT = 'curve'; // Default movement pattern for bots

////////////////////////////////////////////////////////////////////////
//                          NETWORK SETTINGS                          //
////////////////////////////////////////////////////////////////////////
config.ENABLE_WEB_SERVER            = true;   // Run a local web server, will be http unless ENABLE_HTTPS is enabled then it will be https
config.ENABLE_HTTPS                 = true;   // Should we use https for both static and websocket requests
config.HTTP_PORT                    = 8080;   // Port the server will listen on for http requests
config.HTTPS_PORT                   = 31000;  // Port the server will listen on for both https and websocket server
config.WS_LISTEN_PORT               = config.ENABLE_HTTPS ? config.HTTPS_PORT : 31000;  // Port that the WebSocket server will listen on
config.WS_CONNECT_PORT              = config.ENABLE_HTTPS ? 443 : 31000; // Port that the client will connect to for websockets on prod this is 443 because of ssl on the NodeBalancer and cloudflare
config.NUM_GAME_INSTANCES           = 1;      // How many game instances to spawn on the server
config.MAX_PLAYERS_PER_INSTANCE     = 40;     // Max players per instance
config.HEARTBEAT_ENABLE             = true;
config.HEARTBEAT_TIMEOUT            = 30000;  // how long before a client is considered disconnected
config.HEARTBEAT_CHECK_INTERVAL     = 1000;   // server heartbeat test interval
config.HEARTBEAT_PULSE_INTERVAL     = 5000;   // client heartbeat pulse
config.TICK_SLOW_INTERVAL           = 200;    // General server updates in milliseconds
config.TICK_FAST_INTERVAL           = 50;     // How often actors update their position in milliseconds
config.LEADERBOARD_REFRESH_INTERVAL = 900000; // How often to refresh leaderboard on the server from backend service
config.PENDING_PLAYER_CAPTURE_TTL   = 3000;   // how long pending player capture lives before it expires in milliseconds
config.CHECK_VERSION                = false;   // check for latest version of the game through the zapi
config.CHECK_VERSION_INTERVAL       = 30000;  // how often to check for new version
config.LEADERS_LENGTH               = 10;     // How many players to include in the leaders array
config.BIN_PP_POSITIONS_LENGTH      = 29;
config.CHECK_ORIGIN                 = true;
config.RECENT_CLIENT_DATA_LENGTH    = 100;    // how many recent data points to keep from the client like pings
config.CLOSE_NO_RESTART             = 4000;   // 4000-4999 application reserved close code in WebSocket spec
config.STATUS_LOG_DELAY             = 15000;  // how many milliseconds to wait between status log output
config.ENABLE_RAPID_UPDATES         = true;   // If enabled will send and broadcast player position updates every frame
config.ENABLE_BACKEND_SERVICE       = true;   // Enable communication with a remote api (currently app42)
config.TLS_CERT_FILE                = '/etc/pki/tls/certs/zorb.io.pem';
config.TLS_KEY_FILE                 = '/etc/pki/tls/private/zorb.io.key';

if (!NODEJS_CONFIG) {
    // Gets the name of the nearest load balancer
    config.GET_NEAR_BALANCER = function getNearBalancer() {
        // allow local storage to override, in case me make this a user setting in the future
        let balancer = localStorage.getItem( 'balancer' );

        if (balancer) {
            return balancer;  // local storage is set return it
        }

        let linode_location = linodeNearLocation();
        console.log( 'Location near: ', linode_location );

        // For now all client geographical locations will route to a single server
        // In the future if we want to run multiple regions we can update this
        switch (linode_location) {
            case 'london':
            case 'frankfurt':
            case 'singapore':
            case 'fremont':
            case 'dallas':
            case 'newark':
            default:
                balancer = 'fremont'; // Default to US West region since that's where we are currently hosted in OSD
        }

        return balancer;
    };
    config.BALANCER = config.GET_NEAR_BALANCER();
}

config.BALANCERS = Object.freeze( {
    LOCAL      : 'localhost',
    fremont    : 'uswest.zorb.io',
    dallas     : 'uscentral.zorb.io',
    newark     : 'useast.zorb.io',
    london     : 'uk.zorb.io',
    frankfurt  : 'eu.zorb.io',
    singapore  : 'apac.zorb.io',
    zor_bio    : 'zor.bio',
    zor_bio_www: 'www.zor.bio',
    zorb_io    : 'zorb.io',
    zorb_io_www: 'www.zorb.io',
} );

////////////////////////////////////////////////////////////////////////
//                          PLAYER SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.INITIAL_PLAYER_RADIUS = 5;
config.MAX_PLAYER_RADIUS     = 150;

// https://www.desmos.com/calculator/dphm84crab
config.MAX_PLAYER_SPEED  = 2;
config.STATIONARY_RADIUS = config.MAX_PLAYER_RADIUS + 25; // the size at which speed = 0 (hint: make it bigger than max_size or you'll get stuck when huge!)

/**
 * @param {number} r
 * @returns {number}
 */
config.PLAYER_CAPTURE_VALUE = function PlayerCaptureValue(r) {
    return r / 2;
};

/**
 * @param {number} r
 * @returns {number}
 */
config.PLAYER_GET_SPEED = function PlayerGetSpeed(r) {
    // https://www.desmos.com/calculator/dphm84crab
    let s = config.MAX_PLAYER_SPEED;
    return s - ((r * s) / config.STATIONARY_RADIUS);
};

/**
 * @param {number} radius
 * @returns {number}
 */
config.GET_PADDED_INT = function PlayerGetScore(radius) {
    return Math.floor( radius * 10 );
};

config.INITIAL_PLAYER_SCORE = config.GET_PADDED_INT( config.INITIAL_PLAYER_RADIUS );
config.AUTO_RUN_ENABLED     = true;
config.STEERING_METHODS = Object.freeze( { // enum-ish
    MOUSE_DRAG: {
        NAME : 'DRAG',
        SPEED: 0.18,
    },
    MOUSE_FOLLOW: {
        // https://www.desmos.com/calculator/wszojiyufd
        NAME : 'FOLLOW',
        WELL : 0.01, // mouse follow deadzone, defined as percentage distance from screen center
        SLOPE: 10,   // rate at which rotation increases once outside the well
        SPEED: 0.3,  // higher makes camera rotate faster
    },
} );
config.STEERING         = config.STEERING_METHODS.MOUSE_FOLLOW;

config.Y_AXIS_MULT = 1;
config.X_AXIS_MULT = 1;

config.HIDE_OWN_TRAIL = false;

////////////////////////////////////////////////////////////////////////
//                          STEERING HELPER                           //
////////////////////////////////////////////////////////////////////////
config.STEERING_HELPER_TIMER_TICK      = 50;     // ms tick of center zone timer
config.STEERING_HELPER_LINGER_TIME     = 600;    // ms duration to consider mouse lingering in center
config.STEERING_HELPER_DETECT_DURATION = 10000;  // how long to spend detecting if player can steer
config.STEERING_HELPER_MAX_TOAST_TIME  = 10000;  // maximum time to display the toast

////////////////////////////////////////////////////////////////////////
//                           ABILITY SETTINGS                         //
////////////////////////////////////////////////////////////////////////

config.ABILITY_SPEED_BOOST_DURATION   = 500;  // milliseconds that speed boost will last
config.ABILITY_SPEED_BOOST_MIN_SCALE  = config.INITIAL_PLAYER_RADIUS;   // min scale be fore speed boost can be used
config.ABILITY_SPEED_BOOST_MULTIPLIER = 1.75; // percent speed increase
config.ABILITY_SPEED_BOOST_PENALTY    = 0.05;   // Initial penalty, increases the longer active

config.DRAIN_MAX_DISTANCE    = 300; // distance at which draining starts
config.DRAIN_PINCH_STRENGTH  = 0.4;
config.DRAIN_RADIO_FREQUENCY = 65;  // how quickly the radio waves flow down the drain beam, higher is slower
config.DRAIN_SIZE_INFLUENCE  = 0.4; // bonus percentage to drain due from relative player size (bonus scales down as player sizes get closer)

////////////////////////////////////////////////////////////////////////
//                           FOOD SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.FOOD_DENSITY                = 32;       // How much food there is, total food = this number cubed
config.FOOD_VALUE                  = 0.5;      // amount to increase sphere by when food is consumed
config.FOOD_RESPAWN_TIME           = 30000;    // Respawn time for food in milliseconds
config.FOOD_RESPAWN_ANIM_DURATION  = 60;       // frames
config.FOOD_CAPTURE_ASSIST         = 1.0;      // this number is added to player's radius for food capturing
config.FOOD_MAP_TYPE               = 'curves';
config.FOOD_COLORING_TYPE          = 'hsl01';
config.FOOD_COLORING_SINE_SEGMENTS = 8;        // with sine-cycle coloring, how many color cycles along each axis

/**
 * @param {number} r
 * @returns {number}
 */
config.FOOD_GET_VALUE = function FoodGetValue(r) {
    // give food value diminishing returns to prevent runaway growth
    // https://www.desmos.com/calculator/uubp5kvnyo
    return (config.FOOD_VALUE / (r - 4));
};

////////////////////////////////////////////////////////////////////////
//                         VALIDATION SETTINGS                        //
////////////////////////////////////////////////////////////////////////

config.ENABLE_VALIDATION                = true;   // enable validation checks on the server to prevent cheating
config.FOOD_CAPTURE_EXTRA_TOLERANCE     = 10;     // extra distance that we'll tolerate for valid food capture
config.PLAYER_CAPTURE_EXTRA_TOLERANCE   = 1;      // extra distance that we'll tolerate for valid player capture
config.SPEED_EXTRA_TOLERANCE            = 0.4;    // extra speed tolerance for movement validation
config.PLAYER_SCALE_EXTRA_TOLERANCE     = 0.1;    // extra tolerance for player scale
config.PLAYER_POSITIONS_WINDOW          = 30;     // number of recent positions to save for the player for validation rewind
config.INFRACTION_TOLERANCE_FOOD        = 20;     // how many food infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_PCAP        = 1;      // how many player capture infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SCALE       = 1;      // how many scale infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SPEED       = 15;     // how many active speed infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SPEED_BURST = 3;      // how many speed bursts a player can have before they are kicked
config.MOVE_VALIDATION_SAMPLE_RATE      = 5;      // How often to sample, 1 would be ever time, 10 would be every 10th check
config.INFRACTION_SPEED_EXPIRE          = 10000;  // How long speed infractions last before they expire
config.SPEED_BURST_DETECTION_WINDOW     = 4;      // How many active speed infractions will trigger a burst detection but not kick player
config.LOADING_WAIT_DURATION            = 10000;  // How many milliseconds to wait before starting to track movement validation
config.MAX_PLAYER_NAME_LENGTH           = 20;     // How many characters can be in the player name
config.MAX_NOT_IN_MODEL_ERRORS          = 100;    // How many not-in-model errors before kicking the client

////////////////////////////////////////////////////////////////////////
//                            GFX SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.FOG_ENABLED                       = true;
config.FOG_NEAR                          = 100;
config.FOG_FAR                           = 1000;
config.FOG_COLOR                         = 0x000000;
config.INITIAL_CAMERA_DISTANCE           = 50;
config.WALL_GRID_SEGMENTS                = 20;
config.INITIAL_FOV                       = 50;
config.PLAYER_MOVE_LERP_WEIGHT           = 0.3;
config.PLAYER_SPHERE_POLYCOUNT           = 32; // height and width segments of the spheres
config.FOOD_ALPHA_ENABLED                = false;
config.LAG_SCALE_ENABLE                  = true;
config.REQUIRED_WEBGL_EXTENSIONS         = ['ANGLE_instanced_arrays'];
config.TRAIL_LINE_LENGTH                 = 100;  // Other players line length
config.PLAYER_TRAIL_LINE_LENGTH          = 40;   // Current player line length
config.TRAIL_LINE_WIDTH                  = 0.3;
config.CAPTURE_PARTICLE_ATTRACTION_SPEED = 0.994;

////////////////////////////////////////////////////////////////////////
//                            CAMERA SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.TITLE_CAMERA_SPIN_SPEED      = 0.001;
config.CAMERA_ZOOM_STEP_SIZE        = 0.0175;
config.CAMERA_ZOOM_DISTANCE_INITIAL = 100;
config.CAMERA_ZOOM_DISTANCE_FINAL   = 500;
config.CAMERA_ZOOM_STEP_BUFFER      = 0.5;  // size buffer before zooming out or zooming in to prevent flip-flopping
config.CAMERA_ZOOM_STEP_S           = (config.CAMERA_ZOOM_DISTANCE_FINAL - config.CAMERA_ZOOM_DISTANCE_INITIAL)
    / (config.MAX_PLAYER_RADIUS - config.INITIAL_PLAYER_RADIUS);
config.GET_CAMERA_MIN_DISTANCE      = function getCameraMinDistance(r) {
    // https://www.desmos.com/calculator/ceeki1bpbk
    return (Math.floor( r * config.CAMERA_ZOOM_STEP_S * config.CAMERA_ZOOM_STEP_SIZE ) / config.CAMERA_ZOOM_STEP_SIZE)
        + config.CAMERA_ZOOM_DISTANCE_INITIAL;
};
config.CAMERA_ZOOM_STEPS            = {};

/**
 * This generates an array of zoom steps that the camera should either zoom out when a sphere scale gets big
 * or zoom in when a sphere shrinks
 */
function generateCameraZoomSteps() {
    let scale        = config.INITIAL_PLAYER_RADIUS;
    let min_scale    = 0;
    let cur_distance = config.GET_CAMERA_MIN_DISTANCE( scale );
    let new_dist     = 0;

    while (scale <= config.MAX_PLAYER_RADIUS * 2) {
        new_dist = config.GET_CAMERA_MIN_DISTANCE( scale );

        if (new_dist > cur_distance) {
            let dist = Math.floor( cur_distance );

            config.CAMERA_ZOOM_STEPS[dist] = {
                min: min_scale,
                max: scale,
            };

            min_scale    = scale;
            cur_distance = new_dist;
        }

        scale += 0.1;
    }
}

generateCameraZoomSteps();

////////////////////////////////////////////////////////////////////////
//                            UI SETTINGS                             //
////////////////////////////////////////////////////////////////////////
config.LEADERBOARD_LENGTH = 20;

config.COLORS = [
    // new colors
    '#e5353a',
    '#e53570',
    '#e535c4',
    '#7135e5',
    '#353de5',
    '#3588e5',
    '#35dde5',
    '#35e5a3',
    '#35e569',
    '#36e535',
    '#96e535',
    '#e5bf35',
    '#e57035',
    '#e53f35',
    '#e40000',

    // current colors
    '#38FF4D',
    '#38FFC3',
    '#417AFF',
    '#41ACFF',
    '#5941FF',
    '#99FF38',
    '#A040FF',
    '#E140FF',
    '#F8FF38',
    '#FF386A',
    '#FF6B38',
    '#FF6DD2',
    '#FFB638',
    '#FFF42E',
];


////////////////////////////////////////////////////////////////////////
//                           SOUND SETTINGS                           //
////////////////////////////////////////////////////////////////////////

if (!NODEJS_CONFIG) {
    config.VOLUME_MUSIC_INITIAL = localStorage.volume_music || 0.4;
    config.VOLUME_SFX_INITIAL   = localStorage.volume_sfx || 0.9;
}
config.MUSIC_ENABLED          = true;
config.SFX_FOOD_CAPTURE_TONES = [
    'D3',
    'E3',
    'G3',
    'G4',
    'A3',
    'A4',
    'D4',
    'B3',
    'B4',
    'C3',
    'E4',
    'Gb3',
];
config.VOLUME_FOOD_CAPTURE    = 0.05;
config.VOLUME_FALLOFF_RATE    = 2; // the higher this is, the more quickly volume will decreate with distance

////////////////////////////////////////////////////////////////////////
//                      BROWSER FEATURE SETTINGS                      //
////////////////////////////////////////////////////////////////////////

config.BROWSER_FORCE_DISABLED_FEATURES = []; // these items will be forcibly set to disabled, for testing purposes.  for example, ['json', 'webgl']

// Merge environment-specific settings into config
_.assign( config, ZOR.Env );

if (NODEJS_CONFIG) {
    module.exports = config;
}
else {
    // balancer is only used on the client
    config.BALANCER = config.BALANCERS[config.BALANCER];

    // Disable console.log on the client, in production.  This should really go
    // into a client init function, but it's here for now.
    if (!config.DEBUG) {
        console.log = function() {
        };
    }
}
