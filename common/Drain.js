var NODEJS = typeof module !== 'undefined' && module.exports;

// if we're running in nodejs, import THREE.  for browser, assume it's
// already there.
if (NODEJS) var THREE = require('three');
if (NODEJS) var _ = require('lodash');
if (NODEJS) var UTIL = require('./util.js');
if (NODEJS) var config = require('./config.js');

var ZOR = ZOR || {};
ZOR.Drain = {};

/**
 * Find *all* pairs of players within drain distance of each other.
 *
 * @param {Object} players the object containing all players
 * @return {Object} an array of all player pairs within drain distance
 */
ZOR.Drain.findAll = function ZORDrainFindAll( players ) {
    var players_array = players;
    var drain = {};
    var p1;
    var p2;
    var p1_scale;
    var p2_scale;
    var distance;

    var l = players_array.length;
    var j = 0;

    // init empty arrays for each player, they will hold the id's of players
    // they are draining
    var i = l;
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
    var n = 0.007;
    var o = 4.0;
    var p = 0.06;
    return p / ( (n * (distance * distance)) + o );
};

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR.Drain;
