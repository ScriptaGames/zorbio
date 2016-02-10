#!/usr/bin/env node

var _ = require('lodash');

var KEYSIZE = 12;
var CHARS = '0123456789ABCDEF';

var key = _.chain(CHARS).sampleSize(KEYSIZE).join('').value();

console.log(key);
