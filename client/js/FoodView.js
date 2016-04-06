/**
 * Thew View part of Food MVC
 * @constructor
 */
var FoodView = function ZORFoodView() {

    this.drawFood = function ZORFoodViewDrawFood(scene, food, foodCount, fogCenterPosition, octree) {
        this.translate = new Float32Array( foodCount * 3 );
        this.colors = new Float32Array( foodCount * 3 );
        this.respawning = new Float32Array( foodCount );

        this.geometry = new THREE.InstancedBufferGeometry();
        this.geometry.copy( new THREE.PlaneBufferGeometry( 2, 2 ) );
        // this.geometry.copy( new THREE.CircleBufferGeometry( 1, 6 ) );

        var foodCrayon = UTIL.getFoodCrayon( config.FOOD_COLORING_TYPE );

        var translate = this.translate;
        var colors = this.colors;
        var respawning = this.respawning;

        // copy food translate and food color values from the food array
        // into the typed arrays for the particle system

        var X, Y, Z, R, G, B;
        var offset = 0;
        for (var i = 0, l = foodCount; i < l; i++) {

            X = food[ offset     ];
            Y = food[ offset + 1 ];
            Z = food[ offset + 2 ];

            var color = foodCrayon( X, Y, Z );
            R = color.r;
            G = color.g;
            B = color.b;

            respawning[ i ] = 0;

            translate[ offset     ] = X;
            translate[ offset + 1 ] = Y;
            translate[ offset + 2 ] = Z;

            colors[ offset     ] = R;
            colors[ offset + 1 ] = G;
            colors[ offset + 2 ] = B;

            // Add this food object to the Octree
            var foodObj = {x: X, y: Y, z: Z, radius: 1, fi: i};
            octree.add( foodObj );

            offset += 3;
        }

        this.geometry.addAttribute( 'translate', new THREE.InstancedBufferAttribute( translate, 3, 1 ) );
        this.geometry.addAttribute( 'respawning', new THREE.InstancedBufferAttribute( respawning, 1, 1 ) );
        this.geometry.addAttribute( 'color', new THREE.InstancedBufferAttribute( colors, 3, 1 ) );

        this.material = new THREE.RawShaderMaterial( {
            uniforms: {
                map: { type: "t", value: new THREE.TextureLoader().load( "textures/soft-square.png" ) },
                mainSpherePos              : { type : "v3", value : fogCenterPosition },
                FOG_FAR                    : { type : "f",  value : config.FOG_FAR },
                FOG_ENABLED                : { type : "f",  value : ~~config.FOG_ENABLED },
                ALPHA_ENABLED              : { type : "f",  value : ~~config.FOOD_ALPHA_ENABLED },
                FOOD_RESPAWN_ANIM_DURATION : { type : "f",  value : config.FOOD_RESPAWN_ANIM_DURATION },
            },
            vertexShader: document.getElementById( 'food-vertex-shader' ).textContent,
            fragmentShader: document.getElementById( 'food-frag-shader' ).textContent,
            depthTest: true,
            depthWrite: true,
            // alphaTest: 0.5,
            // transparent: true,
        } );

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.frustumCulled = false;

        scene.add( this.mesh );
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

        var c = this.respawning; // c = collection
        var i = c.length;        // i = index
        var v;                   // v = value
        var duration = config.FOOD_RESPAWN_ANIM_DURATION;
        var lsGet = ZOR.LagScale.get;

        while( i-- ) {
            v = c[i];

            if ( v <= duration ) {
                c[i] = Math.max( 0, v - Math.round( lsGet() ) );
            }
        }

        this.mesh.geometry.attributes.respawning.needsUpdate = true;
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
