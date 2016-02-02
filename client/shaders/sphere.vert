uniform vec3 color;
uniform vec3 cameraPos;
uniform vec3 mainSpherePos;
uniform vec3 spherePos;

uniform float c;
uniform float p;

uniform float FOG_ENABLED;
uniform float FOG_FAR;

varying float intensity;
varying float sDist;

void main() {
    vec3 viewVector = cameraPos - spherePos;
    vec3 vNormal = normalize( normalMatrix * normal );
    vec3 vNormel = normalize( normalMatrix * viewVector );
    intensity = pow( c - dot(vNormal, vNormel), p );

    vec4 mMainSpherePos = modelViewMatrix * vec4( mainSpherePos, 1.0 );
    vec4 mSpherePos = modelViewMatrix * vec4( spherePos, 1.0 );

    sDist = length( mainSpherePos - spherePos ); // distance from main sphere to this sphere

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
