var NODEJS = typeof module !== 'undefined' && module.exports;

var ZOR = ZOR || {};

ZOR.Env = {
    ORIGIN            : "http://zor.bio",
    CHECK_VERSION     : true,
    REQUIRE_ALPHA_KEY : true,
};

if (NODEJS) module.exports = ZOR.Env;
