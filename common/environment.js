// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
global ZOR_ENV:true
*/

const NODEJS = typeof module !== 'undefined' && module.exports;

let zor_env;

if (NODEJS) {
    console.log('environment: nodejs process');
    zor_env = process.env.ZOR_ENV;
}
else {
    console.log('environment: client browser');
    zor_env = ZOR_ENV;
}

let ENV_OVERRIDES = {};

console.log('environment:', zor_env);

if (zor_env === 'dev') {
    console.log('environment: using dev overrides');

    ENV_OVERRIDES = {
        WORLD_SIZE            : 1000,
        MAX_BOTS              : 10,
        FOOD_DENSITY          : 10,
        INITIAL_PLAYER_RADIUS : 5,
        FOOD_VALUE            : 5,
        DEBUG                 : true,
        HEARTBEAT_ENABLE      : false,
        BALANCER              : 'LOCAL',
        CHECK_ORIGIN          : false,
        REQUIRE_ALPHA_KEY     : false,
        AUTO_RUN_ENABLED      : true,
        NUM_GAME_INSTANCES    : 1,
        ENABLE_HTTPS          : false,
        ENABLE_BACKEND_SERVICE: false,
        BOT_DEFAULT_MOVEMENT  : 'curve',
        WS_CONNECT_PORT       : 31000,
    };
}
else if (zor_env === 'prod') {
    console.log('environment: using prod overrides');

    ENV_OVERRIDES = {
        CHECK_ORIGIN          : true,
        ENABLE_HTTPS          : true,
        ENABLE_BACKEND_SERVICE: false,
        DEBUG                 : false,
        WS_CONNECT_PORT       : 443,
    };
}

if (ENV_OVERRIDES.DEBUG) {
    console.log('environment: ENV_OVERRIDES:', ENV_OVERRIDES);
}

if (NODEJS) {
    let ZOR = {};
    ZOR.Env = ENV_OVERRIDES;
    module.exports = ZOR.Env;
}
else {
    ZOR.Env = ENV_OVERRIDES;
}
