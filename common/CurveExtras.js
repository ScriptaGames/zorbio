/*
 * A bunch of parametric curves
 * @author zz85
 *
 * Formulas collected from various sources
 * http://mathworld.wolfram.com/HeartCurve.html
 * http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page6.html
 * http://en.wikipedia.org/wiki/Viviani%27s_curve
 * http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page4.html
 * http://www.mi.sanu.ac.rs/vismath/taylorapril2011/Taylor.pdf
 * http://prideout.net/blog/?p=44
 */

/*
global THREE:true
*/

const NODEJS_CURVES_EXTRAS = typeof module !== 'undefined' && module.exports;

if (NODEJS_CURVES_EXTRAS) {
    global.THREE = require( 'three' );
}

THREE.Curves = THREE.Curves || {};
let Curves = THREE.Curves;

// GrannyKnot

function GrannyKnot( scale, offset ) {
    THREE.Curve.call( this );

    this.scale = scale || 100;
    this.offset = offset || {x: 0, y: 0, z: 0};
}

GrannyKnot.prototype = Object.create( THREE.Curve.prototype );
GrannyKnot.prototype.constructor = GrannyKnot;

GrannyKnot.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t = 2 * Math.PI * t;

    let x = - 0.22 * Math.cos( t ) - 1.28 * Math.sin( t ) - 0.44 * Math.cos( 3 * t ) - 0.78 * Math.sin( 3 * t );
    let y = - 0.1 * Math.cos( 2 * t ) - 0.27 * Math.sin( 2 * t ) + 0.38 * Math.cos( 4 * t ) + 0.46 * Math.sin( 4 * t );
    let z = 0.7 * Math.cos( 3 * t ) - 0.4 * Math.sin( 3 * t );

    let scaledPoint = point.set( x, y, z ).multiplyScalar( this.scale );

    scaledPoint.add(this.offset);

    return scaledPoint;
};

// HeartCurve

function HeartCurve( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 5 : scale;
}

HeartCurve.prototype = Object.create( THREE.Curve.prototype );
HeartCurve.prototype.constructor = HeartCurve;

HeartCurve.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t *= 2 * Math.PI;

    let x = 16 * Math.pow( Math.sin( t ), 3 );
    let y = 13 * Math.cos( t ) - 5 * Math.cos( 2 * t ) - 2 * Math.cos( 3 * t ) - Math.cos( 4 * t );
    let z = 0;

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

// Viviani's Curve

function VivianiCurve( scale, offset ) {
    THREE.Curve.call( this );

    this.offset = offset || {x: 0, y: 0, z: 0}; // Vector where to center the curve in the world

    this.scale = ( scale === undefined ) ? 70 : scale;
}

VivianiCurve.prototype = Object.create( THREE.Curve.prototype );
VivianiCurve.prototype.constructor = VivianiCurve;

VivianiCurve.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t = t * 4 * Math.PI; // normalized to 0..1
    let a = this.scale / 2;

    let x = (a * ( 1 + Math.cos( t ) )) + this.offset.x;
    let y = (a * Math.sin( t )) + this.offset.y;
    let z = (2 * a * Math.sin( t / 2 )) + this.offset.z;

    return point.set( x, y, z );
};

// KnotCurve

function KnotCurve() {
    THREE.Curve.call( this );
}

KnotCurve.prototype = Object.create( THREE.Curve.prototype );
KnotCurve.prototype.constructor = KnotCurve;

KnotCurve.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t *= 2 * Math.PI;

    let R = 10;
    let s = 50;

    let x = s * Math.sin( t );
    let y = Math.cos( t ) * ( R + s * Math.cos( t ) );
    let z = Math.sin( t ) * ( R + s * Math.cos( t ) );

    return point.set( x, y, z );
};

// HelixCurve

function HelixCurve() {
    THREE.Curve.call( this );
}

HelixCurve.prototype = Object.create( THREE.Curve.prototype );
HelixCurve.prototype.constructor = HelixCurve;

HelixCurve.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    let a = 30; // radius
    let b = 150; // height

    let t2 = 2 * Math.PI * t * b / 30;

    let x = Math.cos( t2 ) * a;
    let y = Math.sin( t2 ) * a;
    let z = b * t;

    return point.set( x, y, z );
};

// TrefoilKnot

function TrefoilKnot( scale, offset ) {
    THREE.Curve.call( this );

    this.offset = offset || {x: 0, y: 0, z: 0};

    this.scale = ( scale === undefined ) ? 10 : scale;
}

TrefoilKnot.prototype = Object.create( THREE.Curve.prototype );
TrefoilKnot.prototype.constructor = TrefoilKnot;

TrefoilKnot.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t *= Math.PI * 2;

    let x = ( 2 + Math.cos( 3 * t ) ) * Math.cos( 2 * t );
    let y = ( 2 + Math.cos( 3 * t ) ) * Math.sin( 2 * t );
    let z = Math.sin( 3 * t );

    let scaledPoint = point.set( x, y, z ).multiplyScalar( this.scale );

    scaledPoint.add(this.offset);

    return scaledPoint;
};

// TorusKnot

function TorusKnot( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 10 : scale;
}

TorusKnot.prototype = Object.create( THREE.Curve.prototype );
TorusKnot.prototype.constructor = TorusKnot;

TorusKnot.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    let p = 3;
    let q = 4;

    t *= Math.PI * 2;

    let x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
    let y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
    let z = Math.sin( q * t );

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

// CinquefoilKnot

function CinquefoilKnot( scale, offset ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 10 : scale;

    this.offset = offset || {x: 0, y: 0, z: 0};
}

CinquefoilKnot.prototype = Object.create( THREE.Curve.prototype );
CinquefoilKnot.prototype.constructor = CinquefoilKnot;

CinquefoilKnot.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    let p = 2;
    let q = 5;

    t *= Math.PI * 2;

    let x = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
    let y = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
    let z = Math.sin( q * t );

    let scaledPoint = point.set( x, y, z ).multiplyScalar( this.scale );

    scaledPoint.add( this.offset );

    return scaledPoint;
};

// TrefoilPolynomialKnot

function TrefoilPolynomialKnot( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 10 : scale;
}

TrefoilPolynomialKnot.prototype = Object.create( THREE.Curve.prototype );
TrefoilPolynomialKnot.prototype.constructor = TrefoilPolynomialKnot;

TrefoilPolynomialKnot.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t = t * 4 - 2;

    let x = Math.pow( t, 3 ) - 3 * t;
    let y = Math.pow( t, 4 ) - 4 * t * t;
    let z = 1 / 5 * Math.pow( t, 5 ) - 2 * t;

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

let scaleTo = function( x, y, t ) {
    let r = y - x;
    return t * r + x;
};

// FigureEightPolynomialKnot

function FigureEightPolynomialKnot( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 1 : scale;
}

FigureEightPolynomialKnot.prototype = Object.create( THREE.Curve.prototype );
FigureEightPolynomialKnot.prototype.constructor = FigureEightPolynomialKnot;

FigureEightPolynomialKnot.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t = scaleTo( - 4, 4, t );

    let x = 2 / 5 * t * ( t * t - 7 ) * ( t * t - 10 );
    let y = Math.pow( t, 4 ) - 13 * t * t;
    let z = 1 / 10 * t * ( t * t - 4 ) * ( t * t - 9 ) * ( t * t - 12 );

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

// DecoratedTorusKnot4a

function DecoratedTorusKnot4a( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 40 : scale;
}

DecoratedTorusKnot4a.prototype = Object.create( THREE.Curve.prototype );
DecoratedTorusKnot4a.prototype.constructor = DecoratedTorusKnot4a;

DecoratedTorusKnot4a.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    t *= Math.PI * 2;

    let x = Math.cos( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
    let y = Math.sin( 2 * t ) * ( 1 + 0.6 * ( Math.cos( 5 * t ) + 0.75 * Math.cos( 10 * t ) ) );
    let z = 0.35 * Math.sin( 5 * t );

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

// DecoratedTorusKnot4b

function DecoratedTorusKnot4b( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 40 : scale;
}

DecoratedTorusKnot4b.prototype = Object.create( THREE.Curve.prototype );
DecoratedTorusKnot4b.prototype.constructor = DecoratedTorusKnot4b;

DecoratedTorusKnot4b.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    let fi = t * Math.PI * 2;

    let x = Math.cos( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
    let y = Math.sin( 2 * fi ) * ( 1 + 0.45 * Math.cos( 3 * fi ) + 0.4 * Math.cos( 9 * fi ) );
    let z = 0.2 * Math.sin( 9 * fi );

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

// DecoratedTorusKnot5a

function DecoratedTorusKnot5a( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 40 : scale;
}

DecoratedTorusKnot5a.prototype = Object.create( THREE.Curve.prototype );
DecoratedTorusKnot5a.prototype.constructor = DecoratedTorusKnot5a;

DecoratedTorusKnot5a.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    let fi = t * Math.PI * 2;

    let x = Math.cos( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
    let y = Math.sin( 3 * fi ) * ( 1 + 0.3 * Math.cos( 5 * fi ) + 0.5 * Math.cos( 10 * fi ) );
    let z = 0.2 * Math.sin( 20 * fi );

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

// DecoratedTorusKnot5c

function DecoratedTorusKnot5c( scale ) {
    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 40 : scale;
}

DecoratedTorusKnot5c.prototype = Object.create( THREE.Curve.prototype );
DecoratedTorusKnot5c.prototype.constructor = DecoratedTorusKnot5c;

DecoratedTorusKnot5c.prototype.getPoint = function( t, optionalTarget ) {
    let point = optionalTarget || new THREE.Vector3();

    let fi = t * Math.PI * 2;

    let x = Math.cos( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
    let y = Math.sin( 4 * fi ) * ( 1 + 0.5 * ( Math.cos( 5 * fi ) + 0.4 * Math.cos( 20 * fi ) ) );
    let z = 0.35 * Math.sin( 15 * fi );

    return point.set( x, y, z ).multiplyScalar( this.scale );
};

// export

Curves.GrannyKnot = GrannyKnot;
Curves.HeartCurve = HeartCurve;
Curves.VivianiCurve = VivianiCurve;
Curves.KnotCurve = KnotCurve;
Curves.HelixCurve = HelixCurve;
Curves.TrefoilKnot = TrefoilKnot;
Curves.TorusKnot = TorusKnot;
Curves.CinquefoilKnot = CinquefoilKnot;
Curves.TrefoilPolynomialKnot = TrefoilPolynomialKnot;
Curves.FigureEightPolynomialKnot = FigureEightPolynomialKnot;
Curves.DecoratedTorusKnot4a = DecoratedTorusKnot4a;
Curves.DecoratedTorusKnot4b = DecoratedTorusKnot4b;
Curves.DecoratedTorusKnot5a = DecoratedTorusKnot5a;
Curves.DecoratedTorusKnot5c = DecoratedTorusKnot5c;

if (NODEJS_CURVES_EXTRAS) module.exports = Curves;
