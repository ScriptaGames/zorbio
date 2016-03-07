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
 * @return {Array} an array of all player pairs within drain distance
 */
ZOR.Drain.findAll = function ZORDrainFindAll( players ) {
    var players_array = _.values( players );
    var drainers = [];
    var player1;
    var player2;
    var distance;

    var l = players_array.length;
    var i = l;
    var j = 0;

    while ( --i ) {
        j = i;
        while ( --j ) {
            player1 = players_array[i];
            player2 = players_array[j];
            distance = player1.getPosition().distanceTo( player2.getPosition() );
            if ( distance <= config.DRAIN.MAX_DISTANCE ) {
                drainers.push({
                    p1: player1,
                    p2: player2,
                });
            }
        }
    }

    return drainers;
};

/**
 * Find all players within drain distance of a given player.
 *
 * @param {Object} players the object containing all players
 * @param {Object} player the player in question
 * @return {Array} an array of players within drain distance of the given player
 */
ZOR.Drain.find = function ZORDrainFind( players, player ) {
    var drainers = [];
    var distance;
    var key;
    var player2;

    for ( key in players ) {
        if ( players.hasOwnProperty( key ) ) {
            player2 = players[key];
            if ( player === player2 ) continue; // don't compare player to itself!
            distance = player.getPosition().distanceTo( player2.getPosition() );
            if ( distance <= config.DRAIN.MAX_DISTANCE ) {
                drainers.push(player2);
            }
        }
    }

    return drainers;
};

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR.Drain;
