var ZOR = ZOR || {};

ZOR.Pools = {};

// Sphere mesh pools

(function () {

    function createSphere(polycountx, polycounty) {
        var polyx = polycountx || config.PLAYER_SPHERE_POLYCOUNT;
        var polyy = polycounty || config.PLAYER_SPHERE_POLYCOUNT;
        var mat = new THREE.MeshBasicMaterial();
        var geo = new THREE.SphereGeometry(1, polyx, polyy);
        return new THREE.Mesh(geo, mat);
    }

    ZOR.Pools.spheres = new ZOR.ObjectPool(createSphere);
    ZOR.Pools.lowPolySpheres = new ZOR.ObjectPool(createSphere, [20, 10]);

}());

// Drain view pool

ZOR.Pools.drainViews = new ZOR.ObjectPool(function createDrainBeam() {
    return new ZOR.DrainView();
});
