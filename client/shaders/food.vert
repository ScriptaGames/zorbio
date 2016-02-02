uniform float size;
uniform vec3 mainSpherePos;

attribute vec3 ca;
attribute float respawning;

varying vec3 vColor;
varying float vRespawning;
varying float sDist;
varying float vDist;

void main() {

    vRespawning = respawning;
    vColor      = ca;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    vDist = length( mvPosition.xyz ); // distance from camera

    sDist = length( position - mainSpherePos ); // distance from sphere to particle

    // point size is relative to distance from camera
    gl_PointSize = size / vDist;

    gl_Position = projectionMatrix * mvPosition;

}
