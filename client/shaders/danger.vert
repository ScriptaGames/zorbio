
// as camera nears this mesh, at what distance does it begin to fade out
#define FADE_DIST 400.0
// what's the lowest the alpha can go based on camera distance
#define MIN_ALPHA 0.1
#define MAX_ALPHA 0.6

uniform float c;
uniform float p;
uniform float upperRiskRange;
uniform float lowerRiskRange;
uniform float playerSize;
uniform float sphereSize;
uniform vec3 dangerColor;
uniform vec3 safetyColor;
uniform vec3 nearbyColor;

float dangerLevel;
varying vec3 vColor;
varying float vDistanceOpacity;

void main() {
    vec4 csPosition = modelViewMatrix * vec4(position, 1.0);
    float distToCamera = -csPosition.z;
    float cameraDist = clamp(distToCamera, 0.0, FADE_DIST) / FADE_DIST;
    vDistanceOpacity = clamp(cameraDist, MIN_ALPHA, MAX_ALPHA);

    dangerLevel = clamp(sphereSize - playerSize, -lowerRiskRange, upperRiskRange);
    if ( dangerLevel > 0.0 ) {
        // sphere is larger than player
        vColor = mix(nearbyColor, dangerColor, dangerLevel/upperRiskRange);
    }
    else {
        // sphere is smaller than player
        vColor = mix(nearbyColor, safetyColor, -dangerLevel/lowerRiskRange);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
