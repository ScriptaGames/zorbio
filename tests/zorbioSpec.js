describe('ZOR.Model', function () {

    var mode;

    it('should be constructable', function () {
        model = new ZOR.Model();
        expect(model instanceof ZOR.Model).toBe(true);
    });

    it('should have no actors at first', function () {
        expect(model.actors.length).toEqual(0);
    });

    it('should accept worldsize and food density', function () {
        var size = 200;
        var food = 200;
        model = new ZOR.Model(size, food);
        expect(model.worldSize.x).toEqual(size);
        expect(model.worldSize.y).toEqual(size);
        expect(model.worldSize.z).toEqual(size);
        expect(model.foodDensity).toEqual(food);
    });

});
