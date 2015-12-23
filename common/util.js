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

/**
 * Checks for a valid nick
 * @param nickname
 * @returns {boolean}
 */
UTIL.validNick = function UTILValidNick (nickname) {
    var regex = /^\w*$/;
    return regex.exec(nickname) !== null;
};

/**
 * Detect hitting the wall in the positive direction
 * @param p
 * @param r
 * @param v
 * @param w
 * @param axis
 * @returns {boolean}
 */
UTIL.hitp = function UTILhitp( p, r, v, w, axis ) {
    return p[axis] + r - v[axis] > w[axis]/2;
};

/**
 * Detect hitting the wall in the negative direction
 * @param p
 * @param r
 * @param v
 * @param w
 * @param axis
 * @returns {boolean}
 */
UTIL.hitn = function UTILhitn( p, r, v, w, axis ) {
    return p[axis] - r - v[axis] < -w[axis]/2;
};

/**
 * Detect hit on the x axis in positive direction.
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {boolean}
 */
UTIL.hitxp = function UTILhitxp( p, r, v, w ) {
    return UTIL.hitp( p, r, v, w, 'x' );
};


/**
 * Detect hit on the x axis in the negative direction.
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {boolean}
 */
UTIL.hitxn = function UTILhitxn( p, r, v, w ) {
    return UTIL.hitn( p, r, v, w, 'x' );
};

/**
 * Detect hit on the y axis in the positive direction.
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {boolean}
 */
UTIL.hityp = function UTILhityp( p, r, v, w ) {
    return UTIL.hitp( p, r, v, w, 'y' );
};

/**
 * Detect hit on the y axis in the negative direction.
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {boolean}
 */
UTIL.hityn = function UTILhityn( p, r, v, w ) {
    return UTIL.hitn( p, r, v, w, 'y' );
};

/**
 * Detect hit on the z axis in the positive direction.
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {boolean}
 */
UTIL.hitzp = function UTILhitzp( p, r, v, w ) {
    return UTIL.hitp( p, r, v, w, 'z' );
};

/**
 * Detect hit on the z axis in the netative direction.
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {boolean}
 */
UTIL.hitzn = function UTILhitzn( p, r, v, w ) {
    return UTIL.hitn( p, r, v, w, 'z' );
};


/**
 * Returns true if a player is touching a wall
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {boolean}
 */
UTIL.checkWallCollision = function UTILcheckWallCollision( p, r, v, w ) {

    // TODO: make sure when a collision occurs with two or more walls at once happens, it is handled correctly

    return UTIL.hitxp( p, r, v, w ) ||
        UTIL.hitxn( p, r, v, w ) ||
        UTIL.hityp( p, r, v, w ) ||
        UTIL.hityn( p, r, v, w ) ||
        UTIL.hitzp( p, r, v, w ) ||
        UTIL.hitzn( p, r, v, w );

};

/**
 * Adjust velocity on an object that has hit a wall based on axis
 * @param p
 * @param r
 * @param v
 * @param w
 * @returns {*}
 */
UTIL.adjustVelocityWallHit = function UTILadjustVelocityWallHit( p, r, v, w ) {
    var vs = v.clone();
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
