#define PI 3.141592653589
#define TWOPI 6.283185307178
uniform float FOG_ENABLED;
uniform float FOG_FAR;
uniform sampler2D sphereTexture;

varying float vIntensity;
varying float sDist;
varying vec3 vNormal;
varying vec3 vNormel;
varying float vDot;
varying vec2 vUv;

void main() {

    float fogp = 1.0;
    if ( FOG_ENABLED != 0.0 ) {
        fogp = 1.0 - sDist / FOG_FAR;
    }

    float strength = vIntensity * fogp; // min( fogp, vIntensity );

    vec4 fragColor = texture2D(sphereTexture, vUv);
    fragColor.a = strength;
    gl_FragColor = fragColor;
}

