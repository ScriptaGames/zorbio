// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true,
 THREE:true,
 UTIL:true,
 config:true
*/

ZOR.PlayerName = class ZORPlayerName {
    /**
     * This class represents the outline for a spheres size relative to the current player.
     * @constructor
     */
    constructor() {
        this.constructor.loader.load('node_modules/three/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            this.onLoad(font);
        });
    }

    /**
     * Run the given function when the text mesh is ready.
     * @param {Function} handler the function to run
     */
    onReady(handler) {
        this._onReady = handler;
        if (this.textMesh) {
            this._onReady(this);
        }
    }

    /**
     * A handler to be run when the font file is done loading.
     * @param {THREE.Font} font a font object
     */
    onLoad(font) {
        this.font = font;
        const color = 0x006699;
        const mat = new THREE.LineBasicMaterial({
            color,
            side: THREE.DoubleSide,
            fog : false,
        });
        const shapes = this.font.generateShapes('player_name', config.PLAYER_NAME_SIZE);
        const geometry = new THREE.ShapeGeometry(shapes);
        const textMesh = new THREE.Mesh(geometry, mat);
        this.textMesh = textMesh;
        this._onReady(this);
    }

    /**
     * Set the player name's color.
     * @param {String|Number} color a color that can be passed to THREE.Color.
     */
    setColor(color) {
        this.textMesh.material.color = new THREE.Color(color);
    }

    /**
     * Set the player's name.
     * @param {String} name the player's name
     */
    setName(name) {
        const shapes = this.font.generateShapes(name, config.PLAYER_NAME_SIZE/name.length);
        const geometry = new THREE.ShapeGeometry(shapes);
        geometry.computeBoundingBox();
        const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(xMid, 0, 0);
        this.textMesh.geometry = geometry;
    }

    /**
     * Update tick function for DangerView.
     */
    update() {
        // updates are being done in PlayerView by the player who controls this PlayerName.
    }

    /**
     * Hide this player's danger view.
     */
    hide() {
        if (this.textMesh && this.textMesh.material.visible) {
            this.textMesh.material.visible = false;
        }
    }

    /**
     * Show this player's danger view.
     */
    show() {
        if (this.textMesh && !this.textMesh.material.visible) {
            this.textMesh.material.visible = true;
        }
    }

    /**
     * @return {Boolean} whether this player's danger view is visible
     */
    isVisible() {
        return this.textMesh ? this.textMesh.material.visible : false;
    }

    /**
     * Clean up memory for player's danger view.
     * @param {Object} scene the three.js scene
     */
    dispose(scene) {
        if (this.textMesh) {
            UTIL.threeFree(scene, this.textMesh);
        }
        else {
            this.onReady(() => {
                UTIL.threeFree(scene, this.textMesh);
            });
        }
    }
};

ZOR.PlayerName.loader = new THREE.FontLoader();
