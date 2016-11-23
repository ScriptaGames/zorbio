varying vec3 vColor;
varying float vIntensity;

void main() {
    vec4 fragColor = vec4(vColor, vIntensity);
    /* vec4 fragColor = vec4(vColor, 0.5); */
    gl_FragColor = fragColor;
}
