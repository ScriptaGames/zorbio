// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global THREE:true
global _:true
global xssFilters:true
*/

const NODEJS_UTIL = typeof module !== 'undefined' && module.exports;

if (NODEJS_UTIL) {
    global.config = require('./config.js');
    global._ = require('lodash');
    global.xssFilters = require('xss-filters');
}

let UTIL = {};

/**
 * Clamps a number to a given range.
 *
 * @param {Number} n the number to clamp
 * @param {Number} min the range's lower bound
 * @param {Number} max the range's upper bound
 * @returns {number}
 */
UTIL.clamp = function UTILClamp(n, min, max) {
    if (min > max) throw new Error('invalid clamp, min is greater than max');
    return Math.min(Math.max(n, min), max);
};

/**
 * Returns a random integer between min (included) and max (included) Using
 * Math.round() will give you a non-uniform distribution!
 *
 * @param {Number} min the minimum bound (inclusive)
 * @param {Number} max the maximum bound (inclusive)
 * @returns {Number} a random integer between min (included) and max (included)
 */
UTIL.getRandomIntInclusive = function UTILGetRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 *
 * @param {Number} min the minimum bound (inclusive)
 * @param {Number} max the maximum bound (exclusive)
 * @returns {Number} a random integer between min (included) and max (included)
 */
UTIL.getRandomArbitrary = function UTILGetRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
};

/**
 * Checks for a valid nick
 *
 * @param {String} nickname
 * @returns {Boolean}
 */
UTIL.validNick = function UTILValidNick(nickname) {
    let regex = /^\w*$/;
    return regex.exec(nickname) !== null;
};


/**
 * Given a sphere size, return the fraction of maximum size.  For example, if
 * maximum sphere size is 150, getSizePercentage(75) will return 0.5.
 *
 * @param {Number} size a sphere's size
 * @returns {number}
 */
UTIL.getSizePercentage = function UTILGetSizePercentage(size) {
    // similar to  https://www.desmos.com/calculator/dphm84crab
    let factor = ((size * 1) / config.MAX_PLAYER_RADIUS);
    return factor;
};

UTIL.toVector3 = function UTILToVec3(obj, prop) {
    obj[prop] = new THREE.Vector3().copy(obj[prop]);
};

/**
 * Detect hitting the wall in the positive direction
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @param {'x'|'y'|'z'} axis the axis on which to test for collision
 * @returns {Boolean}
 */
function hitp( p, r, v, w, axis ) {
    return p[axis] + r - v[axis] > w[axis]/2;
}

/**
 * Detect hitting the wall in the negative direction
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @param {'x'|'y'|'z'} axis the axis on which to test for collision
 * @returns {Boolean}
 */
function hitn( p, r, v, w, axis ) {
    return p[axis] - r - v[axis] < -w[axis]/2;
}

/**
 * Detect hit on the x axis in positive direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Boolean}
 */
function hitxp( p, r, v, w ) {
    return hitp( p, r, v, w, 'x' );
}


/**
 * Detect hit on the x axis in the negative direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Boolean}
 */
function hitxn( p, r, v, w ) {
    return hitn( p, r, v, w, 'x' );
}

/**
 * Detect hit on the y axis in the positive direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Boolean}
 */
function hityp( p, r, v, w ) {
    return hitp( p, r, v, w, 'y' );
}

/**
 * Detect hit on the y axis in the negative direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Boolean}
 */
function hityn( p, r, v, w ) {
    return hitn( p, r, v, w, 'y' );
}

/**
 * Detect hit on the z axis in the positive direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Boolean}
 */
function hitzp( p, r, v, w ) {
    return hitp( p, r, v, w, 'z' );
}

/**
 * Detect hit on the z axis in the netative direction.
 *
 * @private
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Boolean}
 */
function hitzn( p, r, v, w ) {
    return hitn( p, r, v, w, 'z' );
}


/**
 * Returns true if a sphere would intersect a wall after applying velocity (v).
 *
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Boolean} whether the wall would be hit after applying given velocity
 */
UTIL.checkWallCollision = function UTILcheckWallCollision( p, r, v, w ) {
    return hitxp( p, r, v, w ) ||
        hitxn( p, r, v, w ) ||
        hityp( p, r, v, w ) ||
        hityn( p, r, v, w ) ||
        hitzp( p, r, v, w ) ||
        hitzn( p, r, v, w );
};

/**
 * Adjust a sphere's velocity to prevent it from hitting a wall.  If no wall
 * would be hit, velocity is not changed.
 *
 * @param {Vector3} p the position of the sphere being tested
 * @param {Number} r the radius of the sphere being tested
 * @param {Vector3} v the velocity of the sphere being tested
 * @param {Vector3} w the world dimensions
 * @returns {Vector3} the updated (or not) velocity
 */
UTIL.adjustVelocityWallHit = function UTILadjustVelocityWallHit( p, r, v, w ) {
    let vs = v.clone();

    // TODO: instead of reducing velocities to 0, reduce them just enough to
    // avoid collision.  reducing to 0 causes small, fast spheres to sometimes
    // "hit" the wall before they are visibly touching it.

    if ( hitxp( p, r, v, w ) || hitxn( p, r, v, w ) ) {
        vs.x = 0;
    }

    if ( hityp( p, r, v, w ) || hityn( p, r, v, w ) ) {
        vs.y = 0;
    }

    if ( hitzp( p, r, v, w ) || hitzn( p, r, v, w ) ) {
        vs.z = 0;
    }

    return vs;
};

/**
 * For the 'FOLLOW' steering mode, given a distance from the center of the
 * screen, calculate how quickly the camera should turn.
 *
 * @param {Number} r percentage distance from center of the screen, for example
 * 0.5 would mean halfway between screen center and screen edge.
 * @returns {number}
 */
UTIL.slopewell = function slopewell( r ) {
    return Math.max(0, ( -config.STEERING.WELL + r ) / config.STEERING.SLOPE);
};

/**
 * Get a random world coordinate which a sphere could be placed in.  Because
 * the world is a cube, the coordinate can be used on any axis.
 * @param {number} d
 * @returns {number}
 */
UTIL.safeRandomCoordinate = function UTILsafeRandomCoordinate(d) {
    let devide = d || 1;
    let v = Math.random();
    let safe_size = (config.WORLD_SIZE / devide) - (2 * config.INITIAL_PLAYER_RADIUS);
    return v * safe_size - safe_size / 2;
};

/**
 * Returns a good spawning point for a player.  The point is likely to be far
 * from other players.
 *
 * @param {number} d divide the world by this number to make a small box for the coordinate
 * @returns {Vector3} the position recommended for a player
 */
UTIL.randomWorldPosition = function UTILrandomWorldPosition(d) {
    let divide = d || 1;
    let x = UTIL.safeRandomCoordinate( divide );
    let y = UTIL.safeRandomCoordinate( divide );
    let z = UTIL.safeRandomCoordinate( divide );
    return new THREE.Vector3( x, y, z );
};

UTIL.randomHorizontalPosition = function UTILrandomWorldPosition() {
    let x = UTIL.safeRandomCoordinate();
    let y = 1;
    let z = UTIL.safeRandomCoordinate();
    return new THREE.Vector3( x, y, z );
};


UTIL.trimPosition = function UTILTrimPosition(position, trim) {
    return {
        x: +position.x.toFixed(trim),
        y: +position.y.toFixed(trim),
        z: +position.z.toFixed(trim),
    };
};

/**
 * Given a number n, increase n until it's a multiple of four.  For example,
 * `fourPad(9)` would return 12 and `fourPad(20)` would return 20.
 *
 * @param {Number} n a number
 * @returns {Number} the nearest multiple of four that is greater than n
 */
UTIL.fourPad = function UTILFourPad(n) {
    return n + ( 4 - n % 4 );
};

UTIL.trimFloat = function UTILTrimFloat(num, trim) {
    return +num.toFixed(trim);
};

/**
 * Utility function used to push data into the
 * array while maintaining the sort order.
 * @param {Object[]} array
 * @param {Object} value
 * @param {Object} iteratee
 */
UTIL.sortedObjectPush = function UTILSortedObjectPush( array, value, iteratee ) {
    array.splice( _.sortedIndexBy(array, value, iteratee), 0, value );
};

/**
 * Given a food coloring name, returns a function for generating that food
 * coloring style.
 *
 * @param {String} type the
 * @example UTIL.foodColoring('random');
 * @example UTIL.foodColoring('rgbcube');
 * @returns {*}
 */
UTIL.getFoodCrayon = function UTILfoodColoring( type ) {
    return foodCrayons[type];
};

let foodCrayons = {

    'random': function foodColoringRandom() {
        return {
            r: UTIL.getRandomIntInclusive(0, 255) / 255,
            g: UTIL.getRandomIntInclusive(0, 255) / 255,
            b: UTIL.getRandomIntInclusive(0, 255) / 255,
        };
    },

    'hsl01': function foodColoringHSL01( x, y, z ) {
        let h = ( x + y + z ) / (2*config.WORLD_SIZE);
        let s = 1.0;
        let l = 0.6;
        let color = new THREE.Color().setHSL(h, s, l);
        return {
            r: color.r,
            g: color.g,
            b: color.b,
        };
    },

    'rgbcube': function foodColoringRgbCube( x, y, z ) {
        return {
            r: 0.5 + x / config.WORLD_SIZE,
            g: 0.5 + y / config.WORLD_SIZE,
            b: 0.5 + z / config.WORLD_SIZE,
        };
    },

    'rgbcube-randomized': function foodColoringRgbCube( x, y, z ) {
        return {
            r: 0.5 + x / config.WORLD_SIZE + UTIL.getRandomIntInclusive(-128, 128) / 512,
            g: 0.5 + y / config.WORLD_SIZE + UTIL.getRandomIntInclusive(-128, 128) / 512,
            b: 0.5 + z / config.WORLD_SIZE + UTIL.getRandomIntInclusive(-128, 128) / 512,
        };
    },

    'octant': function foodColoringOctant( x, y, z ) {
        let r;
        let g;
        let b;

        // based on: https://en.wikipedia.org/wiki/Octant_(solid_geometry)
        if (x >= 0 && y >= 0 && z >= 0) {
            r = 1;
            g = 0;
            b = 0;
        }
        else if (x < 0 && y >= 0 && z >= 0) {
            r = 0;
            g = 1;
            b = 0;
        }
        else if (x < 0 && y < 0 && z >= 0) {
            r = 0;
            g = 0;
            b = 1;
        }
        else if (x >= 0 && y < 0 && z >= 0) {
            r = 1;
            g = 1;
            b = 0;
        }
        else if (x >= 0 && y >= 0 && z < 0) {
            r = 0;
            g = 1;
            b = 1;
        }
        else if (x < 0 && y >= 0 && z < 0) {
            r = 1;
            g = 1;
            b = 1;
        }
        else if (x < 0 && y < 0 && z < 0) {
            r = 1;
            g = 0;
            b = 1;
        }
        else if (x >= 0 && y < 0 && z < 0) {
            r = 0.5;
            g = 0;
            b = 0.1;
        }

        return {
            r: r,
            g: g,
            b: b,
        };
    },

    'sine-cycle': function foodColoringRgbCube( x, y, z ) {
        return {
            r: Math.sin( x / ( config.WORLD_SIZE / config.FOOD_COLORING_SINE_SEGMENTS ) ) / 2 + 1/2,
            g: Math.sin( y / ( config.WORLD_SIZE / config.FOOD_COLORING_SINE_SEGMENTS ) ) / 2 + 1/2,
            b: Math.sin( z / ( config.WORLD_SIZE / config.FOOD_COLORING_SINE_SEGMENTS ) ) / 2 + 1/2,
        };
    },

};

/**
 * Get a food map function of a given type.  A food mapper function accepts a
 * food position array (typed array, [X,Y,Z,X,Y,Z,...]), populate it with food
 * positions.
 *
 * Food map functions mutate the food position array.
 *
 * @param {String} type the type of food map function
 */

UTIL.getFoodMap = function getFoodMap( type ) {
    return foodMaps[type];
};

let foodMaps = {
    random: function foodMapRandom(count, density) {
        let halfSize  = config.WORLD_SIZE / 2;
        let blockSize = config.WORLD_SIZE / density;
        let ints      = 3; // 6 for XYZ
        let offset    = 0;
        let positions = new Int16Array(count * 3);

        for (let i = 1; i < density; ++i) {
            for (let j = 1; j < density; ++j) {
                for (let k = 1; k < density; ++k) {
                    // set food position
                    let x = halfSize - ( i * blockSize ) + UTIL.getRandomIntInclusive( -blockSize, blockSize );
                    let y = halfSize - ( j * blockSize ) + UTIL.getRandomIntInclusive( -blockSize, blockSize );
                    let z = halfSize - ( k * blockSize ) + UTIL.getRandomIntInclusive( -blockSize, blockSize );
                    positions[offset]     = x;
                    positions[offset + 1] = y;
                    positions[offset + 2] = z;

                    offset += ints;
                }
            }
        }

        return positions;
    },
    grid: function foodMapGrid(count, density) {
        let halfSize  = config.WORLD_SIZE / 2;
        let blockSize = config.WORLD_SIZE / density;
        let ints      = 3; // 6 for XYZ
        let offset    = 0;
        let positions = new Int16Array(count * 3);

        for (let i = 1; i < density; ++i) {
            for (let j = 1; j < density; ++j) {
                for (let k = 1; k < density; ++k) {
                    // set food position
                    let x = halfSize - ( i * blockSize );
                    let y = halfSize - ( j * blockSize );
                    let z = halfSize - ( k * blockSize );
                    positions[offset]     = x;
                    positions[offset + 1] = y;
                    positions[offset + 2] = z;

                    offset += ints;
                }
            }
        }

        return positions;
    },
};

/**
 * Wrap your function such that it will be executed every N times it's called.
 * This is useful in a long-running loop such as the main loop in a game, where
 * you want to execute certain functions every 10 frames, or similar, but don't
 * want to manage a dozen separate "timers".
 *
 * @param {Function} f the function to wrap
 * @param {Number} n execute the function every `n` times
 * @returns {Function}
 */
UTIL.nth = function nth(f, n) {
    let _i = 0;
    let _n = Math.max(n, 0);
    return function(...args) {
        if (_i === _n) {
            _i = 0;
            return f.apply(this, args);
        }
        else {
            _i++;
        }
    };
};

/**
 * Test if a string is undefinted null or blank
 * @param {string} str
 * @returns {Boolean}
 */
UTIL.isBlank = function isBlank(str) {
    return (!str || /^\s*$/.test(str));
};

/**
 * pushes an element onto the front of an array and shifts the oldest element out based on max_length
 * @param {Object[]} arr
 * @param {*} value
 * @param {number} max_length
 */
UTIL.pushShift = function UTILPushShift(arr, value, max_length) {
    arr.push(value);
    if (arr.length > max_length) {
        arr.shift();  // remove oldest element
    }
};

/**
 * Converts a node.js buffer to an ArrayBuffer
 * @param {Object} buffer
 * @returns {ArrayBuffer}
 */
UTIL.toArrayBuffer = function UTILtoArrayBuffer(buffer) {
    let ab = new ArrayBuffer(buffer.length);
    let view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
};

/**
 * Returns the index of the element matching given id.  used for looking up things like players in an array.
 * @param {Object[]} theArray
 * @param {number} id
 * @return {number}
 */
UTIL.findIndexById = function UTILFindINdexById(theArray, id) {
    return _.findIndex(theArray, function(o) {
        return o.id == id;
    });
};

/**
 * Returns the first byte of an array buffer
 * @param {Object} arrayBuffer
 * @returns {number}
 */
UTIL.readFirstByte = function UTILReadFirstByte(arrayBuffer) {
    let view = new Uint8Array(arrayBuffer);
    return view[0];
};

/**
 * Returns the first float of an array buffer
 * @param {Object} arrayBuffer
 * @returns {float}
 */
UTIL.readFirstFloat = function UTILReadFirstByte(arrayBuffer) {
    let view = new Float32Array(arrayBuffer);
    return view[0];
};

UTIL.logTime = function UTILLogTime(msg, start, end) {
    console.log(msg, (end - start).toFixed(3));
};

UTIL.filterName = function UTILFilterName(name) {
    let filtered_name = xssFilters.inHTMLData(name);

    // now also remove quotes because they break the backend
    filtered_name = filtered_name.replace(/["']/g, '');

    if (UTIL.isBlank(filtered_name)) {
        filtered_name = 'Guest';
    }
    else if (name.length > config.MAX_PLAYER_NAME_LENGTH) {
        filtered_name = filtered_name.substr(0, config.MAX_PLAYER_NAME_LENGTH);
    }

    return filtered_name;
};

/**
 * Lerp two values
 * @param {number} v0
 * @param {number} v1
 * @param {number} t
 * @returns {number}
 */
UTIL.lerp = function UTILLerp(v0, v1, t) {
    return (1-t)*v0 + t*v1;
};

/**
 * Remove a three.js mesh from the scene and free all its memory.
 * @param {THREE.Scene} scene the scene to remove the mesh from
 * @param {THREE.Mesh} mesh the mesh to free
 */
UTIL.threeFree = function UTILThreeFree(scene, mesh) {
    scene.remove(mesh);
    if (mesh.geometry) {
        mesh.geometry.dispose();
    }

    // make sure textures are freed from GPU memory
    if (mesh.material.uniforms.sphereTexture) {
        mesh.material.uniforms.sphereTexture.value.dispose();
    }
    if (mesh.material.uniforms.texture) {
        mesh.material.uniforms.texture.value.dispose();
    }

    if (mesh.material) {
        mesh.material.dispose();
    }
};

/**
 * Returns the curve path of random world points
 * @param {number} numPoints
 * @param {number} divide
 * @param {number} segments
 * @returns {array}
 */
UTIL.randomWanderPath = function UTILRandomWanderPath(numPoints, divide, segments) {
    let randomPositions = [];
    divide              = divide || 1;
    segments            = segments || 100;

    for (let i = 0; i < numPoints; i++) {
        randomPositions.push( UTIL.randomWorldPosition( divide ) );
    }

    // Random world points closed loop a large path
    let curve       = new THREE.CatmullRomCurve3( randomPositions );
    curve.curveType = 'chordal';
    curve.closed    = true;

    return curve.getPoints( segments );
};

// if we're in nodejs, export the root UTIL object
if (NODEJS_UTIL) module.exports = UTIL;
