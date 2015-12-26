describe('UTIL.safeRandomCoordinate', function () {

    it('should never be less than lower world bound', function () {
        expect( UTIL.safeRandomCoordinate(0) ).toBeGreaterThan( -1 * config.WORLD_SIZE / 2 );
    });

    it('should never be greater than upper world bound', function () {
        expect( UTIL.safeRandomCoordinate(1) ).toBeLessThan( config.WORLD_SIZE / 2 );
    });

});
