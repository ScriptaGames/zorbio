#!/usr/bin/env bash

if [ ! -f /usr/bin/js ]; then
    echo "ERROR: missing dependancy js. 'dnf install js-devel' to fix."
    exit
fi

#Gather values to replace in the templates
VERSION="$(util/jsawk 'return this.version' < package.json)"
BUILD="$(util/jsawk 'return this.build' < package.json)"
GIT_REF="$(git rev-parse HEAD)"

SCRIPT_DIR=$( dirname $(realpath --relative-base=../ "$0") )

###############################################
# Inline and minify
###############################################
# Point the common/environment.js symlink to environment_prod.js
# Do this first, so inlined index.html get's prod config
cd common/
ln -f -s ./environment_prod.js ./environment.js
cd ../

# Minify Javascript
cd client/
echo 'Minifing Javascript'
python ../util/minify.py index.html > index_min.html
cd ../

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
rm client/index_min.html
rm client/js/third.min.js
rm client/js/first.min.js

# Add the version and build number to index page
sed -i "s/{{ VERSION }}/$VERSION/g" dist/index.html
sed -i "s/{{ BUILD }}/$BUILD/g" dist/index.html
sed -i "s/{{ GIT_REF }}/$GIT_REF/g" dist/index.html
GOOGLE_AD_SCRIPT='<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>'
sed -i "s,</head>,$GOOGLE_AD_SCRIPT</head>,g" dist/index.html

echo "dist/index.html written"

###############################################
# Generate the RPM spec files
###############################################
echo "Generating RPM spec file: zorbio.spec"
cd build_files
rm -f *.spec
cp zorbio.spec.template zorbio.spec
cp zorbio-static.spec.template zorbio-static.spec
sed -i "s/VERSION/$VERSION/g" zorbio.spec
sed -i "s/BUILD/$BUILD/g" zorbio.spec
sed -i "s/VERSION/$VERSION/g" zorbio-static.spec
sed -i "s/BUILD/$BUILD/g" zorbio-static.spec
cp *.spec ~/rpmbuild/SPECS/
cd ..


###############################################
# Build the rpms
###############################################
echo "Building the rpms"
# save a copy of the current node_modules
mv node_modules node_modules_orig

# remove current node modules to get rid of dev dependancies
rm -rf node_modules

# Install only production dependancies
echo "Install production dependancies"
npm install --production

# Tar up the source for the rpm build
echo "tar source"
tar -czf ~/rpmbuild/SOURCES/zorbio.tar.gz ../$SCRIPT_DIR --transform="s/^$SCRIPT_DIR/zorbio/"

# Restore original node_modules
echo "clean up node modules"
rm -rf node_modules
mv node_modules_orig node_modules

# restore orig environment.js symlink back to dev
cd common/
ln -f -s ./environment_dev.js ./environment.js

# Finally build the rpm
cd ~/rpmbuild
echo "Building the server rpm"
rpmbuild -bb SPECS/zorbio.spec
echo "Building the static rpm"
rpmbuild -bb SPECS/zorbio-static.spec

###############################################
# Upload the rpm and update yum repo database
###############################################
if [ "$1" = "--upload" ]; then
    echo "Uploading rpms..."
    scp -P 4460 ~/rpmbuild/RPMS/x86_64/zorbio-$VERSION-$BUILD.fc24.x86_64.rpm mcp.zor.bio:/var/www/html/repo/
    scp -P 4460 ~/rpmbuild/RPMS/x86_64/zorbio-static-$VERSION-$BUILD.fc24.x86_64.rpm mcp.zor.bio:/var/www/html/repo/
    echo "Done. Repo will be updated within 5 minutes. Edit: https://github.com/ScriptaGames/zorbio-version/edit/master/version.json"
fi
