var NODEJS = typeof module !== 'undefined' && module.exports;

var UTIL = {};

/**
 * Returns a random integer between min (included) and max (included) Using
 * Math.round() will give you a non-uniform distribution!
 * @param {Number} min the minimum bound (inclusive)
 * @param {Number} max the maximum bound (inclusive)
 * @returns {Number} a random integer between min (included) and max (included)
 */
UTIL.getRandomIntInclusive = function UTILGetRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * @param {Number} min the minimum bound (inclusive)
 * @param {Number} max the maximum bound (exclusive)
 * @returns {Number} a random integer between min (included) and max (included)
 */
UTIL.getRandomArbitrary = function UTILGetRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
};

/**
 * Checks for a valid nick
 * @param {String} nickname
 * @returns {boolean}
 */
UTIL.validNick = function UTILValidNick (nickname) {
    var regex = /^\w*$/;
    return regex.exec(nickname) !== null;
};

/**
 * Detect hitting the wall in the positive direction
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @param {'x'|'y'|'z'} axis the axis on which to test for collision
 * @returns {boolean}
 */
UTIL.hitp = function UTILhitp( p, r, v, w, axis ) {
    return p[axis] + r - v[axis] > w[axis]/2;
};

/**
 * Detect hitting the wall in the negative direction
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @param {'x'|'y'|'z'} axis the axis on which to test for collision
 * @returns {boolean}
 */
UTIL.hitn = function UTILhitn( p, r, v, w, axis ) {
    return p[axis] - r - v[axis] < -w[axis]/2;
};

/**
 * Detect hit on the x axis in positive direction.
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
UTIL.hitxp = function UTILhitxp( p, r, v, w ) {
    return UTIL.hitp( p, r, v, w, 'x' );
};


/**
 * Detect hit on the x axis in the negative direction.
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
UTIL.hitxn = function UTILhitxn( p, r, v, w ) {
    return UTIL.hitn( p, r, v, w, 'x' );
};

/**
 * Detect hit on the y axis in the positive direction.
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
UTIL.hityp = function UTILhityp( p, r, v, w ) {
    return UTIL.hitp( p, r, v, w, 'y' );
};

/**
 * Detect hit on the y axis in the negative direction.
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
UTIL.hityn = function UTILhityn( p, r, v, w ) {
    return UTIL.hitn( p, r, v, w, 'y' );
};

/**
 * Detect hit on the z axis in the positive direction.
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
UTIL.hitzp = function UTILhitzp( p, r, v, w ) {
    return UTIL.hitp( p, r, v, w, 'z' );
};

/**
 * Detect hit on the z axis in the netative direction.
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean}
 */
UTIL.hitzn = function UTILhitzn( p, r, v, w ) {
    return UTIL.hitn( p, r, v, w, 'z' );
};


/**
 * Returns true if a sphere would intersect a wall after applying velocity (v).
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {boolean} whether the wall would be hit after applying given velocity
 */
UTIL.checkWallCollision = function UTILcheckWallCollision( p, r, v, w ) {

    return UTIL.hitxp( p, r, v, w ) ||
        UTIL.hitxn( p, r, v, w ) ||
        UTIL.hityp( p, r, v, w ) ||
        UTIL.hityn( p, r, v, w ) ||
        UTIL.hitzp( p, r, v, w ) ||
        UTIL.hitzn( p, r, v, w );

};

/**
 * Adjust a sphere's velocity to prevent it from hitting a wall.  If no wall would be hit, velocity is not changed.
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

    if ( UTIL.hitxp( p, r, v, w ) || UTIL.hitxn( p, r, v, w ) )
        vs.x = 0;

    if ( UTIL.hityp( p, r, v, w ) || UTIL.hityn( p, r, v, w ) )
        vs.y = 0;

    if ( UTIL.hitzp( p, r, v, w ) || UTIL.hitzn( p, r, v, w ) )
        vs.z = 0;

    return vs;
};

// if we're in nodejs, export the root UTIL object
if (NODEJS) module.exports = UTIL;
