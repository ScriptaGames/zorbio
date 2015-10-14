var NODEJS = typeof module !== 'undefined' && module.exports;

var UTIL = {};

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
UTIL.getRandomIntInclusive = function UTILGetRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Returns a random number between min (inclusive) and max (exclusive)
UTIL.getRandomArbitrary = function UTILGetRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
};

UTIL.validNick = function UTILValidNick (nickname) {
    var regex = /^\w*$/;
    return regex.exec(nickname) !== null;
};

// if we're in nodejs, export the root UTIL object
if (NODEJS) module.exports = UTIL;
