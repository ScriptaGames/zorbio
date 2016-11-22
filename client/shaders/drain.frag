#define MAX_OPACITY 0.55

uniform float time;
uniform float power;
uniform float len;
uniform vec3 erColor;
uniform vec3 eeColor;
uniform float FOG_ENABLED;
uniform float FOG_FAR;
varying vec2 vUv;
varying float vDist;

float fade(float x) {
    // fade out near the ends of the cylinder according to equation:
    // https://www.desmos.com/calculator/uergngo1w6
    float hh = 0.5;
    float n = x - 0.5;
    return 1.0 - n*n/hh/hh;
}

void main(void) {

    float fogp = 1.0;

    if ( FOG_ENABLED != 0.0 ) {
        /* if ( vDist > FOG_FAR ) discard; */
        fogp = 1.0 - vDist / FOG_FAR;
        // also, drop any foods beyond frustum
    }

    vec3 color = vec3((sin(10.0 * vUv.y - time*8.0) + 0.5) / 2.0);

    color *= mix(erColor, eeColor, 1.0 - vUv.y);

    float alpha = MAX_OPACITY * power * fade(vUv.y) * fogp;

    gl_FragColor = vec4(vec3(color), alpha);
}
