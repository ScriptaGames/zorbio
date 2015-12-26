describe('UTIL.safeRandomCoordinate', function () {

    it('should never exceed the world bounds', function () {
        var world_min = -1 * config.WORLD_SIZE / 2;
        var world_max = config.WORLD_SIZE / 2;

        // test the min and max of the random coordinate equation (this is
        // deterministic mode)

        var min = UTIL.safeRandomCoordinate(0);
        var max = UTIL.safeRandomCoordinate(1);
        expect( min ).toBeGreaterThan( world_min );
        expect( min ).toBeLessThan( world_max );
        expect( max ).toBeGreaterThan( world_min );
        expect( max ).toBeLessThan( world_max );

        // test the random coordinate equations a bunch of time in stochastic
        // (random) mode

        var coord;
        for( var i = 0, iters = 1000; i < iters; ++i ) {
            coord = UTIL.safeRandomCoordinate();
            expect( coord ).toBeLessThan( world_max );
            expect( coord ).toBeGreaterThan( world_min );
        }

    });

});
