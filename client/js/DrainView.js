var ZOR = ZOR || {};

/**
 * This class represents the view aspects of a player sphere.  Like how the sphere is rendered, how it looks
 * visually, and how to move it's different 3D pieces around.
 * @param actor
 * @constructor
 * @param scene
 */

ZOR.DrainView = function ZORDrainView(scene) {

    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

    var geometry = new THREE.Geometry();

    this.lines = new THREE.Line( geometry, material );
    this.geos = this.lines.geometry.vertices;

    scene.add( this.lines );
};

ZOR.DrainView.prototype.update = function ZORDrainViewUpdate(scene, players) {
    this.geos.splice(); // empty out the array and re-add updated positions

    var drainers = ZOR.Drain.findAll( players );
    var i = drainers.length;
    var drainage;
    var p1;
    var p2;

    while ( --i ) {
        drainage = drainers[i];
        p1 = drainage.p1;
        p2 = drainage.p2;
        this.geos.push(
                p1.getPosition(),
                p2.getPosition()
                );
    }
};

ZOR.DrainView.prototype.remove = function ZORDrainViewRemove(scene) {
    scene.remove(this.lines);
};

