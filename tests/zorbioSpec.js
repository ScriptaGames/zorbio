describe('ZOR.Model', function () {
    it('should be constructable', function () {
        var model = new ZOR.Model( 0, 0 );
        expect(model instanceof ZOR.Model).toBe(true);
    });

    it('should have no actors at first', function () {
        var model = new ZOR.Model( 0, 0 );
        expect(Object.getOwnPropertyNames(model.actors).length).toEqual(0);
    });

    it('should have no players at first', function () {
        var model = new ZOR.Model( 0, 0 );
        expect(Object.getOwnPropertyNames(model.players).length).toEqual(0);
    });

    it('should accept worldsize and food density', function () {
        var size = 200;
        var food = 10;
        var model = new ZOR.Model( size, food );
        expect(model.worldSize.x).toEqual(size);
        expect(model.worldSize.y).toEqual(size);
        expect(model.worldSize.z).toEqual(size);
        expect(model.foodDensity).toEqual(food);
    });
});
