#define MAX_OPACITY 0.75

uniform vec3 mainSpherePos;
uniform vec3 pos;
uniform float erSize;
uniform float eeSize;
uniform float sizeSpread;
uniform float time;
uniform float power;
uniform float len;
uniform vec3 erColor;
uniform vec3 eeColor;
uniform float FOG_ENABLED;
uniform float FOG_FAR;

#ifdef USE_MORPHTARGETS
#ifndef USE_MORPHNORMALS
uniform float morphTargetInfluences[ 8 ];
#else
uniform float morphTargetInfluences[ 4 ];
#endif
#endif

varying vec4 vColor;

float fade(float x) {
    // fade out near the ends of the cylinder according to equation:
    // https://www.desmos.com/calculator/uergngo1w6
    float hh = 0.5;
    float n = x - 0.5;
    return 1.0 - n*n/hh/hh;
}

float sizeFade(float er, float ee) {
    return 0.9 * (ee - er) / sizeSpread + 0.1;
}


void main() {

    vec3 transformed = vec3( position );

#ifdef USE_MORPHTARGETS
    transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
    transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
    transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
    transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
#ifndef USE_MORPHNORMALS
    transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
    transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
    transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
    transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
#endif
#endif
    float dist = length( pos - mainSpherePos );

    float fogp = 1.0;

    if ( FOG_ENABLED != 0.0 ) {
        /* if ( vDist > FOG_FAR ) discard; */
        fogp = 1.0 - dist / FOG_FAR;
        // also, drop any foods beyond frustum
    }

    vec3 color = vec3((sin(10.0 * uv.y - time*8.0) + 0.5) / 2.0);

    color *= mix(erColor, eeColor, 1.0 - uv.y);

    float alpha = MAX_OPACITY * power * fade(uv.y) * sizeFade(erSize, eeSize) * fogp;
    vColor = vec4(color, alpha);

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
