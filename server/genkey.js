#!/usr/bin/env node

let _ = require('lodash');

let KEYSIZE = 12;
let CHARS = '0123456789ABCDEF';

let key = _.chain(CHARS).sampleSize(KEYSIZE).join('').value();

console.log(key);
