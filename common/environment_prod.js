var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    CHECK_ORIGIN      : true,
    CHECK_VERSION     : true,
    REQUIRE_ALPHA_KEY : false,
};

if (NODEJS) module.exports = ZOR.Env;
