// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
global config:true
global THREE:true
global player:true
*/

/**
 * The Controller part of Food MVC
 * @param {Object} model
 * @param {Object} fogCenterPosition
 * @constructor
 */
ZOR.FoodController = function ZORFoodController(model, fogCenterPosition) {
    this.model = model;
    this.view = new ZOR.FoodView();
    this.fogCenterPosition = new THREE.Vector3();

    this.fogCenterPosition.copy(fogCenterPosition);

    // create octree
    this.octree = new THREE.Octree( {
        // when undeferred = true, objects are inserted immediately
        // instead of being deferred until next octree.update() call
        // this may decrease performance as it forces a matrix update
        undeferred      : true,
        // set the max depth of tree
        depthMax        : Infinity,
        // max number of objects before nodes split or merge
        objectsThreshold: 8,
        // percent between 0 and 1 that nodes will overlap each other
        // helps insert objects that lie over more than one node
        overlapPct      : 0.15,
        // scene: scene
    } );

    this.drawFood = function ZORFoodControllerDrawFood(scene) {
        this.view.drawFood(scene, this.model.food, this.model.foodCount, this.fogCenterPosition, this.octree);
    };

    /**
     * Any updates to be run during main loop
     * @param {Object} fogCenterPosition
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
     * @param {number} fi
     * @returns {boolean}
     */
    this.aliveFood = function ZORFoodControllerAliveFood(fi) {
        return this.view.aliveFood(fi);
    };

    /**
     * Hide the food at the index.
     * @param {number} fi
     */
    this.hideFood = function ZORFoodControllerHideFood(fi) {
        this.view.hideFood(fi);
    };


    /**
     * Show the food at the index
     * @param {number} fi
     */
    this.showFood = function ZORFoodControllerShowFood(fi) {
        this.view.showFood(fi);
    };

    /**
     * Hide multiple foods
     * @param {number[]} foodToHide
     */
    this.hideFoodMultiple = function ZORFoodViewHideFoodMultipleFood(foodToHide) {
        this.view.hideFoodMultiple(foodToHide);
    };

    /**
     * Checks for food captures and executes a callback for each capture
     * @param {Object} thePlayer
     * @param {Function} callback
     */
    this.checkFoodCaptures = function ZORFoodControllerCheckFoodCaptures(thePlayer, callback) {
        // var start = performance.now();

        let i;
        let l;
        let dist = 0;
        let mainSphere = thePlayer.view.mainSphere;
        let sphere_radius = thePlayer.radius();

        let foodList = this.octree.search( mainSphere.position, sphere_radius + 25 );

        for ( i = 0, l = foodList.length; i < l; i++ ) {
            let octreeObj = foodList[i];
            let fi = foodList[i].object.fi;
            if ( this.aliveFood( fi ) ) {
                dist = octreeObj.position.distanceTo( mainSphere.position );
                if ( dist <= ( sphere_radius + config.FOOD_CAPTURE_ASSIST ) ) {
                    callback( fi );
                    ZOR.Sounds.playFromPos(ZOR.Sounds.sfx.food_capture, player.view.mainSphere,
                        octreeObj.position.clone());
                }
            }
        }

        // var end = performance.now();
        // console.log("duration: ", end - start);
    };
};
