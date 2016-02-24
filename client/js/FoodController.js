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
    this.vdist = new THREE.Vector3();

    this.fogCenterPosition.copy(fogCenterPosition);

    this.drawFood = function ZORFoodControllerDrawFood(scene) {
        this.view.drawFood(scene, this.model.food, this.model.foodCount, this.fogCenterPosition);
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

        var x, y, z, i, l;
        var dist = 0;
        var mainSphere = thePlayer.view.mainSphere;
        var sphere_radius = thePlayer.radius();

        for ( i = 0, l = this.view.translate.length; i < l; i += 3 ) {
            if (this.aliveFood( i / 3 )) {
                x = this.view.translate[ i     ];
                y = this.view.translate[ i + 1 ];
                z = this.view.translate[ i + 2 ];
                this.vdist.set(x, y, z);

                dist = this.vdist.distanceTo(mainSphere.position);
                if (dist <= (sphere_radius + config.FOOD_CAPTURE_ASSIST)) {
                    var fi = i / 3;
                    var timestamp = Date.now();
                    callback( fi, timestamp );
                    _.sample(ZOR.Sounds.food_capture).play();
                }
            }
        }
    }
};
