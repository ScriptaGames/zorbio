let Curves = require( './lib/CurveExtras.js' );
let UTIL   = require( '../common/util.js' );
let _      = require( 'lodash' );

/**
 * Encapsulates a curated list of curve paths that fit in the game and look good with bots
 */
class CurvePaths {

    /**
     * Constructor
     */
    constructor() {

        // Register curves that can be randomly called in getRandomCurve()
        self.curves = [
            'randomWander',
            'vivianiCurve',
            'trefoilKnot',
        ];
    }

    /**
     * Calls a random curve function of this instance returns the result
     * @returns {*}
     */
    getRandomCurve() {
        return this[_.sample( self.curves )]();
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
     * A nice curved figure 8
     * @returns {array}
     */
    vivianiCurve() {
        let scale  = UTIL.getRandomIntInclusive( 200, 600 );
        let offset = {
            x: UTIL.getRandomIntInclusive( -200, 200 ),
            y: UTIL.getRandomIntInclusive( -200, 200 ),
            z: UTIL.getRandomIntInclusive( -300, 300 ),
        };

        let segments = Math.floor( scale / 2.75 );

        let curve = new Curves.VivianiCurve( scale, offset );

        return curve.getPoints( segments );
    }


    /**
     * An elegant interlocking knot
     * @returns {array}
     */
    trefoilKnot() {
        let scale  = UTIL.getRandomIntInclusive( 50, 200 );
        let offset = {
            x: UTIL.getRandomIntInclusive( -150, 150 ),
            y: UTIL.getRandomIntInclusive( -150, 150 ),
            z: UTIL.getRandomIntInclusive( -400, 400 ),
        };

        let segments = scale;

        let curve = new Curves.TrefoilKnot( scale, offset );

        return curve.getPoints( segments );
    }
}

module.exports = CurvePaths;

// self.curve = new Curves.HeartCurve(10);
// self.curve = new Curves.TorusKnot(100);
// self.curve = new Curves.CinquefoilKnot(100);
// self.curve = new Curves.FigureEightPolynomialKnot(2);
// self.curve = new Curves.HelixCurve();
// self.curve = new Curves.KnotCurve();
// self.curve1 = new Curves.VivianiCurve(200);
// self.curvePoints1 = self.curve1.getPoints(100);
//
// self.curve2 = new Curves.GrannyKnot(150);
// self.curvePoints2 = self.curve2.getPoints(100);
//
// let glueCurve1 = new THREE.CubicBezierCurve3(
//     self.curvePoints1[self.curvePoints1.length - 1].clone(),
//     UTIL.randomWorldPosition(3),
//     UTIL.randomWorldPosition(3),
//     self.curvePoints2[0].clone()
// );
// // glueCurve1.curveType = 'chordal';
// // glueCurve1.closed = false;
// self.gluePoints1 = glueCurve1.getPoints(50);
//
// let glueCurve2 = new THREE.CubicBezierCurve3(
//     self.curvePoints2[self.curvePoints2.length - 1].clone(),
//     UTIL.randomWorldPosition(3),
//     UTIL.randomWorldPosition(3),
//     self.curvePoints1[0].clone()
// );
// // glueCurve2.curveType = 'chordal';
// // glueCurve2.closed = false;
// self.gluePoints2 = glueCurve2.getPoints(50);
//
//
// // Create a closed wavey loop
// let catCurve = new THREE.CatmullRomCurve3( self.curvePoints1.concat( self.curvePoints2 ) );
// catCurve.curveType = 'catmullrom';
// catCurve.closed = true;
