/*
global UTIL:true,
 _:true,
 THREE:true,
 config:true,
 ZOR:true
*/

const NODEJS_CURVES = typeof module !== 'undefined' && module.exports;

// if we're running in nodejs, import THREE.  for browser, assume it's
// already there.
if (NODEJS_CURVES) {
    global.THREE        = global.THREE || {};
    global.THREE.Curves = require( '../common/CurveExtras' );
    global.UTIL         = require( './util.js' );
    global._            = require( 'lodash' );
    global.config       = require( '../common/config' );
}

/**
 * This was the size that I calibrated the scales and offsets. Never change this!
 * @type {number}
 */
const CALIBRATED_WORLD_SIZE = 2000;

/**
 * Encapsulates a curated list of curve paths that fit in the game and look good with bots
 */
ZOR.CurvePaths = class CurvePaths {

    /**
     * Constructor
     */
    constructor() {

        // Register curves that can be randomly called in getRandomCurve()
        self.curves = [
            'randomWander',
            'grannyKnot',
            'trefoilKnot',
            'cinquefoilKnot',
        ];
    }

    /**
     * Calls a random curve function of this instance returns the result
     * @returns {*}
     */
    getRandomCurve() {
        let curveName = _.sample( self.curves );

        if (config.DEBUG) console.log('using curve: ', curveName);

        let curvePoints = this[curveName]();

        // 50% of the time reverse direction
        if (UTIL.getRandomIntInclusive(1, 2) === 2) curvePoints.reverse();

        return curvePoints;
    }


    /**
     * Generates an Object that contains a curated list of curve points that fit well within the Zorbio world
     * and looks good on both paths.
     * @returns {array}
     */
    randomWander() {
        return UTIL.randomWanderPath( 10, 1.2, 300 );
    }


    /**
     * An elegant interlocking knot.  It is calibrated to randomly spread bots
     * around the whole world and adjusts based on world size.
     * @returns {array}
     */
    trefoilKnot() {

        // Make scales and offset dynamic based on world size
        const worldSize      = config.WORLD_SIZE;
        const worldSizeDelta = worldSize / CALIBRATED_WORLD_SIZE;
        const scaleMax       = 120 * worldSizeDelta;
        const scaleMin       = 70  * worldSizeDelta;
        const offsetXY       = 600 * worldSizeDelta;
        const offsetZ        = 800 * worldSizeDelta;

        const scale  = UTIL.getRandomIntInclusive( scaleMin, scaleMax );
        const segments = Math.floor(scale * 1.5);

        let offset = {
            x: UTIL.getRandomIntInclusive( -offsetXY, offsetXY ),
            y: UTIL.getRandomIntInclusive( -offsetXY, offsetXY ),
            z: UTIL.getRandomIntInclusive( -offsetZ, offsetZ ),
        };

        let curve = new THREE.Curves.TrefoilKnot( scale, offset );

        return curve.getPoints( segments );
    }

    /**
     * Exactly like the name, a weird not with no pattern. It is calibrated to randomly spread bots
     * around the whole world and adjusts based on world size.
     * @returns {array}
     */
    grannyKnot() {

        // Make scales and offset dynamic based on world size
        const worldSize      = config.WORLD_SIZE;
        const worldSizeDelta = worldSize / CALIBRATED_WORLD_SIZE;
        const scaleMax       = 300 * worldSizeDelta;
        const scaleMin       = 150 * worldSizeDelta;
        const offsetX        = 425 * worldSizeDelta;
        const offsetY        = 575 * worldSizeDelta;
        const offsetZ        = 625 * worldSizeDelta;

        const scale  = UTIL.getRandomIntInclusive( scaleMin, scaleMax );
        const segments = Math.floor(scale * 1.1);

        let offset = {
            x: UTIL.getRandomIntInclusive( -offsetX, offsetX ),
            y: UTIL.getRandomIntInclusive( -offsetY, offsetY ),
            z: UTIL.getRandomIntInclusive( -offsetZ, offsetZ ),
        };

        let curve = new THREE.Curves.GrannyKnot( scale, offset );

        return curve.getPoints( segments );
    }

    /**
     * A really cool wide wheel spiral. It is calibrated to randomly spread bots
     * around the whole world and adjusts based on world size.
     * @returns {array}
     */
    cinquefoilKnot() {

        // Make scales and offset dynamic based on world size
        const worldSize      = config.WORLD_SIZE;
        const worldSizeDelta = worldSize / CALIBRATED_WORLD_SIZE;
        const scaleMax       = 200 * worldSizeDelta;
        const scaleMin       = 80 * worldSizeDelta;
        const offsetX        = 350 * worldSizeDelta;
        const offsetY        = 350 * worldSizeDelta;
        const offsetZ        = 600 * worldSizeDelta;

        const scale  = UTIL.getRandomIntInclusive( scaleMin, scaleMax );
        const segments = Math.floor(scale * 2.5);

        let offset = {
            x: UTIL.getRandomIntInclusive( -offsetX, offsetX ),
            y: UTIL.getRandomIntInclusive( -offsetY, offsetY ),
            z: UTIL.getRandomIntInclusive( -offsetZ, offsetZ ),
        };

        let curve = new THREE.Curves.CinquefoilKnot( scale, offset );

        return curve.getPoints( segments );
    }
};

if (NODEJS_CURVES) module.exports = ZOR.CurvePaths;

