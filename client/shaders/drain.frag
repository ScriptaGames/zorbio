#define MAX_OPACITY 0.30

uniform float time;
uniform float power;
uniform float len;
uniform vec3 erColor;
uniform vec3 eeColor;
varying vec2 vUv;

float fade(float x) {
    // fade out near the ends of the cylinder according to equation:
    // https://www.desmos.com/calculator/uergngo1w6
    float hh = 0.5;
    float n = x - 0.5;
    return 1.0 - n*n/hh/hh;
}

void main(void) {

    vec3 color = vec3((sin(10.0 * vUv.y - time*8.0) + 0.5) / 2.0);

    color *= mix(erColor, eeColor, 1.0 - vUv.y);

    float alpha = MAX_OPACITY * power * fade(vUv.y);

    gl_FragColor = vec4(vec3(color), alpha);
}
