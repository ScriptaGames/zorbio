const NODEJS_DRAIN = typeof module !== 'undefined' && module.exports;

let THREE;
let _;
let UTIL;
let config;


// if we're running in nodejs, import THREE.  for browser, assume it's
// already there.
if (NODEJS_DRAIN) {
    THREE  = require('three');
    _      = require('lodash');
    UTIL   = require('./util.js');
    config = require('./config.js');
    ZOR    = require('../common/zorbio.js');
}

ZOR.Drain = {};

/**
 * Find *all* pairs of players within drain distance of each other.
 *
 * @param {Object} players the object containing all players
 * @return {Object} an array of all player pairs within drain distance
 */
ZOR.Drain.findAll = function ZORDrainFindAll( players ) {
    let players_array = players;
    let drain = {};
    let p1;
    let p2;
    let p1_scale;
    let p2_scale;
    let distance;

    let l = players_array.length;
    let j = 0;

    // init empty arrays for each player, they will hold the id's of players
    // they are draining
    let i = l;
    while ( i-- ) drain[ players_array[i].id ] = [];

    i = l;
    while ( i-- ) {
        j = i + 1;

        // let's see if this player is draining anyone!
        p1 = players_array[i];

        while ( j-- ) {

            if (i === j) continue; // don't compare player to itself

            // find the distance between these two players
            p2 = players_array[j];

            if (p1.type === ZOR.PlayerTypes.BOT && p2.type === ZOR.PlayerTypes.BOT) continue;

            p1_scale = p1.sphere.scale;
            p2_scale = p2.sphere.scale;

            distance = p1.sphere.position.distanceTo( p2.sphere.position ) - p1_scale - p2_scale;

            // if a player is close enough and small enough, save the p2's id
            if ( distance <= config.DRAIN_MAX_DISTANCE ) {

                if ( p1_scale < p2_scale ) {
                    // if new drain is better than old drain, it wins
                    if (!drain[ p1.id ][0] || distance < drain[ p1.id ][0].dist) {
                        drain[ p1.id ][0] = { id: p2.id, dist: distance }; // p1 drains p2
                    }
                }
                else if ( p2_scale < p1_scale ) {
                    // if new drain is better than old drain, it wins
                    if (!drain[ p2.id ][0] || distance < drain[ p2.id ][0].dist) {
                        drain[ p2.id ][0] = { id: p1.id, dist: distance }; // p2 drains p1
                    }
                }
            }
        }
    }

    return drain;
};

/**
 * Calculate the amount of drain based on distance and relative size.
 *
 * @param {Number} distance the distance between two players' surfaces
 * @return {Number} the scale drained from one player and added to the other
 */
ZOR.Drain.amount = function ZORDrainAmount( distance ) {
    // adjust n, o. and p to balance the drain amount.
    // see https://www.desmos.com/calculator/wmiuaymrtu
    let n = 0.007;
    let o = 4.0;
    let p = 0.06;
    return p / ( (n * (distance * distance)) + o );
};

/**
 * Calculate how much drain should be scaled because of the two players'
 * relative sizes.
 *
 * @param {Number} drainer_size the drainer's size
 * @param {Number} drainee_size the drainee's size
 * @return {Number} a scale factor to apply to drain amount
 */
ZOR.Drain.bonusAmount = function ZORDrainBonusAmount( drainer_size, drainee_size ) {
    // https://www.desmos.com/calculator/fzrj7f2b6l
    return config.DRAIN_SIZE_INFLUENCE * (drainee_size - drainer_size) / (config.MAX_PLAYER_RADIUS - config.INITIAL_PLAYER_RADIUS) + 1;
};

// if we're in nodejs, export the root ZOR object
if (NODEJS_DRAIN) module.exports = ZOR.Drain;
