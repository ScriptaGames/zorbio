var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    WORLD_SIZE        : 400,
    MAX_BOTS          : 3,
    FOOD_DENSITY      : 5,
    INITIAL_PLAYER_RADIUS: 5,
    FOOD_VALUE        : 10,
    PORT              : 3000,
    DEBUG             : true,
    HEARTBEAT_ENABLE  : false,
    BALANCER          : "LOCAL",
    ORIGIN            : "http://localhost:3000",
    CHECK_VERSION     : false,
    REQUIRE_ALPHA_KEY : false,
    AUTO_RUN_ENABLED  : false,
};

if (NODEJS) module.exports = ZOR.Env;
