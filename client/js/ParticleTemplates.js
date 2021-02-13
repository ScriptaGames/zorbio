/*
global ZOR:true,
 THREE:true,
 SPE:true
*/

ZOR.ParticleTemplates = {
    getParticleEffect: function ZORGetParticleEffect(type, variables) {
        const particleEffects = {
            fiery_explosion: {
                customScale: 1.0,

                group: {
                    scale           : Math.max( window.innerWidth, window.innerHeight ),
                    maxParticleCount: 1000,

                    texture: {
                        value: new THREE.TextureLoader().load( 'textures/smoke_particle.png' ),
                    },

                    blending: THREE.AdditiveBlending,
                },

                emitter: {
                    type: SPE.distributions.SPHERE,

                    position: {
                        spread: new THREE.Vector3( 10 ),
                        radius: 10,
                    },

                    velocity: {
                        spread: new THREE.Vector3( 100 ),
                    },

                    size: {
                        value: [40, 0],
                    },

                    opacity: {
                        value: [1, 0],
                    },

                    color: {
                        value: [new THREE.Color( 'yellow' ), new THREE.Color( 'red' )],
                    },

                    particleCount: 100,
                    alive        : false,
                    duration     : 0.05,
                    maxAge       : {
                        value: 1,
                    },
                },
            },

            bubbles: {
                customScale: 1.0,

                group: {
                    scale           : Math.max( window.innerWidth, window.innerHeight ),
                    maxParticleCount: 1000,
                    texture         : {
                        value: new THREE.TextureLoader().load( 'textures/bubble_particle.png' ),
                    },

                    blending: THREE.AdditiveBlending,
                },

                emitter: {
                    type: SPE.distributions.SPHERE,

                    position: {
                        spread: new THREE.Vector3( 5 ),
                        radius: 10,
                    },

                    velocity: {
                        spread: new THREE.Vector3( 100 ),
                    },

                    size: {
                        value: [60, 0],
                    },

                    opacity: {
                        value: [1, 0],
                    },

                    color: {
                        value: [new THREE.Color( variables.color )],
                    },

                    particleCount: 70,
                    alive        : false,
                    duration     : 0.05,
                    maxAge       : {
                        value: 1,
                    },
                },
            },
        };

        return particleEffects[type];
    },
};

