var NODEJS = typeof module !== 'undefined' && module.exports;

if (NODEJS) var config = require('./config.js');
if (NODEJS) var _ = require('lodash');

var UTIL = {};

/**
 * Returns a random integer between min (included) and max (included) Using
 * Math.round() will give you a non-uniform distribution!
 *
 * @param {Number} min the minimum bound (inclusive)
 * @param {Number} max the maximum bound (inclusive)
 * @returns {Number} a random integer between min (included) and max (included)
 */
UTIL.getRandomIntInclusive = function UTILGetRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 *
 * @param {Number} min the minimum bound (inclusive)
 * @param {Number} max the maximum bound (exclusive)
 * @returns {Number} a random integer between min (included) and max (included)
 */
UTIL.getRandomArbitrary = function UTILGetRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
};

/**
 * Checks for a valid nick
 *
 * @param {String} nickname
 * @returns {boolean}
 */
UTIL.validNick = function UTILValidNick (nickname) {
    var regex = /^\w*$/;
    return regex.exec(nickname) !== null;
};

/**
 * Detect hitting the wall in the positive direction
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @param {'x'|'y'|'z'} axis the axis on which to test for collision
 * @returns {boolean}
 */
function hitp( p, r, v, w, axis ) {
    return p[axis] + r - v[axis] > w[axis]/2;
}

/**
 * Detect hitting the wall in the negative direction
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @param {'x'|'y'|'z'} axis the axis on which to test for collision
 * @returns {boolean}
 */
function hitn( p, r, v, w, axis ) {
    return p[axis] - r - v[axis] < -w[axis]/2;
}

/**
 * Detect hit on the x axis in positive direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
function hitxp( p, r, v, w ) {
    return hitp( p, r, v, w, 'x' );
}


/**
 * Detect hit on the x axis in the negative direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
function hitxn( p, r, v, w ) {
    return hitn( p, r, v, w, 'x' );
}

/**
 * Detect hit on the y axis in the positive direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
function hityp( p, r, v, w ) {
    return hitp( p, r, v, w, 'y' );
}

/**
 * Detect hit on the y axis in the negative direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
function hityn( p, r, v, w ) {
    return hitn( p, r, v, w, 'y' );
}

/**
 * Detect hit on the z axis in the positive direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
function hitzp( p, r, v, w ) {
    return hitp( p, r, v, w, 'z' );
}

/**
 * Detect hit on the z axis in the netative direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
function hitzn( p, r, v, w ) {
    return hitn( p, r, v, w, 'z' );
}


/**
 * Returns true if a sphere would intersect a wall after applying velocity (v).
 *
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean} whether the wall would be hit after applying given velocity
 */
UTIL.checkWallCollision = function UTILcheckWallCollision( p, r, v, w ) {

    return hitxp( p, r, v, w ) ||
        hitxn( p, r, v, w ) ||
        hityp( p, r, v, w ) ||
        hityn( p, r, v, w ) ||
        hitzp( p, r, v, w ) ||
        hitzn( p, r, v, w );

};

/**
 * Adjust a sphere's velocity to prevent it from hitting a wall.  If no wall
 * would be hit, velocity is not changed.
 *
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Vector3} the updated (or not) velocity
 */
UTIL.adjustVelocityWallHit = function UTILadjustVelocityWallHit( p, r, v, w ) {
    var vs = v.clone();

    // TODO: instead of reducing velocities to 0, reduce them just enough to
    // avoid collision.  reducing to 0 causes small, fast spheres to sometimes
    // "hit" the wall before they are visibly touching it.

    if ( hitxp( p, r, v, w ) || hitxn( p, r, v, w ) )
        vs.x = 0;

    if ( hityp( p, r, v, w ) || hityn( p, r, v, w ) )
        vs.y = 0;

    if ( hitzp( p, r, v, w ) || hitzn( p, r, v, w ) )
        vs.z = 0;

    return vs;
};

/**
 * For the 'FOLLOW' steering mode, given a distance from the center of the
 * screen, calculate how quickly the camera should turn.
 *
 * @param {Number} r percentage distance from center of the screen, for example
 * 0.5 would mean halfway between screen center and screen edge.
 */
UTIL.slopewell = function slopewell( r ) {
    return Math.max(0, ( -config.STEERING.WELL + r ) / config.STEERING.SLOPE);
}

/**
 * Get a random world coordinate which a sphere could be placed in.  Because
 * the world is a cube, the coordinate can be used on any axis.
 *
 * @returns {Number}
 */
UTIL.safeRandomCoordinate = function UTILsafeRandomCoordinate() {
    // allow the value to be either random (0..1) for actual usage, or allow it
    // to be passed in for testing the equation.
    var v = arguments[0] || Math.random();
    var safe_size = config.WORLD_SIZE - 2 * config.INITIAL_PLAYER_RADIUS;
    return v * safe_size - safe_size / 2;
}

/**
 * Returns a good spawning point for a player.  The point is likely to be far
 * from other players.
 *
 * @param {Array} others an array of positions of all living players
 * @returns {Vector3} the position recommended for a player
 */
UTIL.safePlayerPosition = function UTILsafePlayerPosition() {
    var x = UTIL.safeRandomCoordinate();
    var y = UTIL.safeRandomCoordinate();
    var z = UTIL.safeRandomCoordinate();
    return new THREE.Vector3( x, y, z );
};

/**
 * Given a food coloring name, returns a function for generating that food
 * coloring style.
 *
 * @param {String} name the
 * @example UTIL.foodColoring('random');
 * @example UTIL.foodColoring('rgbcube');
 */
UTIL.getFoodCrayon = function UTILfoodColoring( type ) {
    return coloringMethods[type];
};

UTIL.trimPosition = function UTILTrimPosition(position, trim) {
    return {
        x: +position.x.toFixed(trim),
        y: +position.y.toFixed(trim),
        z: +position.z.toFixed(trim)
    };
};

UTIL.trimFloat = function UTILTrimFloat(num, trim) {
    return +num.toFixed(trim);
};

/**
 * Utility function used to push data into the
 * array while maintaining the sort order.
 */
UTIL.sortedObjectPush = function UTILSortedObjectPush( array, value, iteratee ) {
    array.splice( _.sortedIndexBy(array, value, iteratee) , 0, value );
};

var coloringMethods = {

    random: function foodColoringRandom() {
        return {
            r: UTIL.getRandomIntInclusive(0, 255) / 255,
            g: UTIL.getRandomIntInclusive(0, 255) / 255,
            b: UTIL.getRandomIntInclusive(0, 255) / 255,
        };
    },

    hsl01: function foodColoringHSL01( x, y, z ) {
        var h = ( x + y + z ) / config.WORLD_SIZE;
        var s = 1.0;
        var l = _.random(0.7, 0.8);
        var color = new THREE.Color().setHSL(h,s,l);
        return {
            r: color.r,
            g: color.g,
            b: color.b,
        };
    },

    rgbcube: function foodColoringRgbCube( x, y, z ) {
        return {
            r: 0.5 + x / config.WORLD_SIZE,
            g: 0.5 + y / config.WORLD_SIZE,
            b: 0.5 + z / config.WORLD_SIZE,
        };
    },

    'rgbcube-randomized': function foodColoringRgbCube( x, y, z ) {
        return {
            r: 0.5 + x / config.WORLD_SIZE + UTIL.getRandomIntInclusive(-128, 128) / 512,
            g: 0.5 + y / config.WORLD_SIZE + UTIL.getRandomIntInclusive(-128, 128) / 512,
            b: 0.5 + z / config.WORLD_SIZE + UTIL.getRandomIntInclusive(-128, 128) / 512,
        };
    },

    'sine-cycle': function foodColoringRgbCube( x, y, z ) {
        return {
            r: Math.sin( x / ( config.WORLD_SIZE / config.FOOD_COLORING_SINE_SEGMENTS ) ) / 2 + 1/2,
            g: Math.sin( y / ( config.WORLD_SIZE / config.FOOD_COLORING_SINE_SEGMENTS ) ) / 2 + 1/2,
            b: Math.sin( z / ( config.WORLD_SIZE / config.FOOD_COLORING_SINE_SEGMENTS ) ) / 2 + 1/2,
        };
    },

};

/**
 * Wrap your function such that it will be executed every N times it's called.
 * This is useful in a long-running loop such as the main loop in a game, where
 * you want to execute certain functions every 10 frames, or similar, but don't
 * want to manage a dozen separate "timers".
 *
 * @param {Function} f the function to wrap
 * @param {Number} n execute the function every `n` times
 */
UTIL.nth = function nth(f, n) {
    var _i = 0;
    var _n = Math.max(n, 0);
    return function() {
        if (_i === _n) {
            _i = 0;
            return f.apply(this, arguments);
        }
        else {
            _i++;
        }
    }
};

// if we're in nodejs, export the root UTIL object
if (NODEJS) module.exports = UTIL;
