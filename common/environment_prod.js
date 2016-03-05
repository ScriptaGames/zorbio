var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    PORT              : 80,
    BALANCER          : "NA",
    ORIGIN            : "http://zor.bio:80",
    CHECK_VERSION     : true,
    REQUIRE_ALPHA_KEY : false,
};

if (NODEJS) module.exports = ZOR.Env;
