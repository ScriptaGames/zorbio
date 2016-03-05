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
 * Find all players within drain distance.
 */
ZOR.Drain.findAll = function ZORDrainFindAll( players ) {
    var drainers = [];
    // TODO this checks players twice; fix it me!
    _.forOwn( players, function (player1) {
        _.forOwn( players, function (player2) {
            if ( player1 === player2 ) return;

            var distance = player1.getPosition().distanceTo( player2.getPosition() );
            if ( distance <= config.DRAIN.MAX_DISTANCE ) {
                drainers.push({
                    p1: player1,
                    p2: player2,
                    amount: config.DRAIN.AMOUNT( distance ),
                });
            }
        });
    });
    return drainers;
}

// if we're in nodejs, export the root ZOR object
if (NODEJS) module.exports = ZOR.Drain;
