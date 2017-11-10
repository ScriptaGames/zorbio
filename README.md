# Zorbio

Absorb the Orbs!

![Huge zorbio orb](./preview.png)

## Install

Install package dependancies:

    dnf install nodejs js-devel fedora-packager @development-tools gcc-c++
    
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

## Pushing to production

 1. Update package.json version number and/or build number.
 2. Build and upload the rpm with: `npm run build-upload`
 3. Update version repo to match desired version and build number, that will be deployed by ansible: https://github.com/ScriptaGames/zorbio-version/edit/master/version.json
 
## Prod architecture
![zorbio-prod-arch](https://cloud.githubusercontent.com/assets/3926730/18444665/31c9302c-78e8-11e6-8147-d7033cd2dd42.png)
![zorbio-balancer-arch 1](https://cloud.githubusercontent.com/assets/3926730/18276080/89006160-7417-11e6-8a12-19b891b0f0c5.png)
![multi-process](https://cloud.githubusercontent.com/assets/3926730/18602090/cb485666-7c34-11e6-9f18-eb91f733bc45.png)


## Creating a new node

    ssh mcp.zorb.io -p4460
    sudo su -

    # -l can be dallas frankfurt singapore
    # -c is cores, can be more if demand spikes quickly
    ./create_node.sh -l dallas -c 1

    # when that is done (check lish or wait 3-4 mins)... get node's IP and:
    ansible-playbook -i ~/linode.py -l 45.33.14.120 scripta-ansible/playbooks/zorbio/provision.yaml

Once ansible finishes provisioning the new node(s) then the cronjob will automatically deploy the latest zorbio build ton them on it's next run.

## Creating audio recordings of WebAudio files

I used two programs, `sox` which is a command-line audio manipulation tool, and
`pulsecaster` which made recording my comp's own audio very convenient.
Install the deps:

    sudo dnf install sox sox-plugins-* lame-mp3x pulsecaster

Steps for recording and converting the audio:

 1. Launch pulsecaster
 2. Open Zorbio in your browser but stay at the title screen since no audio
    plays there
 3. Open the JavaScript console
 4. Click **Record** in pulsecaster
 5. Play whatever sound you want, from the JS console.  For example:
    `ZOR.Sounds.sfx.food_capture.play()`
 6. When the sound is done playing, click **Stop** in pulsecaster and save the
    ogg file

Now use sox to convert it to an mp3 and trim silence from the start.  I wrote
this script to convert a whole directory of oggs:

    for fogg in *.ogg; do
        fmp3tmp="${fogg%.ogg}.tmp.mp3"
        fmp3="${fogg%.ogg}.mp3"

        # trim silence from start + ogg to mp3 conversion
        sox $fogg $fmp3 silence 1 0.2 0.001%

        echo "$fogg -> $fmp3"
    done

