#!/usr/bin/env bash
#
# build-fast.sh — fast equivalent of build.sh.
#
# Identical pipeline to build.sh (ractive template precompile, JS minify,
# html inline + minify, version/env injection) except the JavaScript
# minification step uses esbuild (Go) via util/minify_fast.py instead of
# uglify-es via util/minify.py. That step goes from ~1-2 minutes to ~1-2
# seconds.
#
# Usage (same as build.sh):
#   bash build-fast.sh            # production build (ZOR_ENV=prod) -> dist/
#   bash build-fast.sh --dist-dev # dev build (ZOR_ENV=dev)        -> dist/
#
# Requires esbuild; if it is not found the build will install it with
#   npm install --no-save --no-package-lock esbuild
# which does not modify package.json or package-lock.json.

set -e

#Gather values to replace in the templates
VERSION=$(jq '.version' -r < package.json)
BUILD=$(jq '.build' -r < package.json)
GIT_REF=$(git rev-parse HEAD)

SCRIPT_DIR=$( dirname $(realpath --relative-base=../ "$0") )

###############################################
# Inline and minify
###############################################

# Compile ractive templates

echo "Compiling Ractive templates"
node util/ractive-precompile.js
cp client/index.html client/index.jsontemplate.html
# replace '.html' with '.json' in ractive template script tags
sed -i -e '/\(\(templates\/.*\)\.html\)"/s//\2.json"/' client/index.jsontemplate.html
# load only ractive's runtime (parser/compiler no longer needed)
sed -i -e 's/\/ractive\.js/\/runtime.js/' client/index.jsontemplate.html

# Minify Javascript (esbuild instead of uglify-es)

echo 'Minifying Javascript (esbuild)'
python3 util/minify_fast.py client/index.jsontemplate.html > client/index_min.html

echo "Inlining and minifying html"
mkdir -p dist > /dev/null
cp -r client/textures dist/
cp -r client/sfx dist/
cp -r client/images dist/
cp -r client/skins dist/
cp client/favicon.ico dist/
node node_modules/html-inline/bin/cmd.js -i client/index_min.html > dist/index-inlined.html
node node_modules/html-minifier/cli.js dist/index-inlined.html --collapse-whitespace --remove-comments --minify-css --remove-attribute-quotes --remove-script-type-attributes --remove-style-link-type-attributes > dist/index.html

# Cleanup build temp build files
rm dist/index-inlined.html
rm client/templates/*.json
rm client/index.jsontemplate.html
rm client/index_min.html
rm client/js/third.min.js
rm client/js/first.min.js

# Add the version and build number to index page
sed -i "s/{{ VERSION }}/$VERSION/g" dist/index.html
sed -i "s/{{ BUILD }}/$BUILD/g" dist/index.html
sed -i "s/{{ GIT_REF }}/$GIT_REF/g" dist/index.html

if [ "$1" != "--dist-dev" ]; then
    # Set the window.process.env.ZOR_ENV to 'prod'
    # So that browser clients load the right environmental config overrides at page load
    sed -i "s/ZOR_ENV = 'dev'/ZOR_ENV = 'prod'/g" dist/index.html
fi

echo "dist/index.html written"
