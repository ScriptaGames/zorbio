/*
global ZOR:true
global THREE:true
global SPE:true
*/

ZOR.TrailTemplates = {
    getTrail: function ZORGetTrail(type, variables) {
        const trailTypes = {
            particle: {
                type : 'particle',
                group: {
                    scale  : Math.max(window.innerWidth, window.innerHeight),
                    texture: {
                        value: new THREE.TextureLoader().load( 'skins/images/smoke_particle.png' ),
                    },
                    maxParticleCount: 800,
                },
                emitter: {
                    maxAge: {
                        value: 8,
                        // spread: 2,
                    },
                    position: {
                        value       : new THREE.Vector3(0, 0, 0),
                        spread      : new THREE.Vector3(0, 0, 0),
                        spreadClamp : new THREE.Vector3(0, 0, 0),
                        radius      : 5,
                        distribution: SPE.distributions.SPHERE,
                    },

                    opacity: {
                        value: [variables.opacity, 0],
                    },

                    angle: {
                        value : [0],
                        spread: [8, 0],
                    },

                    drag: {
                        value: 8.0,
                    },

                    color: {
                        value: new THREE.Color( variables.color ),
                    },

                    size: {
                        value: [6, 0],
                    },

                    particleCount   : 800,
                    activeMultiplier: 0.1,
                },
            },

            line: {
                type       : 'line',
                customScale: 1.0,
                lineWidth  : function lineWidth( p ) {
                    return p;
                },
                origins: [
                    new THREE.Vector3(0.9, 0, 0),
                    new THREE.Vector3(-0.9, 0, 0),
                ],
                color: new THREE.Color( variables.color ),
            },
        };

        return trailTypes[type];
    },
};
