# Zorbio

Absorb the Orbs!

![Huge zorbio orb](./preview.png)

## Install

Install package dependancies:

    dnf install nodejs fedora-packager @development-tools gcc-c++ jq
    
Optional dependancies:

If you want to use the backend service to App42 you'll need php

    dnf install php

After cloning the repository, cd into it and install dependencies:

    npm install

Edit `common/config.js` to your heart's content.

In order to push to production, you'll need to create a rpm build tree.

    $ cd ~ && rpmdev-setuptree

## Hacking

To launch a local server:

    npm start

Changes to JS in `server/` requires a server restart, but changes in `client/`
doesn't.

## Builds

To perform a production build:

    npm run build

To build and upload the built RPM to the prod yum repo:

    npm run build-upload

Note: The above command requires you have installed your ssh pub key on mcp.zor.bio

This will build all the client assets into a single HTML file
(`dist/index.html`) with all CSS and JavaScript inlined and minified.  Images
are still loaded via HTTP requests.

Once a build has been performed, the server can be launched in production mode,
which really just causes the server to serve up `dist/` instead of `client/`.
Here's the command:

    npm run start-prod

### Building with docker

After installing docker, build zorbio's docker "builder" image.

    cd $ZORBIO_DIR
    docker build -t mwcz/zorbio-builder .

Once that's done, you can run builds through docker!

    bash build-docker.sh

(this helps a lot if you aren't running the same Fedora release as our prod
servers)


