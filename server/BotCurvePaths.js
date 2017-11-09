let THREE  = require( 'three' );
// let Curves = require( './lib/CurveExtras.js' );
let UTIL   = require( '../common/util.js' );

/**
 * Generates an Object that contains a curated list of curve points that fit well within the Zorbio world
 * and looks good on both paths.
 * @returns {object}
 */
function generatedCuratedCurvePoints() {
    let curvePoints = {};

    // TODO: put this in a loop
    // Random world points closed loop a large path
    let divide = 1.3;
    let curve = new THREE.CatmullRomCurve3( [
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
        UTIL.randomWorldPosition(divide),
    ] );
    curve.curveType = 'chordal';
    curve.closed = true;

    curvePoints.randomWander = curve.getPoints( 300 );

    return curvePoints;
}

let BotCurvePaths = generatedCuratedCurvePoints();

module.exports = BotCurvePaths;
