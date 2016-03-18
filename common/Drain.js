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
    var players_array = _.values( players );
    var drain = {};
    var p1;
    var p2;
    var p1_scale;
    var p2_scale;
    var distance;
    var drain_ids;

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
            distance = p1.sphere.position.distanceTo( p2.sphere.position );

            // if a player is close enough and small enough, save the p2's id
            if ( distance <= config.DRAIN.MAX_DISTANCE ) {

                p1_scale = p1.sphere.scale;
                p2_scale = p2.sphere.scale;

                if ( p1_scale - p2_scale < -config.DRAIN.SIZE_LIMIT  ) {
                    drain[ p1.id ].push( p2.id ); } // p1 drains p2
                else if ( p2_scale - p1_scale < -config.DRAIN.SIZE_LIMIT ) {
                    drain[ p2.id ].push( p1.id ); } // p2 drains p1
            }

        }
    }

    return drain;
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
    var player2;

    var playerIds = Object.getOwnPropertyNames(players);
    for (var i = 0, l = playerIds.length; i < l; i++) {
        var id = +playerIds[i];  // make sure id is a number
        player2 = players[id];

        if (player === player2) continue; // don't compare player to itself!
        distance = player.getPosition().distanceTo(player2.getPosition());
        if (distance <= config.DRAIN.MAX_DISTANCE) {
            drainers.push(player2);
        }
    }

    return drainers;
};

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR.Drain;
