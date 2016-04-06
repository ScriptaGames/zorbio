precision highp float;

uniform sampler2D map;

uniform float FOG_ENABLED;
uniform float FOG_FAR;
uniform float ALPHA_ENABLED;
uniform float FOOD_RESPAWN_ANIM_DURATION;

varying vec2 vUv;
varying vec3 vColor;
varying float vRespawning;
varying float sDist;
varying float vGrowing;

void main() {

    float fogp = 1.0;
    float alpha = 1.0;
    vec4 diffuseColor = texture2D( map, vUv );

    if ( diffuseColor.w < 0.5 ) discard;
    if ( vRespawning > FOOD_RESPAWN_ANIM_DURATION ) discard;

    if ( FOG_ENABLED != 0.0 ) {
        fogp = 1.0 - sDist / FOG_FAR;
        // also, drop any foods beyond frustum
        if ( sDist > FOG_FAR ) discard;
    }

    if ( ALPHA_ENABLED != 0.0 ) {
        alpha = fogp - 0.3;
        alpha *= vGrowing;
    }

    alpha *= diffuseColor.w;

    gl_FragColor = vec4( fogp * diffuseColor.xyz * vColor, alpha );

}
