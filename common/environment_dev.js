var NODEJS = typeof module !== 'undefined' && module.exports;

var zor_env = {
    PORT:     3000,
    BALANCER: "LOCAL"
};

if (NODEJS) module.exports = zor_env;
