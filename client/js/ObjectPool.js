var ZOR = ZOR || {};

/**
 * ZOR.Pool contains various types of pre-allocated objects to be used.
 * Warning: for performance reasons, pooled objects will have a '_pool_index'
 * property added to them, to make returning them to the pool more efficient.
 *
 * @constructor
 * @param {number} quantity how many objects to initialize
 * @param {function} create a function which creates and returns an object to place in the pool
 * @param {array} args an array of arguments to pass to the create function
 */

ZOR.ObjectPool = function ZORObjectPool(quantity, create, args) {
    this.pool = [];
    this.available = new Uint8Array(quantity).fill(1);
    for(var i = 0; i < quantity; ++i) {
        this.pool.push(create.apply([], args));
        this.pool[i]._pool_index = i;
    }
};

/**
 * Borrow an object from the pool.
 * @returns {object} an object from the pool, or undefined if none are available
 */
ZOR.ObjectPool.prototype.borrow = function ZORObjectPoolBorrow() {
    this.updateNextAvailable();
    this.available[this.i] = 0;
    return this.pool[this.i];
};

/**
 * Return an object to the pool.
 * @param {object} obj the object to return to the pool
 */
ZOR.ObjectPool.prototype.return = function ZORObjectPoolReturn(obj) {
    this.available[obj._pool_index] = 1;
    this.updateNextAvailable();
};

/**
 * Returns the index of the next available object.
 * @return {number} the index of the next available object.
 */
ZOR.ObjectPool.prototype.nextAvailable = function ZORObjectPoolNextAvailable() {
    return this.available.indexOf(1);
};

/**
 * Updates the internal reference to the next available index.
 */
ZOR.ObjectPool.prototype.updateNextAvailable = function ZORObjectPoolUpdateNextAvailable() {
    this.i = this.nextAvailable();
};
