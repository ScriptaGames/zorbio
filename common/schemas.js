var NODEJS = typeof module !== 'undefined' && module.exports;

if (NODEJS) var schemapack = require('schemapack');

var ZOR = ZOR || {};

ZOR.schemas = {
    playerSchema:  schemapack.build([{
        health: "varuint",
        jumping: "boolean",
        position: [ "int16" ],
        attributes: { str: 'uint8', agi: 'uint8', int: 'uint8' }
    }]),

};

if (NODEJS) module.exports = ZOR.schemas;
