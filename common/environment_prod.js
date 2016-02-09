var NODEJS = typeof module !== 'undefined' && module.exports;

var zor_env = {
    PORT          : 80,
    BALANCER      : "NA",
    CHECK_VERSION : true
};

if (NODEJS) module.exports = zor_env;
