var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    WORLD_SIZE        : 1600,
    MAX_BOTS          : 15,
    FOOD_DENSITY      : 9,
    INITIAL_PLAYER_RADIUS: 5,
    FOOD_VALUE        : 5,
    DEBUG             : true,
    HEARTBEAT_ENABLE  : false,
    BALANCER          : "LOCAL",
    CHECK_ORIGIN      : false,
    CHECK_VERSION     : false,
    REQUIRE_ALPHA_KEY : false,
    AUTO_RUN_ENABLED  : true,
    NUM_GAME_INSTANCES : 2,
};

if (NODEJS) module.exports = ZOR.Env;
