describe('ZOR.Model', function () {

    var mode;

    it('should be constructable', function () {
        model = new ZOR.Model();
        expect(model instanceof ZOR.Model).toBe(true);
    });

    it('should have no actors at first', function () {
        expect(model.actors.length).toEqual(0);
    });

    it('should have a positive world size', function () {
        expect(model.worldsize.x).toBeGreaterThan(0);
        expect(model.worldsize.y).toBeGreaterThan(0);
        expect(model.worldsize.z).toBeGreaterThan(0);
    });

});
