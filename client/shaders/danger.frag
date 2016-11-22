varying vec3 vColor;
varying float vDistanceOpacity;

void main() {
    vec4 fragColor = vec4(vColor, vDistanceOpacity);
    /* vec4 fragColor = vec4(vColor, 0.5); */
    gl_FragColor = fragColor;
}
