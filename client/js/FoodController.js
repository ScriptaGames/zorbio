var FoodController = function ZORFoodController(model) {

    this.model = model;
    this.food = {};
    this.view = new FoodView();

    this.drawFood = function ZORFoodControllerDrawFood(scene) {
        this.view.drawFood(scene, model.food, model.foodCount);
    };

};
