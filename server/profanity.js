const _ = require('lodash');
const censor = require('profanity-censor');

const custom_dictionary = [
    'fuck', 'pussi',
];

function add_term(term) {
    censor.dictionary.push(term);
}

// push each custom dictionary item onto the censor's dictionary
custom_dictionary.forEach(add_term);

module.exports = censor;
