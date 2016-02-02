uniform vec3 color;
uniform sampler2D texture;
uniform float FOG_ENABLED;
uniform float FOG_FAR;

varying vec3 vColor;
varying float vRespawning;
varying float sDist;

void main() {

    float fogp = 1.0;

    // when food's respawning value is > 0.0, it's still counting
    // down to respawn
    if ( vRespawning > 0.0 ) discard;

    if ( FOG_ENABLED != 0.0 ) {
        fogp = 1.0 - sDist / FOG_FAR;
    }

    gl_FragColor = vec4( fogp * vColor, 1.0 );

    // texture2D( texture, gl_PointCoord );

}
