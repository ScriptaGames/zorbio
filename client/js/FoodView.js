/**
 * Thew View part of Food MVC
 * @constructor
 */
var FoodView = function ZORFoodView() {

    function createFoodGeometry() {
        var geom = new THREE.BoxGeometry(10, 10, 10);
        return geom;
    }

    this.drawFood = function ZORFoodViewDrawFood(scene, food, foodCount, fogCenterPosition, octree) {

        var self = this;

        this.geometry = createFoodGeometry();

        this.position   = new Float32Array( foodCount * this.geometry.faces.length * 3 * 3 );
        this.colors     = new Float32Array( foodCount * this.geometry.faces.length * 3 * 3 );
        this.normals    = new Float32Array( foodCount * this.geometry.faces.length * 3 * 3 );
        this.respawning = new Float32Array( foodCount * 3 );

        console.log(`position array length ${this.position.length}`);

        this.buffer_geometry = new THREE.BufferGeometry();

        var foodCrayon = UTIL.getFoodCrayon( config.FOOD_COLORING_TYPE );

        var position = this.position;
        var colors = this.colors;
        var respawning = this.respawning;

        // copy food position and food color values from the food array
        // into the typed arrays for the particle system

        var X, Y, Z, R, G, B;
        var offset = 0;
        for (var i = 0, l = foodCount; i < l; i++) {

            X = food[ offset     ];
            Y = food[ offset + 1 ];
            Z = food[ offset + 2 ];

            this.geometry.translate( X / 100, Y / 100, Z / 100 );

            console.log(`translated to ${X}, ${Y}, ${Z}`);

            // Add this food object to the Octree
            var foodObj = {x: X, y: Y, z: Z, radius: 1, fi: i};
            octree.add( foodObj );

            var color = foodCrayon( X, Y, Z );
            R = color.r;
            G = color.g;
            B = color.b;

            respawning[ i ] = 0;

            //

            // position[ offset     ] = X;
            // position[ offset + 1 ] = Y;
            // position[ offset + 2 ] = Z;

            // colors[ offset     ] = R;
            // colors[ offset + 1 ] = G;
            // colors[ offset + 2 ] = B;

            this.geometry.faces.forEach( function ( face, index ) {
                var fi = i * self.geometry.faces.length;
                // console.log(`updating face ${fi} of food ${i}`);
                self.position[ fi * 9 + 0 ] = self.geometry.vertices[ face.a ].x;
                self.position[ fi * 9 + 1 ] = self.geometry.vertices[ face.a ].y;
                self.position[ fi * 9 + 2 ] = self.geometry.vertices[ face.a ].z;
                self.position[ fi * 9 + 3 ] = self.geometry.vertices[ face.b ].x;
                self.position[ fi * 9 + 4 ] = self.geometry.vertices[ face.b ].y;
                self.position[ fi * 9 + 5 ] = self.geometry.vertices[ face.b ].z;
                self.position[ fi * 9 + 6 ] = self.geometry.vertices[ face.c ].x;
                self.position[ fi * 9 + 7 ] = self.geometry.vertices[ face.c ].y;
                self.position[ fi * 9 + 8 ] = self.geometry.vertices[ face.c ].z;

                self.normals[ fi * 9 + 0 ] = face.normal.x;
                self.normals[ fi * 9 + 1 ] = face.normal.y;
                self.normals[ fi * 9 + 2 ] = face.normal.z;
                self.normals[ fi * 9 + 3 ] = face.normal.x;
                self.normals[ fi * 9 + 4 ] = face.normal.y;
                self.normals[ fi * 9 + 5 ] = face.normal.z;
                self.normals[ fi * 9 + 6 ] = face.normal.x;
                self.normals[ fi * 9 + 7 ] = face.normal.y;
                self.normals[ fi * 9 + 8 ] = face.normal.z;

                self.colors[ fi * 9 + 0 ] = R;
                self.colors[ fi * 9 + 1 ] = G;
                self.colors[ fi * 9 + 2 ] = B;
                self.colors[ fi * 9 + 3 ] = R;
                self.colors[ fi * 9 + 4 ] = G;
                self.colors[ fi * 9 + 5 ] = B;
                self.colors[ fi * 9 + 6 ] = R;
                self.colors[ fi * 9 + 7 ] = G;
                self.colors[ fi * 9 + 8 ] = B;
            });

            offset += 3;
        }

        this.buffer_geometry.addAttribute( 'position', new THREE.BufferAttribute( this.position, 3 ) );
        this.buffer_geometry.addAttribute( 'normal', new THREE.BufferAttribute( this.normals, 3 ) );
        this.buffer_geometry.addAttribute( 'color', new THREE.BufferAttribute( this.colors, 3 ) );
        this.buffer_geometry.addAttribute( 'respawning', new THREE.BufferAttribute( this.respawning, 1 ) );

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
            side: THREE.DoubleSide,
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
