// Configuration values.  Values defined here are available to both the client and
// the server.

var config = {};

////////////////////////////////////////////////////////////////////////
//                           WORLD SETTINGS                           //
////////////////////////////////////////////////////////////////////////

config.WORLD_SIZE   = 1000;
config.FOOD_DENSITY = 20;

////////////////////////////////////////////////////////////////////////
//                          NETWORK SETTINGS                          //
////////////////////////////////////////////////////////////////////////

config.PORT                     = 3000;
config.NETWORK_UPDATE_INTERVAL  = 50;
config.HEARTBEAT_ENABLE         = false;
config.HEARTBEAT_TIMEOUT        = 30000;
config.HEARTBEAT_CHECK_INTERVAL = 1000;

////////////////////////////////////////////////////////////////////////
//                            GFX SETTINGS                            //
////////////////////////////////////////////////////////////////////////


config.SPHERE_GLOW_SCALE     = 1.1; // multiplier to determine how big glow sphere should be relative to player sphere
config.MAX_PLAYER_RADIUS     = 150;
config.INITIAL_PLAYER_RADIUS = 2;

////////////////////////////////////////////////////////////////////////
//                          NODEJS EXPORTER                           //
////////////////////////////////////////////////////////////////////////

var NODEJS = typeof module !== 'undefined' && module.exports;
if (NODEJS) module.exports = config;
