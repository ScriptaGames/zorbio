var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    WORLD_SIZE        : 300,
    MAX_BOTS          : 0,
    FOOD_DENSITY      : 5,
    INITIAL_PLAYER_RADIUS: 5,
    FOOD_VALUE        : 40,
    PORT              : 3000,
    DEBUG             : true,
    HEARTBEAT_ENABLE  : false,
    BALANCER          : "LOCAL",
    ORIGIN            : "http://localhost:3000",
    CHECK_VERSION     : false,
    REQUIRE_ALPHA_KEY : false,
    AUTO_RUN_ENABLED  : true,
};

if (NODEJS) module.exports = ZOR.Env;
