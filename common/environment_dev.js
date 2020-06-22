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
    BALANCER              : 'osd',
    CHECK_ORIGIN          : false,
    CHECK_VERSION         : false,
    REQUIRE_ALPHA_KEY     : false,
    AUTO_RUN_ENABLED      : true,
    NUM_GAME_INSTANCES    : 1,
    ENABLE_WEB_SERVER     : true,
    ENABLE_HTTPS          : false,
    ENABLE_BACKEND_SERVICE: false,
    BOT_DEFAULT_MOVEMENT  : 'curve',
    WS_CONNECT_PORT       : 80,
};

if (NODEJS_ENV_DEV) {
    let ZOR = {};
    ZOR.Env = DEV_SETTINGS;
    module.exports = ZOR.Env;
}
else {
    ZOR.Env = DEV_SETTINGS;
}
