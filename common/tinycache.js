'use strict';

/**
 * A simple in-memory cache for node or the browser.
 * Forked from: https://github.com/andyburke/tinycache/blob/master/index.js
 * @returns {TinyCache}
 * @constructor
 */

var TinyCache = function () {
    var self = this;
    self._cache = {};
    self._timeouts = {};
    self._hits = 0;
    self._misses = 0;
    self._size = 0;

    return self;
};

TinyCache.prototype = {
    get size() {
        return this._size;
    },
    get memsize() {
        /* Returns the approximate memory usage of all objects stored in the cache and cache overhead */
        return this.sizeof(this._cache);
    },
    get hits() {
        return this._hits;
    },
    get misses() {
        return this._misses;
    }
};

TinyCache.prototype.put = function (key, value, time) {
    var self = this;

    if (self._timeouts[key]) {
        clearTimeout(self._timeouts[key]);
        delete self._timeouts[key];
    }

    self._cache[key] = value;

    if (!isNaN(time)) {
        self._timeouts[key] = setTimeout(self.del.bind(self, key), time);
    }

    ++self._size;
};

TinyCache.prototype.del = function (key) {
    var self = this;

    clearTimeout(self._timeouts[key]);
    delete self._timeouts[key];

    if (!( key in self._cache )) {
        return false;
    }

    delete self._cache[key];
    --self._size;
    return true;
};

TinyCache.prototype.clear = function () {
    var self = this;

    for (var key in self._timeouts) {
        if (self._timeouts.hasOwnProperty(key)) {
            clearTimeout(self._timeouts[key]);
        }
    }

    self._cache = {};
    self._timeouts = {};
    self._size = 0;
};

TinyCache.prototype.get = function (key) {
    var self = this;

    if (typeof key === 'undefined') {
        return self._cache;
    }

    if (!( key in self._cache )) {
        ++self._misses;
        return null;
    }

    ++self._hits;
    return self._cache[key];
};

/* Returns the approximate memory usage */
TinyCache.prototype.sizeof = function (object) {
    var objects = [object];
    var processed = [];
    var size = 0;

    for (var index = 0; index < objects.length; ++index) {
        var _object = objects[index];
        switch (typeof _object) {
            case 'boolean':
                size += 4;
                break;
            case 'number':
                size += 8;
                break;
            case 'string':
                size += 2 * _object.length;
                break;
            case 'object':
                if (_object === null) {
                    size += 4; // assume null is the same size as a boolean
                    break;
                }

                // if it's an array, the keys add no size. if it's an object, keys
                // add size based on their length (keys must be strings according to spec)
                var keySizeFactor = Array.isArray(_object) ? 0 : 1;

                // coerces even array indices to strings, so we can use key.length safely
                for (var key in _object) {
                    if (_object.hasOwnProperty(key)) {
                        size += keySizeFactor * 2 * key.length;
                        if (processed.indexOf(_object[key]) === -1) {
                            objects.push(_object[key]);
                            if (typeof _object[key] === 'object') {
                                processed.push(_object[key]);
                            }
                        }
                    }
                }
                break;
        }
    }

    return size;
};

// TinyCache.shared = new TinyCache();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TinyCache;
}
else if (typeof define === 'function' && define.amd) {
    /* global define */
    define([], function () {
        return TinyCache;
    });
}
else {
    /* global window */
    window.TinyCache = TinyCache;
}

