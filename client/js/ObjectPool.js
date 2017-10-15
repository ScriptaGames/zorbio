// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
*/

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

ZOR.ObjectPool = function ZORObjectPool(create, args) {
    this._create    = create;
    this._args      = args;
    this._pool      = [];
    this._available = [];
    this._i         = -1;
    // this._available = new Uint8Array(quantity).fill(1);
    // for(var i = 0; i < quantity; ++i) {
    //     this._pool.push(create.apply([], args));
    //     this._pool[i]._pool_index = i;
    // }
};

/**
 * Borrow an object from the pool.
 * @returns {object} an object from the pool, or undefined if none are available
 */
ZOR.ObjectPool.prototype.borrow = function ZORObjectPoolBorrow() {
    this._updateNextAvailable();
    if (this._dry()) {
        // console.log('full, adding');
        this._add();
    }
    this._available[this._i] = 0;
    return this._pool[this._i];
};

/**
 * Return an object to the pool.
 * @param {object} obj the object to return to the pool
 */
ZOR.ObjectPool.prototype.return = function ZORObjectPoolReturn(obj) {
    // console.log('returning object: ' + obj);
    this._available[obj._pool_index] = 1;
    this._updateNextAvailable(obj._pool_index);
};

/**
 * Add a new object to the end of the pool.
 */
ZOR.ObjectPool.prototype._add = function ZORObjectPoolAdd() {
    let i = this._pool.length;
    this._pool.push(this._create.apply({}, this._args));
    this._pool[i]._pool_index = i;
    this._available.push(1);
    this._updateNextAvailable(i);
};

/**
 * Find out if the object pool is dry (all instantiated objects are claimed).
 *
 * @return {boolean} true if all objects are claimed, false otherwise
 */
ZOR.ObjectPool.prototype._dry = function ZORObjectPoolDry() {
    return this._i === -1;
};

/**
 * Returns the index of the next available object.
 * @return {number} the index of the next available object.
 */
ZOR.ObjectPool.prototype._nextAvailable = function ZORObjectPoolNextAvailable() {
    return this._available.indexOf(1);
};

/**
 * Updates the internal reference to the next available index.
 * @param {number} [i] optionally provide a known index of an available object.
 * If not provided, one will be searched for.
 */
ZOR.ObjectPool.prototype._updateNextAvailable = function ZORObjectPoolUpdateNextAvailable(i) {
    this._i = i || this._nextAvailable();
    // console.log('next available is ' + this._i);
};


// test

// pool = new ZOR.ObjectPool(create, [1]);
// function create(x) {
//     return { n: x };
// }

// var a = pool.borrow();
// console.log(a);
// var b = pool.borrow();
// pool.return(b);
// var c = pool.borrow();
// var d = pool.borrow();
// var e = pool.borrow();
// pool.return(e);
// pool.return(d);
// var f = pool.borrow();
