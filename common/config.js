// Configuration values.  Values defined here are available to both the client and
// the server.

var NODEJS = typeof module !== 'undefined' && module.exports;

if (NODEJS) {
    global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
    global.THREE = require('three');
}

var config = {};

config.DEBUG = false;

////////////////////////////////////////////////////////////////////////
//                           WORLD SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.WORLD_SIZE       = 1000;
config.WORLD_HYPOTENUSE = Math.sqrt( Math.pow( Math.sqrt( Math.pow( config.WORLD_SIZE, 2 ) + Math.pow( config.WORLD_SIZE, 2 ) ), 2 ) + Math.pow( config.WORLD_SIZE, 2 ));

////////////////////////////////////////////////////////////////////////
//                          NETWORK SETTINGS                          //
////////////////////////////////////////////////////////////////////////
config.PORT                     = 3000;
config.MAX_PLAYERS              = 50;
config.HEARTBEAT_ENABLE         = true;
config.HEARTBEAT_TIMEOUT        = 30000; // how long before a client is considered disconnected
config.HEARTBEAT_CHECK_INTERVAL = 1000;  // server heartbeat test interval
config.HEARTBEAT_PULSE_INTERVAL = 3000;  // client heartbeat pulse
config.SERVER_TICK_INTERVAL     = 250;   // General server updates in milliseconds
config.ACTOR_UPDATE_INTERVAL    = 50;    // How often actors update their position in milliseconds
config.PENDING_PLAYER_CAPTURE_TTL = 3000;  // how long pending player capture lives before it expires in milliseconds
config.BALANCER_NA              = 'http://localhost';
config.BALANCER_EU              = 'http://eu.zor.bio';
config.BALANCER_APAC            = 'http://apac.zor.bio';

////////////////////////////////////////////////////////////////////////
//                          PLAYER SETTINGS                           //
////////////////////////////////////////////////////////////////////////
config.INITIAL_PLAYER_RADIUS = 2;
config.MAX_PLAYER_RADIUS     = 150;

// https://www.desmos.com/calculator/dphm84crab
config.MAX_PLAYER_SPEED      = 3;
config.STATIONARY_RADIUS     = config.MAX_PLAYER_RADIUS + 25; // the size at which speed = 0 (hint: make it bigger than max_size or you'll get stuck when huge!)

config.PLAYER_CAPTURE_VALUE  = function PlayerCaptureValue( r ) { return r / 2; };
config.PLAYER_GET_SPEED      = function PlayerGetSpeed( r ) {
    // https://www.desmos.com/calculator/dphm84crab
    var s = config.MAX_PLAYER_SPEED;
    return s - ((r * s) / config.STATIONARY_RADIUS);
};
config.AUTO_RUN_ENABLED      = true;
config.STEERING_METHODS      = { // enum-ish
    DRAG: 0,
    SPIN: 1, // https://www.desmos.com/calculator/wszojiyufd
};
config.STEERING_METHOD       = config.STEERING_METHODS.SPIN;

// settings for the SPIN method of steering
config.STEERING_SPIN_WELL  = 15; // pixel radius of well (or deadzone) in center of screen
config.STEERING_SPIN_SLOPE = 0.00004; // rate at which rotation increases once outside the well

////////////////////////////////////////////////////////////////////////
//                           FOOD SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.FOOD_DENSITY                = 10;    // How much food there is, total food = this number cubed
config.FOOD_RESPAWN_TIME           = 30000; // Respawn time for food in milliseconds
config.FOOD_VALUE                  = 0.8;     // amount to increase sphere by when food is consumed
config.FOOD_CAPTURE_ASSIST         = 2;     // this number is added to player's radius for food capturing
config.FOOD_COLORING_TYPE          = ['rgbcube', 'random', 'rgbcube-randomized', 'sine-cycle'][3];
config.FOOD_COLORING_SINE_SEGMENTS = 8;  // with sine-cycle coloring, how many color cycles along each axis
config.FOOD_GET_VALUE              = function FoodGetValue( r ) {
    return config.FOOD_VALUE / r;
};

////////////////////////////////////////////////////////////////////////
//                         VALIDATION SETTINGS                        //
////////////////////////////////////////////////////////////////////////
config.ENABLE_VALIDATION              = true;   // enable validation checks on the server to prevent cheating
config.FOOD_CAPTURE_EXTRA_TOLERANCE   = 20;     // extra distance that we'll tolerate for valid food capture
config.PLAYER_CAPTURE_EXTRA_TOLERANCE = 9;      // extra distance that we'll tolerate for valid player capture
config.SPEED_EXTRA_TOLERANCE          = 0.1;    // extra speed tolerance for movement validation
config.PLAYER_SCALE_EXTRA_TOLERANCE   = 0.1;    // extra tolerance for player scale
config.PLAYER_POSITIONS_WINDOW        = 30;     // number of recent positions to save for the player for validation rewind
config.PLAYER_POSITIONS_FULL_SAMPLE   = false;  // Send full sample to server, could slow down performance if true
config.INFRACTION_TOLERANCE_FOOD      = 20;     // how many food infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_PCAP      = 1;      // how many player capture infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SPEED     = 10;     // how many speed infractions a player can have before they are kicked
config.INFRACTION_TOLERANCE_SCALE     = 1;      // how many scale infractions a player can have before they are kicked

////////////////////////////////////////////////////////////////////////
//                            GFX SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.INITIAL_CAMERA_DISTANCE = 50;
config.FOG_ENABLED             = true;
config.FOG_NEAR                = 100;
config.FOG_FAR                 = 1000;
config.FOG_COLOR               = THREE.ColorKeywords.black;
config.WALL_GRID_SEGMENTS      = 20;
config.INITIAL_FOV             = 50;
config.PLAYER_MOVE_LERP_WEIGHT = 0.4;
config.PLAYER_SPHERE_POLYCOUNT = 64; // height and width segments of the spheres
config.LAG_SCALE_ENABLE        = true; // disable lag scale adjustment until proven

////////////////////////////////////////////////////////////////////////
//                      BROWSER FEATURE SETTINGS                      //
////////////////////////////////////////////////////////////////////////

config.BROWSER_FORCE_DISABLED_FEATURES = []; // these items will be forcibly set to disabled, for testing purposes.  for example, ['json', 'webgl']

////////////////////////////////////////////////////////////////////////
//                          NODEJS EXPORTER                           //
////////////////////////////////////////////////////////////////////////

if (NODEJS) module.exports = config;
