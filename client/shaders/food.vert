precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 mainSpherePos;
uniform float FOOD_RESPAWN_ANIM_DURATION;

attribute vec3 translate;
attribute vec2 uv;
attribute vec3 normal;
attribute vec3 position;
attribute vec3 color;
attribute float respawning;

varying vec2 vUv;
varying vec3 vColor;

varying float vRespawning;
varying float sDist;
/* varying float vDist; */
varying float vGrowing;

void main() {

    vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );

    float growing = 1.0 - respawning / FOOD_RESPAWN_ANIM_DURATION;

    mvPosition.xyz += position * growing;

    vRespawning = respawning;
    vUv         = uv;
    vColor      = color;
    /* vDist       = length( mvPosition.xyz ); // distance from camera */
    sDist       = length( translate - mainSpherePos ); // distance from sphere to particle
    vGrowing    = growing;

    gl_Position = projectionMatrix * mvPosition;

}
