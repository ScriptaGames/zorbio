var NODEJS = typeof module !== 'undefined' && module.exports;

var zor_env = {
    PORT          : 3000,
    BALANCER      : "LOCAL",
    CHECK_VERSION : false
};

if (NODEJS) module.exports = zor_env;
