uniform vec3 color;
uniform float FOG_ENABLED;
uniform float FOG_FAR;

varying float intensity;
varying float sDist;

void main() {

    float fogp = 1.0;

    if ( FOG_ENABLED != 0.0 ) {
        fogp = 1.0 - sDist / FOG_FAR;
    }

    float strength = intensity * fogp; // min( fogp, intensity );

    gl_FragColor = vec4( color, strength );
}
