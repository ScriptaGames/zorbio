var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    PORT              : 3000,
    BALANCER          : "LOCAL",
    CHECK_VERSION     : false,
    REQUIRE_ALPHA_KEY : false,
};

if (NODEJS) module.exports = ZOR.Env;
