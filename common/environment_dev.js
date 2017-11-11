// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
*/

const NODEJS_ENV_DEV = typeof module !== 'undefined' && module.exports;

const DEV_SETTINGS = {
    WORLD_SIZE            : 1000,
    MAX_BOTS              : 10,
    FOOD_DENSITY          : 10,
    INITIAL_PLAYER_RADIUS : 5,
    FOOD_VALUE            : 5,
    DEBUG                 : true,
    HEARTBEAT_ENABLE      : false,
    BALANCER              : 'LOCAL',
    CHECK_ORIGIN          : false,
    CHECK_VERSION         : false,
    REQUIRE_ALPHA_KEY     : false,
    AUTO_RUN_ENABLED      : true,
    NUM_GAME_INSTANCES    : 1,
    ENABLE_HTTP_SERVER    : true,
    ENABLE_BACKEND_SERVICE: false,
};

if (NODEJS_ENV_DEV) {
    let ZOR = {};
    ZOR.Env = DEV_SETTINGS;
    module.exports = ZOR.Env;
}
else {
    ZOR.Env = DEV_SETTINGS;
}
