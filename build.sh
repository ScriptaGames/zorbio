#!/usr/bin/env bash

mkdir -p dist > /dev/null
cp -r client/textures dist/
cp client/favicon.ico dist/
node node_modules/html-inline/bin/cmd.js -i client/index.html > dist/index-inlined.html
node node_modules/html-minifier/cli.js dist/index-inlined.html --minify-js --collapse-whitespace --remove-comments  --remove-attribute-quotes --remove-script-type-attributes --remove-style-link-type-attributes > dist/index.html
rm dist/index-inlined.html
echo "dist/index.html written"

# generate the RPM spec file
VERSION="$(util/jsawk 'return this.version' < package.json)"
BUILD="$(util/jsawk 'return this.build' < package.json)"
rm -f zorbio.spec
cp zorbio.spec.template zorbio.spec
sed -i "s/VERSION/$VERSION/g" zorbio.spec
sed -i "s/BUILD/$BUILD/g" zorbio.spec
