
// as camera nears this mesh, at what distance does it begin to fade out
#define FADE_DIST 400.0
// what's the lowest the alpha can go based on camera distance
#define MIN_ALPHA 0.1
#define MAX_ALPHA 0.6

uniform float c;
uniform float p;
uniform float riskSpread;
uniform float playerSize;
uniform float sphereSize;
uniform vec3 dangerColor;
uniform vec3 safetyColor;
uniform vec3 nearbyColor;

varying float vDangerLevel;
varying vec3 vColor;
varying float vDistanceOpacity;

void main() {
    vDangerLevel = clamp(sphereSize - playerSize, -riskSpread, riskSpread) / riskSpread;
    vec4 csPosition = modelViewMatrix * vec4(position, 1.0);
    float distToCamera = -csPosition.z;
    float cameraDist = clamp(distToCamera, 0.0, FADE_DIST) / FADE_DIST;
    vDistanceOpacity = clamp(cameraDist, MIN_ALPHA, MAX_ALPHA);
    if ( vDangerLevel > 0.0 ) {
        // sphere is larger than player
        vColor = mix(nearbyColor, dangerColor, vDangerLevel);
    }
    else {
        // sphere is smaller than player
        vColor = mix(nearbyColor, safetyColor, -vDangerLevel);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
