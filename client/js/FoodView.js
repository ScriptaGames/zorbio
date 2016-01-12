/**
 * Thew View part of Food MVC
 * @constructor
 */
var FoodView = function ZORFoodView() {

    this.drawFood = function ZORFoodViewDrawFood(scene, food, foodCount, fogCenterPosition) {
        this.positions = new Float32Array( foodCount * 3 );
        this.colors = new Float32Array( foodCount * 3 );
        this.respawning = new Float32Array( foodCount );

        var positions = this.positions;
        var colors = this.colors;
        var respawning = this.respawning;

        // copy food position and food color values from the food array
        // into the typed arrays for the particle system

        var X, Y, Z, R, G, B;
        var particle_index = 0;
        var food_index = 0;
        for (var i = 0; i < foodCount; i++) {

            X = food[ food_index     ];
            Y = food[ food_index + 1 ];
            Z = food[ food_index + 2 ];
            R = food[ food_index + 3 ];
            G = food[ food_index + 4 ];
            B = food[ food_index + 5 ];

            respawning[ i ] = 0;

            positions[ particle_index     ] = X;
            positions[ particle_index + 1 ] = Y;
            positions[ particle_index + 2 ] = Z;

            colors[ particle_index     ] = R;
            colors[ particle_index + 1 ] = G;
            colors[ particle_index + 2 ] = B;

            particle_index += 3;
            food_index += 6;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        this.geometry.addAttribute( 'respawning', new THREE.BufferAttribute( respawning, 1 ) );
        this.geometry.addAttribute( 'ca', new THREE.BufferAttribute( colors, 3 ) );

        this.texture = THREE.ImageUtils.loadTexture( "textures/solid-particle.png" );
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;

        this.material = new THREE.ShaderMaterial( {

            uniforms: {
                amplitude     : { type : "f", value  : 1.0 },
                color         : { type : "c", value  : new THREE.Color( 0xffffff ) },
                texture       : { type : "t", value  : this.texture },
                size          : { type : "f", value  : 3000 },
                mainSpherePos : { type : "v3", value : fogCenterPosition },
                FOG_FAR       : { type : "f", value  : config.FOG_FAR },
                FOG_ENABLED   : { type : "f", value  : ~~config.FOG_ENABLED }
            },
            vertexShader:   document.getElementById( 'food-vertex-shader' ).textContent,
            fragmentShader: document.getElementById( 'food-fragment-shader' ).textContent,
            transparent:    false,
            depthTest:      true

        });

        this.particleSystem = new THREE.Points( this.geometry, this.material );
        scene.add( this.particleSystem );
    };

    /**
     * Checks if a food index is alive and can be eaten
     * @param fi
     * @returns {boolean}
     */
    this.aliveFood = function ZORFoodViewAliveFood(fi) {
        return this.respawning[fi] === 0;
    };

    /**
     * Hide the food at the index.
     * @param fi
     */
    this.hideFood = function ZORFoodViewHideFood(fi) {
        if (typeof this.respawning[fi] !== 'undefined') {
            this.respawning[fi] = 1; // hide food
            this.particleSystem.geometry.attributes.respawning.needsUpdate = true;
        }
    };


    /**
     * Show the food at the index
     * @param fi
     */
    this.showFood = function ZORFoodViewShowFood(fi) {
        if (typeof this.respawning[fi] !== 'undefined') {
            this.respawning[fi] = 0;
            this.particleSystem.geometry.attributes.respawning.needsUpdate = true;
        }
    };

    /**
     * Hide multiple foods
     */
    this.hideFoodMultiple = function ZORFoodViewHideFoodMultiple(foodToHide) {
        // hide all food in the array
        for (var i = 0, l = foodToHide.length; i < l; i++) {
            this.respawning[foodToHide[i]] = 1; // hide food
        }
        this.particleSystem.geometry.attributes.respawning.needsUpdate = true;
    };
};
