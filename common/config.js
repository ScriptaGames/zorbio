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
config.REQUIRE_ALPHA_KEY = false;

////////////////////////////////////////////////////////////////////////
//                           WORLD SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.WORLD_SIZE       = 2000;
config.WORLD_HYPOTENUSE = Math.sqrt( Math.pow( Math.sqrt( Math.pow( config.WORLD_SIZE, 2 ) + Math.pow( config.WORLD_SIZE, 2 ) ), 2 ) + Math.pow( config.WORLD_SIZE, 2 ));

////////////////////////////////////////////////////////////////////////
//                          NETWORK SETTINGS                          //
////////////////////////////////////////////////////////////////////////
config.PORT                     = 80;
config.MAX_PLAYERS              = 50;
config.HEARTBEAT_ENABLE         = true;
config.HEARTBEAT_TIMEOUT        = 300000; // how long before a client is considered disconnected
config.HEARTBEAT_CHECK_INTERVAL = 1000;   // server heartbeat test interval
config.HEARTBEAT_PULSE_INTERVAL = 3000;   // client heartbeat pulse
config.SERVER_TICK_INTERVAL     = 200;    // General server updates in milliseconds
config.ACTOR_UPDATE_INTERVAL    = 50;     // How often actors update their position in milliseconds
config.PENDING_PLAYER_CAPTURE_TTL = 3000; // how long pending player capture lives before it expires in milliseconds
config.CHECK_VERSION            = true;   // check for latest version of the game through the zapi
config.CHECK_VERSION_INTERVAL   = 30000;  // how often to check for new version
config.LEADERS_LENGTH           = 10;     // How many players to include in the leaders array

config.BALANCERS = Object.freeze({
    LOCAL: 'http://localhost',
    NA:    'http://na.zor.bio',
    EU:    'http://eu.zor.bio',
    APAC:  'http://apac.zor.bio'
});
config.BALANCER = 'NA';

////////////////////////////////////////////////////////////////////////
//                          PLAYER SETTINGS                           //
////////////////////////////////////////////////////////////////////////
config.INITIAL_PLAYER_RADIUS = 2;
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
        SPEED : 4.0,
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


////////////////////////////////////////////////////////////////////////
//                           FOOD SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.FOOD_DENSITY                = 27;    // How much food there is, total food = this number cubed
config.FOOD_VALUE                  = 0.5;   // amount to increase sphere by when food is consumed
config.FOOD_RESPAWN_TIME           = 30000; // Respawn time for food in milliseconds
config.FOOD_RESPAWN_ANIM_DURATION  = 60;    // frames
config.FOOD_CAPTURE_ASSIST         = 1.0;     // this number is added to player's radius for food capturing
config.FOOD_COLORING_TYPE          = 'hsl01';
config.FOOD_COLORING_SINE_SEGMENTS = 8;     // with sine-cycle coloring, how many color cycles along each axis
config.FOOD_GET_VALUE              = function FoodGetValue( r ) {
    // give food value diminishing returns to prevent runaway growth
    // https://www.desmos.com/calculator/uubp5kvnyo
    return (config.FOOD_VALUE / (r - 0.75));
};

////////////////////////////////////////////////////////////////////////
//                         VALIDATION SETTINGS                        //
////////////////////////////////////////////////////////////////////////
config.ENABLE_VALIDATION              = true;   // enable validation checks on the server to prevent cheating
config.FOOD_CAPTURE_EXTRA_TOLERANCE   = 50;    // extra distance that we'll tolerate for valid food capture
config.PLAYER_CAPTURE_EXTRA_TOLERANCE = 9;      // extra distance that we'll tolerate for valid player capture
config.SPEED_EXTRA_TOLERANCE          = 0.08;   // extra speed tolerance for movement validation
config.PLAYER_SCALE_EXTRA_TOLERANCE   = 0.1;    // extra tolerance for player scale
config.PLAYER_POSITIONS_WINDOW        = 30;     // number of recent positions to save for the player for validation rewind
config.INFRACTION_TOLERANCE_FOOD      = 20;     // how many food infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_PCAP      = 1;      // how many player capture infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SPEED     = 7;      // how many speed infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SCALE     = 1;      // how many scale infractions a player can have before they are kicked
config.MOVE_VALIDATION_SAMPLE_RATE    = 5;      // How often to sample, 1 would be ever time, 10 would be every 10th check
config.LOADING_WAIT_DURATION          = 10000;  // How many milliseconds to wait before starting to track movement validation

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
//                      BROWSER FEATURE SETTINGS                      //
////////////////////////////////////////////////////////////////////////

config.BROWSER_FORCE_DISABLED_FEATURES = []; // these items will be forcibly set to disabled, for testing purposes.  for example, ['json', 'webgl']

// Merge environment-specific settings into config
_.assign(config, ZOR.Env);
config.BALANCER = config.BALANCERS[ config.BALANCER ];

if (NODEJS) {
    module.exports = config;
}
else {
    // Disable console.log on the client, in production.  This should really go
    // into a client init function, but it's here for now.
    if (!config.DEBUG) {
        console.log = function() {};
    }
}
