/**
 * The Controller part of Food MVC
 * @param model
 * @param fogCenterPosition
 * @constructor
 */
var FoodController = function ZORFoodController(model, fogCenterPosition) {

    this.model = model;
    this.view = new FoodView();
    this.fogCenterPosition = new THREE.Vector3();

    this.fogCenterPosition.copy(fogCenterPosition);

    // create octree
    this.octree = new THREE.Octree( {
        // when undeferred = true, objects are inserted immediately
        // instead of being deferred until next octree.update() call
        // this may decrease performance as it forces a matrix update
        undeferred: true,
        // set the max depth of tree
        depthMax: Infinity,
        // max number of objects before nodes split or merge
        objectsThreshold: 8,
        // percent between 0 and 1 that nodes will overlap each other
        // helps insert objects that lie over more than one node
        overlapPct: 0.15,
        //scene: scene
    } );

    this.drawFood = function ZORFoodControllerDrawFood(scene) {
        this.view.drawFood(scene, this.model.food, this.model.foodCount, this.fogCenterPosition, this.octree);
    };

    /**
     * Any updates to be run during main loop
     * @param fogCenterPosition
     */
    this.update = function ZORFoodControllerUpdate(fogCenterPosition) {

        // update the center position of the fog
        this.fogCenterPosition.copy(fogCenterPosition);

        this.view.update();
    };

    /**
     * Returns true of the food controller is fully initialed and drawn and ready to use
     * @returns {boolean}
     */
    this.isInitialized = function ZORFoodControllerIsInitialized() {
        return this.view.initialized;
    };

    /**
     * Checks if a food index is alive and can be eaten
     * @param fi
     * @returns {boolean}
     */
    this.aliveFood = function ZORFoodControllerAliveFood(fi) {
        return this.view.aliveFood(fi);
    };

    /**
     * Hide the food at the index.
     * @param fi
     */
    this.hideFood = function ZORFoodControllerHideFood(fi) {
        this.view.hideFood(fi);
    };


    /**
     * Show the food at the index
     * @param fi
     */
    this.showFood = function ZORFoodControllerShowFood(fi) {
        this.view.showFood(fi);
    };

    /**
     * Hide multiple foods
     */
    this.hideFoodMultiple = function ZORFoodViewHideFoodMultipleFood(foodToHide) {
       this.view.hideFoodMultiple(foodToHide);
    };

    /**
     * Checks for food captures and executes a callback for each capture
     * @param thePlayer
     * @param callback
     */
    this.checkFoodCaptures = function ZORFoodControllerCheckFoodCaptures(thePlayer, callback) {
        //var start = performance.now();

        var i, l;
        var dist = 0;
        var mainSphere = thePlayer.view.mainSphere;
        var sphere_radius = thePlayer.radius();

        var foodList = this.octree.search( mainSphere.position, sphere_radius + 25 );

        for ( i = 0, l = foodList.length; i < l; i++ ) {
            var octreeObj = foodList[i];
            var fi = foodList[i].object.fi;
            if ( this.aliveFood( fi ) ) {

                dist = octreeObj.position.distanceTo( mainSphere.position );
                if ( dist <= ( sphere_radius + config.FOOD_CAPTURE_ASSIST ) ) {
                    callback( fi );
                    var pitch = _.sample(config.SFX_FOOD_CAPTURE_TONES);
                    var pan = octreeObj.position.applyProjection( camera.matrixWorldInverse ).x / 32;

                    ZOR.Sounds.sfx.food_capture.play( {
                        pitch: pitch,
                        panning: pan,
                        volume: localStorage.volume_sfx * config.VOLUME_FOOD_CAPTURE,
                        env: {
                            hold: Math.random() * 0.3 + 0.5,
                        }
                    } );

                }
            }
        }

        //var end = performance.now();
        //console.log("duration: ", end - start);
    }
};
