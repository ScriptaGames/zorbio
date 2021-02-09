#!/usr/bin/env bash

#Gather values to replace in the templates
VERSION=$(jq '.version' -r < package.json)
BUILD=$(jq '.build' -r < package.json)
GIT_REF=$(git rev-parse HEAD)

SCRIPT_DIR=$( dirname $(realpath --relative-base=../ "$0") )

###############################################
# Inline and minify
###############################################

if [ "$1" == "--dist-dev" ]; then
    ln -f -s ./environment_dev.js common/environment.js
else
    # Point the common/environment.js symlink to environment_prod.js
    # Do this first, so inlined index.html get's prod config
    ln -f -s environment_prod.js common/environment.js
fi

# Compile ractive templates

echo "Compiling Ractive templates"
node util/ractive-precompile.js
cp client/index.html client/index.jsontemplate.html
# replace '.html' with '.json' in ractive template script tags
sed -i -e '/\(\(templates\/.*\)\.html\)"/s//\2.json"/' client/index.jsontemplate.html
# load only ractive's runtime (parser/compiler no longer needed)
sed -i -e 's/\/ractive\.js/\/runtime.js/' client/index.jsontemplate.html

# Minify Javascript

echo 'Minifing Javascript'
python util/minify.py client/index.jsontemplate.html > client/index_min.html

echo "Inlining and minify html"
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

# Inject the social sharring buttons
SHARE_BUTTONS='<script type="text/javascript" src="//platform-api.sharethis.com/js/sharethis.js#property=5a1ef0c73ab78300126056a6&product=sticky-share-buttons"></script>'
sed -i "s,{{ SHARE_BUTTONS }},$SHARE_BUTTONS,g" dist/index.html

echo "dist/index.html written"

# restore orig environment.js symlink back to dev
cd common/
ln -f -s ./environment_dev.js ./environment.js

