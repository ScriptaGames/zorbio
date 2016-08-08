# Zor.bio

Absorb the Orbs!

![Huge zorbio orb](./preview.png)

## Install

Install package dependancies:

    dnf install nodejs js-devel fedora-packager @development-tools

After cloning the repository, cd into it and install dependencies:
   
    npm install -g bower
    npm install -g less
    bower install
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

## Pushing to production

 1. Update package.json version number and/or build number.
 2. Build and upload the rpm with: `npm run build-upload`
 3. Update puppet repo to match desired version and build number https://github.com/Jared-Sprague/scripta_env/edit/master/manifests/zorbio.pp

