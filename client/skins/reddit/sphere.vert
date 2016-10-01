uniform vec3 mainSpherePos;
uniform vec3 spherePos;

uniform float c;
uniform float p;

uniform float FOG_ENABLED;
uniform float FOG_FAR;

varying float vIntensity;
varying float sDist;
varying vec3 vNormal;
varying vec3 vNormel;
varying float vDot;
varying vec2 vUv;

void main() {
    vUv = uv;
    /* vec3 viewVector = cameraPosition - spherePos; */
    vec3 viewVector = vec3(0.0, 0.0, 1.0);
    vec3 vNormal = normalize( normalMatrix * normal );
    vec3 vNormel = normalize( normalMatrix * viewVector );
    vDot = dot(vNormal, vNormel);
    vIntensity = pow( c - vDot, p );

    vec4 mMainSpherePos = modelViewMatrix * vec4( mainSpherePos, 1.0 );
    vec4 mSpherePos = modelViewMatrix * vec4( spherePos, 1.0 );

    sDist = length( mainSpherePos - spherePos ); // distance from main sphere to this sphere

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
