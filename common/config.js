// Configuration values.  Values defined here are available to both the client and
// the server.

var NODEJS = typeof module !== 'undefined' && module.exports;


if (NODEJS) {
    global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
    global.THREE = require('three');
    var _ = require('lodash');
    var ZOR = { Env: require('../common/environment.js') };
}

var config = {};

config.DEBUG = false;
config.AUTO_PLAY = false;
config.REQUIRE_ALPHA_KEY = false;

////////////////////////////////////////////////////////////////////////
//                           WORLD SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.WORLD_SIZE       = 1600;
config.WORLD_HYPOTENUSE = Math.sqrt( Math.pow( Math.sqrt( Math.pow( config.WORLD_SIZE, 2 ) + Math.pow( config.WORLD_SIZE, 2 ) ), 2 ) + Math.pow( config.WORLD_SIZE, 2 ));
config.MAX_BOTS         = 12;
config.MAX_BOT_RADIUS   = 100;

////////////////////////////////////////////////////////////////////////
//                          NETWORK SETTINGS                          //
////////////////////////////////////////////////////////////////////////

config.PORT                     = 80;
config.NUM_GAME_INSTANCES       = 4;      // How many game instances to spawn on the server
config.MAX_PLAYERS_PER_INSTANCE = 25;     // Max players per instance
config.HEARTBEAT_ENABLE         = true;
config.HEARTBEAT_TIMEOUT        = 30000;  // how long before a client is considered disconnected
config.HEARTBEAT_CHECK_INTERVAL = 1000;   // server heartbeat test interval
config.HEARTBEAT_PULSE_INTERVAL = 5000;   // client heartbeat pulse
config.TICK_SLOW_INTERVAL       = 200;    // General server updates in milliseconds
config.TICK_FAST_INTERVAL       = 50;     // How often actors update their position in milliseconds
config.PENDING_PLAYER_CAPTURE_TTL = 3000; // how long pending player capture lives before it expires in milliseconds
config.CHECK_VERSION            = true;   // check for latest version of the game through the zapi
config.CHECK_VERSION_INTERVAL   = 60000;  // how often to check for new version
config.LEADERS_LENGTH           = 10;     // How many players to include in the leaders array
config.BIN_PP_POSITIONS_LENGTH  = 29;
config.ORIGIN                   = 'http://zor.bio'; // the origin that's allowed to connect to websocket server
config.RECENT_CLIENT_DATA_LENGTH = 100;   // how many recent data points to keep from the client like pings
config.CLOSE_NO_RESTART         = 4000;    // 4000-4999 application reserved close code in WebSocket spec

if (!NODEJS) {
    // Gets the name of the nearest load balancer
    config.GET_NEAR_BALANCER = function getNearBalancer() {
        // allow local storage to override, in case me make this a user setting in the future
        var balancer = localStorage.getItem('balancer');

        if (balancer) {
            return balancer;  // local storage is set return it
        }

        var linode_location = linodeNearLocation();

        console.log("Nearest linode location: ", linode_location);

        switch (linode_location) {
            //TODO: Send to seprate balancer when they are available
            case 'london':
            case 'frankfurt':
            case 'singapore':
            case 'fremont':
            case 'newark':
            case 'dallas':
                balancer = 'dallas'; // For now dallas is the only balancer for dev
                break;
            default:
                balancer = 'dallas';
        }

        return balancer;
    };
    config.BALANCER = config.GET_NEAR_BALANCER();
    config.BALANCERS = Object.freeze({
        LOCAL:     'ws://localhost',
        fremont:   'ws://fremont.zor.bio',
        dallas:    'ws://na.zor.bio',
        newark:    'ws://newark.zor.bio',
        london:    'ws://london.zor.bio',
        frankfurt: 'ws://frankfurt.zor.bio',
        singapore: 'ws://singapore.zor.bio',
    });
}

////////////////////////////////////////////////////////////////////////
//                          PLAYER SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.INITIAL_PLAYER_RADIUS = 5;
config.MAX_PLAYER_RADIUS     = 150;

// https://www.desmos.com/calculator/dphm84crab
config.MAX_PLAYER_SPEED      = 2;
config.STATIONARY_RADIUS     = config.MAX_PLAYER_RADIUS + 25; // the size at which speed = 0 (hint: make it bigger than max_size or you'll get stuck when huge!)

config.PLAYER_CAPTURE_VALUE  = function PlayerCaptureValue( r ) { return r / 2; };
config.PLAYER_GET_SPEED      = function PlayerGetSpeed( r ) {
    // https://www.desmos.com/calculator/dphm84crab
    var s = config.MAX_PLAYER_SPEED;
    return s - ((r * s) / config.STATIONARY_RADIUS);
};
config.PLAYER_GET_SCORE      = function PlayerGetScore( radius ) {
    return Math.floor(radius * 10);
};
config.AUTO_RUN_ENABLED      = true;
config.STEERING_METHODS      = Object.freeze({ // enum-ish
    MOUSE_DRAG: {
        NAME: 'DRAG',
        SPEED : 0.2,
    },
    MOUSE_FOLLOW: {
        // https://www.desmos.com/calculator/wszojiyufd
        NAME  : 'FOLLOW',
        WELL  : 0.01, // mouse follow deadzone, defined as percentage distance from screen center
        SLOPE : 10,   // rate at which rotation increases once outside the well
        SPEED : 0.3,  // higher makes camera rotate faster
    },
});
config.STEERING = config.STEERING_METHODS.MOUSE_FOLLOW;

config.Y_AXIS_MULT = 1;
config.X_AXIS_MULT = 1;

////////////////////////////////////////////////////////////////////////
//                           ABILITY SETTINGS                         //
////////////////////////////////////////////////////////////////////////

config.ABILITY_SPEED_BOOST_DURATION = 500;  // milliseconds that speed boost will last
config.ABILITY_SPEED_BOOST_MIN_SCALE = config.INITIAL_PLAYER_RADIUS;   // min scale be fore speed boost can be used
config.ABILITY_SPEED_BOOST_MULTIPLIER = 1.75; // percent speed increase
config.ABILITY_SPEED_BOOST_PENALTY = 0.05;   // Initial penalty, increases the longer active

config.DRAIN_MAX_DISTANCE    = 300; // distance at which draining starts
config.DRAIN_PINCH_STRENGTH  = 0.4;
config.DRAIN_RADIO_FREQUENCY = 65; // how quickly the radio waves flow down the drain beam, higher is slower

////////////////////////////////////////////////////////////////////////
//                           FOOD SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.FOOD_DENSITY                = 25;    // How much food there is, total food = this number cubed
config.FOOD_VALUE                  = 0.8;   // amount to increase sphere by when food is consumed
config.FOOD_RESPAWN_TIME           = 30000; // Respawn time for food in milliseconds
config.FOOD_RESPAWN_ANIM_DURATION  = 60;    // frames
config.FOOD_CAPTURE_ASSIST         = 1.0;     // this number is added to player's radius for food capturing
config.FOOD_MAP_TYPE               = 'random';
config.FOOD_COLORING_TYPE          = 'hsl01';
config.FOOD_COLORING_SINE_SEGMENTS = 8;     // with sine-cycle coloring, how many color cycles along each axis
config.FOOD_GET_VALUE              = function FoodGetValue( r ) {
    // give food value diminishing returns to prevent runaway growth
    // https://www.desmos.com/calculator/uubp5kvnyo
    return (config.FOOD_VALUE / (r - 0.9));
};

////////////////////////////////////////////////////////////////////////
//                         VALIDATION SETTINGS                        //
////////////////////////////////////////////////////////////////////////

config.ENABLE_VALIDATION              = true;   // enable validation checks on the server to prevent cheating
config.FOOD_CAPTURE_EXTRA_TOLERANCE   = 10;     // extra distance that we'll tolerate for valid food capture
config.PLAYER_CAPTURE_EXTRA_TOLERANCE = 1;      // extra distance that we'll tolerate for valid player capture
config.SPEED_EXTRA_TOLERANCE          = 0.08;   // extra speed tolerance for movement validation
config.PLAYER_SCALE_EXTRA_TOLERANCE   = 0.1;    // extra tolerance for player scale
config.PLAYER_POSITIONS_WINDOW        = 30;     // number of recent positions to save for the player for validation rewind
config.INFRACTION_TOLERANCE_FOOD      = 20;     // how many food infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_PCAP      = 1;      // how many player capture infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SPEED     = 7;      // how many speed infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SCALE     = 1;      // how many scale infractions a player can have before they are kicked
config.MOVE_VALIDATION_SAMPLE_RATE    = 5;      // How often to sample, 1 would be ever time, 10 would be every 10th check
config.LOADING_WAIT_DURATION          = 10000;  // How many milliseconds to wait before starting to track movement validation
config.MAX_PLAYER_NAME_LENGTH         = 15;     // How many characters can be in the player name

////////////////////////////////////////////////////////////////////////
//                            GFX SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.FOG_ENABLED             = true;
config.FOG_NEAR                = 100;
config.FOG_FAR                 = 1000;
config.FOG_COLOR               = THREE.ColorKeywords.black;
config.INITIAL_CAMERA_DISTANCE = 50;
config.WALL_GRID_SEGMENTS      = 20;
config.INITIAL_FOV             = 50;
config.PLAYER_MOVE_LERP_WEIGHT = 0.3;
config.PLAYER_SPHERE_POLYCOUNT = 64; // height and width segments of the spheres
config.FOOD_ALPHA_ENABLED      = false;
config.LAG_SCALE_ENABLE        = true;
config.REQUIRED_WEBGL_EXTENSIONS = ['ANGLE_instanced_arrays'];

////////////////////////////////////////////////////////////////////////
//                            UI SETTINGS                             //
////////////////////////////////////////////////////////////////////////

config.TITLE_CAMERA_SPIN_SPEED = 0.001;
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

config.SKINS = [
    'default',
    'earth',
    'boing',
];


////////////////////////////////////////////////////////////////////////
//                           SOUND SETTINGS                           //
////////////////////////////////////////////////////////////////////////

if (!NODEJS) {
    config.VOLUME_MUSIC_INITIAL = localStorage.volume_music || 0.45;
    config.VOLUME_SFX_INITIAL   = localStorage.volume_sfx || 1.0;
    config.MUSIC_ENABLED        = false;
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
    config.VOLUME_FOOD_CAPTURE = 0.05;
}

////////////////////////////////////////////////////////////////////////
//                      BROWSER FEATURE SETTINGS                      //
////////////////////////////////////////////////////////////////////////

config.BROWSER_FORCE_DISABLED_FEATURES = []; // these items will be forcibly set to disabled, for testing purposes.  for example, ['json', 'webgl']

// Merge environment-specific settings into config
_.assign(config, ZOR.Env);

if (NODEJS) {
    module.exports = config;
}
else {
    // balancer is only used on the client
    config.BALANCER = config.BALANCERS[ config.BALANCER ];

    // Disable console.log on the client, in production.  This should really go
    // into a client init function, but it's here for now.
    if (!config.DEBUG) {
        console.log = function() {};
    }
}
