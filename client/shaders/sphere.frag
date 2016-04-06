#define PI 3.141592653589
#define TWOPI 6.283185307178
uniform vec3 color;
uniform vec3 colorHSL;
uniform float FOG_ENABLED;
uniform float FOG_FAR;

varying float vIntensity;
varying float sDist;
varying vec3 vNormal;
varying vec3 vNormel;
varying float vDot;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {

    float fogp = 1.0;
    vec3 mColor = rgb2hsv(color);
    mColor.x += vDot / TWOPI;
    /* hsl2rgb( vIntensity / (PI/2.0), 1.0, 0.7) * color; */

    mColor = hsv2rgb(mColor);

    if ( FOG_ENABLED != 0.0 ) {
        fogp = 1.0 - sDist / FOG_FAR;
    }

    float strength = vIntensity * fogp; // min( fogp, vIntensity );

    gl_FragColor = vec4( mColor, strength );
}

