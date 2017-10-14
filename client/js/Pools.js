// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global ZOR:true
global THREE:true
*/

ZOR.Pools = {};

// Sphere mesh pools

(function () {

    function createSphere(polycountx, polycounty) {
        let polyx = polycountx || config.PLAYER_SPHERE_POLYCOUNT;
        let polyy = polycounty || config.PLAYER_SPHERE_POLYCOUNT;
        let mat = new THREE.MeshBasicMaterial();
        let geo = new THREE.SphereGeometry(1, polyx, polyy);
        return new THREE.Mesh(geo, mat);
    }

    ZOR.Pools.spheres = new ZOR.ObjectPool(createSphere);
    ZOR.Pools.lowPolySpheres = new ZOR.ObjectPool(createSphere, [20, 10]);

}());

// Drain view pool

ZOR.Pools.drainViews = new ZOR.ObjectPool(function createDrainBeam() {
    return new ZOR.DrainView();
});

// Danger view pool

ZOR.Pools.dangerViews = new ZOR.ObjectPool(function createDangerView() {
    return new ZOR.DangerView();
});
