/**
 * Thew View part of Food MVC
 * @constructor
 */
var FoodView = function ZORFoodView() {

    this.drawFood = function ZORFoodViewDrawFood(scene, food, foodCount, fogCenterPosition) {
        this.positions = new Float32Array( foodCount * 3 );
        this.colors = new Float32Array( foodCount * 3 );
        this.respawning = new Float32Array( foodCount );

        var foodCrayon = UTIL.getFoodCrayon( config.FOOD_COLORING_TYPE );

        var positions = this.positions;
        var colors = this.colors;
        var respawning = this.respawning;

        // copy food position and food color values from the food array
        // into the typed arrays for the particle system

        var X, Y, Z, R, G, B;
        var offset = 0;
        for (var i = 0; i < foodCount; i++) {

            X = food[ offset     ];
            Y = food[ offset + 1 ];
            Z = food[ offset + 2 ];

            var color = foodCrayon( X, Y, Z );
            R = color.r;
            G = color.g;
            B = color.b;

            respawning[ i ] = 0;

            positions[ offset     ] = X;
            positions[ offset + 1 ] = Y;
            positions[ offset + 2 ] = Z;

            colors[ offset     ] = R;
            colors[ offset + 1 ] = G;
            colors[ offset + 2 ] = B;

            offset += 3;
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
                amplitude                  : { type : "f",  value : 1.0 },
                color                      : { type : "c",  value : new THREE.Color( 0xffffff ) },
                texture                    : { type : "t",  value : this.texture },
                size                       : { type : "f",  value : 3000 },
                mainSpherePos              : { type : "v3", value : fogCenterPosition },
                FOG_FAR                    : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED                : { type : "f",  value : ~~config.FOG_ENABLED },
                ALPHA_ENABLED              : { type : "f",  value : ~~config.PARTICLE_ALPHA_ENABLED },
                FOOD_RESPAWN_ANIM_DURATION : { type : "f",  value : config.FOOD_RESPAWN_ANIM_DURATION },
            },
            vertexShader   : document.getElementById( 'food-vertex-shader' ).textContent,
            fragmentShader : document.getElementById( 'food-fragment-shader' ).textContent,
            transparent    : config.PARTICLE_ALPHA_ENABLED,
            blending       : THREE.AdditiveBlending,
        });

        this.particleSystem = new THREE.Points( this.geometry, this.material );
        scene.add( this.particleSystem );
    };

    /**
     * Decrement the food item at index i if it is gt 0.
     */
    function decfood( v, i, c ) {
        if ( v <= config.FOOD_RESPAWN_ANIM_DURATION ) {
            c[i] = Math.max( 0, v - Math.round( ZOR.LagScale.get() ) );
        }
    };

    this.update = function ZORFoodViewUpdate() {
        // Decrement each food value
        _.map( this.respawning, decfood );
        this.particleSystem.geometry.attributes.respawning.needsUpdate = true;
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
        this.respawning[fi] = config.FOOD_RESPAWN_ANIM_DURATION + 1; // hide food
    };


    /**
     * Show the food at the index
     * @param fi
     */
    this.showFood = function ZORFoodViewShowFood(fi) {
        this.respawning[fi] = config.FOOD_RESPAWN_ANIM_DURATION;
    };

    /**
     * Hide multiple foods
     */
    this.hideFoodMultiple = function ZORFoodViewHideFoodMultiple(foodToHide) {
        _.each( foodToHide, this.hideFood.bind(this) );
    };
};
