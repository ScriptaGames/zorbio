// Configuration values.  Values defined here are available to both the client and
// the server.

var NODEJS = typeof module !== 'undefined' && module.exports;

if (NODEJS) {
    global.self = {}; // threejs expects there to be a global named 'self'... for some reason..
    global.THREE = require('three.js');
}

var config = {};

////////////////////////////////////////////////////////////////////////
//                           WORLD SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.WORLD_SIZE       = 5000;
config.WORLD_HYPOTENUSE = Math.sqrt( Math.pow( Math.sqrt( Math.pow( config.WORLD_SIZE, 2 ) + Math.pow( config.WORLD_SIZE, 2 ) ), 2 ) + Math.pow( config.WORLD_SIZE, 2 ));

////////////////////////////////////////////////////////////////////////
//                          NETWORK SETTINGS                          //
////////////////////////////////////////////////////////////////////////

config.PORT                     = 3000;
config.HEARTBEAT_ENABLE         = true;
config.HEARTBEAT_TIMEOUT        = 10000; // how long before a client is considered disconnected
config.HEARTBEAT_CHECK_INTERVAL = 1000;  // server heartbeat test interval
config.HEARTBEAT_PULSE_INTERVAL = 3000;  // client heartbeat pulse
config.SERVER_TICK_INTERVAL     = 250;   // General server updates in milliseconds
config.ACTOR_UPDATE_INTERVAL    = 50;    // How often actors update their position in milliseconds

////////////////////////////////////////////////////////////////////////
//                          PLAYER SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.BASE_PLAYER_SPEED     = 1;
config.INITIAL_PLAYER_RADIUS = 4;
config.PLAYER_CAPTURE_VALUE  = function PlayerCaptureValue( r ) { return r / 2; };
config.AUTO_RUN_ENABLED      = true;

////////////////////////////////////////////////////////////////////////
//                           FOOD SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.FOOD_DENSITY                = 4;    // How much food there is, total food = this number cubed
config.FOOD_RESPAWN_TIME           = 30000; // Respawn time for food in milliseconds
config.FOOD_VALUE                  = 1;     // amount to increase sphere by when food is consumed
config.FOOD_CAPTURE_ASSIST         = 2;     // this number is added to player's radius for food capturing
config.FOOD_COLORING_TYPE          = ['rgbcube', 'random', 'rgbcube-randomized', 'sine-cycle'][2];
config.FOOD_COLORING_SINE_SEGMENTS = 8;  // with sine-cycle coloring, how many color cycles along each axis

////////////////////////////////////////////////////////////////////////
//                         VALIDATION SETTINGS                        //
////////////////////////////////////////////////////////////////////////
config.FOOD_CAPTURE_EXTRA_TOLORANCE   = 15; // extra distance that we'll tolerate for valid food capture
config.PLAYER_CAPTURE_EXTRA_TOLORANCE = 9;  // extra distance that we'll tolerate for valid player capture
config.SPEED_EXTRA_TOLERANCE          = 0.001;
config.PLAYER_POSITIONS_WINDOW        = 30; // number of recent positions to save for the player for validation rewind
config.PLAYER_INFRACTION_TOLORANCE    = 1;  // how many infractions a player can have before they are kicked

////////////////////////////////////////////////////////////////////////
//                            GFX SETTINGS                            //
////////////////////////////////////////////////////////////////////////

config.INITIAL_CAMERA_DISTANCE = 50;
config.FOG_ENABLED             = false;
config.FOG_NEAR                = 100;
config.FOG_FAR                 = 1000;
config.FOG_COLOR               = THREE.ColorKeywords.black;
config.WALL_GRID_SEGMENTS      = 20;
config.INITIAL_FOV             = 50;
config.MAX_PLAYER_RADIUS       = 150;
config.PLAYER_MOVE_LERP_WEIGHT = 0.4;
config.PLAYER_SPHERE_POLYCOUNT = 64; // height and width segments of the spheres
config.LAG_SCALE_ENABLE        = false; // disable lag scale adjustment until proven

////////////////////////////////////////////////////////////////////////
//                          NODEJS EXPORTER                           //
////////////////////////////////////////////////////////////////////////

if (NODEJS) module.exports = config;
