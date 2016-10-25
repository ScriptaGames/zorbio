var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    WORLD_SIZE        : 2400,
    MAX_BOTS          : 10,
    FOOD_DENSITY      : 35,
    INITIAL_PLAYER_RADIUS: 5,
    FOOD_VALUE        : 5,
    DEBUG             : true,
    HEARTBEAT_ENABLE  : false,
    BALANCER          : "LOCAL",
    CHECK_ORIGIN      : false,
    CHECK_VERSION     : false,
    REQUIRE_ALPHA_KEY : false,
    AUTO_RUN_ENABLED  : true,
    NUM_GAME_INSTANCES : 1,
    ENABLE_HTTP_SERVER : true,
    ENABLE_BACKEND_SERVICE : false,
};

if (NODEJS) module.exports = ZOR.Env;
