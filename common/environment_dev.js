var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    WORLD_SIZE        : 1000,
    MAX_BOTS          : 3,
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
    NUM_GAME_INSTANCES : 1,
    ENABLE_HTTP_SERVER : true,
};

if (NODEJS) module.exports = ZOR.Env;
