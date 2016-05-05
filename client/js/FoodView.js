/**
 * Thew View part of Food MVC
 * @constructor
 */
var FoodView = function ZORFoodView() {

    function createFoodGeometry() {
        var geom = new THREE.BoxGeometry(2, 2, 2);
        return geom;
    }

    this.drawFood = function ZORFoodViewDrawFood(scene, food, foodCount, fogCenterPosition, octree) {

        var geometry = createFoodGeometry();

        this.position   = new Float32Array( foodCount * geometry.faces.length * 3 * 3 );
        this.colors     = new Float32Array( foodCount * geometry.faces.length * 3 * 3 );
        this.normals    = new Float32Array( foodCount * geometry.faces.length * 3 * 3 );
        this.respawning = new Float32Array( foodCount * 3 );

        console.log(`position array length ${this.position.length}`);
        console.log(`faces per geo: ${geometry.faces.length}`);
        console.log(`foodCount ${foodCount}`);

        this.buffer_geometry = new THREE.BufferGeometry();

        var foodCrayon = UTIL.getFoodCrayon( config.FOOD_COLORING_TYPE );

        var position   = this.position;
        var colors     = this.colors;
        var respawning = this.respawning;
        var normals    = this.normals;

        // copy food position and food color values from the food array
        // into the typed arrays for the particle system

        var X, Y, Z, R, G, B;
        var offset = 0;
        for (var i = 0; i < foodCount; ++i) {

            geometry = createFoodGeometry();

            X = food[ offset     ];
            Y = food[ offset + 1 ];
            Z = food[ offset + 2 ];

            geometry.translate( X, Y, Z );

            // Add this food object to the Octree
            var foodObj = {x: X, y: Y, z: Z, radius: 1, fi: i};
            octree.add( foodObj );

            var color = foodCrayon( X, Y, Z );
            R = color.r;
            G = color.g;
            B = color.b;

            // console.log(`cube ${i}`);

            for (var f = 0; f < position.length; ++f) {
                var face = geometry.faces[];

                colors[f+0] = R; colors[f+1] = G; colors[f+2] = B;
                colors[f+3] = R; colors[f+4] = G; colors[f+5] = B;
                colors[f+6] = R; colors[f+7] = G; colors[f+8] = B;
            }

            // for (var f = 0; f < geometry.faces.length; ++f) {
            //     var face = geometry.faces[f];
            //     var fi = i * geometry.faces.length + f;

            //     console.log(fi);

            //     // vertex 1
            //     position[ fi + 0 ] = geometry.vertices[ face.a ].x;
            //     position[ fi + 1 ] = geometry.vertices[ face.a ].y;
            //     position[ fi + 2 ] = geometry.vertices[ face.a ].z;
            //     // vertex 2
            //     position[ fi + 3 ] = geometry.vertices[ face.b ].x;
            //     position[ fi + 4 ] = geometry.vertices[ face.b ].y;
            //     position[ fi + 5 ] = geometry.vertices[ face.b ].z;
            //     // vertex 3
            //     position[ fi + 6 ] = geometry.vertices[ face.c ].x;
            //     position[ fi + 7 ] = geometry.vertices[ face.c ].y;
            //     position[ fi + 8 ] = geometry.vertices[ face.c ].z;

            //     normals[ fi + 0 ] = face.normal.x; normals[ fi + 1 ] = face.normal.y; normals[ fi + 2 ] = face.normal.z;
            //     normals[ fi + 3 ] = face.normal.x; normals[ fi + 4 ] = face.normal.y; normals[ fi + 5 ] = face.normal.z;
            //     normals[ fi + 6 ] = face.normal.x; normals[ fi + 7 ] = face.normal.y; normals[ fi + 8 ] = face.normal.z;

            //     colors[ fi + 0 ] = R; colors[ fi + 1 ] = G; colors[ fi + 2 ] = B;
            //     colors[ fi + 3 ] = R; colors[ fi + 4 ] = G; colors[ fi + 5 ] = B;
            //     colors[ fi + 6 ] = R; colors[ fi + 7 ] = G; colors[ fi + 8 ] = B;
            // }

            offset += 3;
        }

        this.buffer_geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ) );
        this.buffer_geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
        this.buffer_geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        this.buffer_geometry.addAttribute( 'respawning', new THREE.BufferAttribute( respawning, 1 ) );

        this.buffer_geometry.computeBoundingBox();

        // this.material = new THREE.RawShaderMaterial( {
        //     uniforms: {
        //         map: { type: "t", value: new THREE.TextureLoader().load( "textures/soft-square.png" ) },
        //         mainSpherePos              : { type : "v3", value : fogCenterPosition },
        //         FOG_FAR                    : { type : "f",  value : config.FOG_FAR },
        //         FOG_ENABLED                : { type : "f",  value : ~~config.FOG_ENABLED },
        //         ALPHA_ENABLED              : { type : "f",  value : ~~config.FOOD_ALPHA_ENABLED },
        //         FOOD_RESPAWN_ANIM_DURATION : { type : "f",  value : config.FOOD_RESPAWN_ANIM_DURATION },
        //     },
        //     vertexShader: document.getElementById( 'food-vertex-shader' ).textContent,
        //     fragmentShader: document.getElementById( 'food-frag-shader' ).textContent,
        //     depthTest: true,
        //     depthWrite: true,
        //     // alphaTest: 0.5,
        //     // transparent: true,
        // } );

        this.material = new THREE.MeshNormalMaterial({
            // side: THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh( this.buffer_geometry, this.material );

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
