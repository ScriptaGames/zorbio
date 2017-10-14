// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
*/

const NODEJS_ENV_PROD = typeof module !== 'undefined' && module.exports;

const PROD_SETTINGS = {
    CHECK_ORIGIN      : true,
    CHECK_VERSION     : false,
    REQUIRE_ALPHA_KEY : false,
};

if (NODEJS_ENV_PROD) {
    let ZOR = {};
    ZOR.Env = PROD_SETTINGS;
    module.exports = ZOR.Env;
} else {
    ZOR.Env = PROD_SETTINGS;
}
