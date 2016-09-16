# Zor.bio

Absorb the Orbs!

![Huge zorbio orb](./preview.png)

## Install

Install package dependancies:

    dnf install nodejs js-devel fedora-packager @development-tools

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

## Pushing to production

 1. Update package.json version number and/or build number.
 2. Build and upload the rpm with: `npm run build-upload`
 3. Update version repo to match desired version and build number, that will be deployed by ansible: https://github.com/ScriptaGames/zorbio-version/edit/master/version.json
 
## Prod architecture
![zorbio-prod-arch](https://cloud.githubusercontent.com/assets/3926730/18444665/31c9302c-78e8-11e6-8147-d7033cd2dd42.png)
![zorbio-balancer-arch 1](https://cloud.githubusercontent.com/assets/3926730/18276080/89006160-7417-11e6-8a12-19b891b0f0c5.png)
![multi-process](https://cloud.githubusercontent.com/assets/3926730/18602090/cb485666-7c34-11e6-9f18-eb91f733bc45.png)
