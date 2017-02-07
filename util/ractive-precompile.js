#!/usr/bin/env node

// Precompile all Ractive templates.  Ractive templates live in
// /client/templates/
//
// The compiler output is a JSON object representing the template, which gets
// saved alongside the HTML.  For example: tutorial.html will be compiled to
// tutorial.json in the same directory.
//
// When a production build occurs, the JSON will be injected into the
// ractive/template <script> tag.

const fs = require('fs');
const path = require('path');
const Ractive = require('../client/bower_components/ractive/ractive');

const TEMPLATE_DIR = path.resolve(__dirname, '../client/templates/');

// Loop through all template files
fs.readdir( TEMPLATE_DIR, (err, files) => {
    files.forEach( file => {
        // only compile HTML templates
        if (/\.html$/.test(file)) {
            const filePath = `${TEMPLATE_DIR}/${file}`;
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) return console.error(err);
                // compile the HTML template
                const compiledTemplate = Ractive.parse(data);
                const templateString = JSON.stringify(compiledTemplate);
                const jsonPath = `${TEMPLATE_DIR}/${file.replace(/\.html$/,'')}.json`;
                // write the compiled template to a json file
                fs.writeFile(jsonPath, templateString, err => {
                    if (err) return console.error(err);
                    console.log(`template ${file} compiled to ${jsonPath}`);
                });
            });
        }
    });
});
