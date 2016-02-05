#!/usr/bin/env bash

if [ ! -f /usr/bin/js ]; then
    echo "ERROR: missing dependancy js. 'dnf install js-devel' to fix."
    exit
fi

#Gather values to replace in the templates
VERSION="$(util/jsawk 'return this.version' < package.json)"
BUILD="$(util/jsawk 'return this.build' < package.json)"
GIT_REF="$(git rev-parse HEAD)"

# Inline and minify
echo "Inlining and minifying content"
mkdir -p dist > /dev/null
cp -r client/textures dist/
cp client/favicon.ico dist/
node node_modules/html-inline/bin/cmd.js -i client/index.html > dist/index-inlined.html
node node_modules/html-minifier/cli.js dist/index-inlined.html --minify-js --collapse-whitespace --remove-comments  --remove-attribute-quotes --remove-script-type-attributes --remove-style-link-type-attributes > dist/index.html
rm dist/index-inlined.html

# Add the version and build number to index page
sed -i "s/{{ VERSION }}/$VERSION/g" dist/index.html
sed -i "s/{{ BUILD }}/$BUILD/g" dist/index.html
sed -i "s/{{ GIT_REF }}/$GIT_REF/g" dist/index.html

echo "dist/index.html written"

# generate the RPM spec file
echo "Generating RPM spec file: zorbio.spec"
rm -f zorbio.spec
cp zorbio.spec.template zorbio.spec
sed -i "s/VERSION/$VERSION/g" zorbio.spec
sed -i "s/BUILD/$BUILD/g" zorbio.spec
