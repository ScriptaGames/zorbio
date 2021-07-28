// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true,
 ZOR:true,
 THREE:true
*/

ZOR.Pools = {};

// Sphere mesh pools

(function() {
    /**
     * Create a basic threejs sphere
     * @param {number} polyCountX
     * @param {number} polyCountY
     * @returns {Object}
     */
    function createSphere(polyCountX, polyCountY) {
        let polyX = polyCountX || config.PLAYER_SPHERE_POLYCOUNT;
        let polyY = polyCountY || config.PLAYER_SPHERE_POLYCOUNT;
        let mat = new THREE.MeshBasicMaterial();
        let geo = new THREE.SphereGeometry(1, polyX, polyY);
        return new THREE.Mesh(geo, mat);
    }

    ZOR.Pools.spheres = new ZOR.ObjectPool(createSphere);
    ZOR.Pools.lowPolySpheres = new ZOR.ObjectPool(createSphere, 20, 10);
}());

// Drain view pool

ZOR.Pools.drainViews = new ZOR.ObjectPool(function createDrainBeam() {
    return new ZOR.DrainView();
});

// Danger view pool

ZOR.Pools.dangerViews = new ZOR.ObjectPool(function createDangerView() {
    return new ZOR.DangerView();
});

ZOR.Pools.playerNames = new ZOR.ObjectPool(function createPlayerName() {
    return new ZOR.PlayerName();
});
