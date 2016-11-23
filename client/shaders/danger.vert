
// as camera nears this mesh, at what distance does it begin to fade out
#define FADE_DIST 300.0
// what's the lowest the alpha can go based on camera distance
#define MIN_ALPHA 0.6
#define MAX_ALPHA 0.6

#define C 1.0
#define P 3.0

uniform float upperRiskRange;
uniform float lowerRiskRange;
uniform float playerSize;
uniform float sphereSize;
uniform vec3 dangerColor;
uniform vec3 safetyColor;
uniform vec3 nearbyColor;
uniform vec3 spherePos;
uniform vec3 cameraPos;

float dangerLevel;
varying vec3 vColor;
varying float vIntensity;

void main() {
    dangerLevel = clamp(sphereSize - playerSize, -lowerRiskRange, upperRiskRange);
    if ( dangerLevel > 0.0 ) {
        // sphere is larger than player
        vColor = mix(nearbyColor, dangerColor, dangerLevel/upperRiskRange);
    }
    else {
        // sphere is smaller than player
        vColor = mix(nearbyColor, safetyColor, -dangerLevel/lowerRiskRange);
    }

    vec3 viewVector = cameraPos - spherePos;
    vec3 vNormal = normalize( normalMatrix * normal );
    vec3 vNormel = normalize( normalMatrix * viewVector );
    vIntensity = pow( C - dot(vNormal, vNormel), P );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
