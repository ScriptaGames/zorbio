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


###############################################
# Generate the RPM spec file
###############################################
echo "Generating RPM spec file: zorbio.spec"
rm -f zorbio.spec
cp zorbio.spec.template zorbio.spec
sed -i "s/VERSION/$VERSION/g" zorbio.spec
sed -i "s/BUILD/$BUILD/g" zorbio.spec


###############################################
# Build the rpm
###############################################
echo "Building the rpm"
cp zorbio.spec ~/rpmbuild/SPECS/
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
echo "bulding the rpm"
cd ~/rpmbuild
rpmbuild -bb SPECS/zorbio.spec


###############################################
# Upload the rpm and update yum repo database
###############################################
if [ "$1" = "--upload" ]; then
    echo "Uploading rpm..."
    scp -P 4460 ~/rpmbuild/RPMS/x86_64/zorbio-$VERSION-$BUILD.fc23.x86_64.rpm mcp.zor.bio:/var/www/html/repo/
    # Update the rpm repo database
    echo "Updating the rpm reopdata"
    ssh -p 4460 mcp.zor.bio 'sudo createrepo --update /var/www/html/repo'
fi
