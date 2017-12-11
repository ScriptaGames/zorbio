#!/usr/bin/env bash

#-------------------------------------------------------------------------------
# Script used for systemd start, restart, stop control of pm2 processes
#-------------------------------------------------------------------------------

#defaults
NUM_NODES=1
LISTEN_PORT=31000
LABEL='server'
KEY=0
SECRET=0

if [ -v BALANCER_NODES ]; then
    echo "Using environment variable BALANCER_NODES: ${BALANCER_NODES}"
    NUM_NODES=${BALANCER_NODES}
fi

if [ -v LISTEN_PORT_START ]; then
    echo "Using environment variable LISTEN_PORT_START: ${LISTEN_PORT_START}"
    LISTEN_PORT=${LISTEN_PORT_START}
fi

if [ -v LOCAL_LINODE_LABEL ]; then
    echo "Using environment variable LOCAL_LINODE_LABEL: ${LOCAL_LINODE_LABEL}"
    LABEL=${LOCAL_LINODE_LABEL}
fi

if [ -v API_KEY ]; then
    echo "Using environment variable APP42_API_KEY"
    KEY=${API_KEY}
fi

if [ -v API_SECRET ]; then
    echo "Using environment variable APP42_API_SECRET"
    SECRET=${API_SECRET}
fi

function start {
    echo "Starting zorbio server"

    cd /usr/share/games/zorbio/

    # Check if environemt variable BALANCER_NODES is greater than 0 if so fork multiple processes
    if [ ${NUM_NODES} -gt 1 ]; then
        BAL_COUNT=0

        NEXT_LISTEN_PORT=${LISTEN_PORT}

        while [ ${BAL_COUNT} -lt ${NUM_NODES} ]; do
            let NEXT_HTTP_PORT=HTTP_PORT+BAL_COUNT
            let NEXT_LISTEN_PORT=LISTEN_PORT+BAL_COUNT


            echo "Starting next zorbio server on port: ${NEXT_LISTEN_PORT}"

            HTTPS_PORT=${NEXT_LISTEN_PORT} SERVER_LABEL=${LABEL} APP42_API_KEY=${KEY} APP42_API_SECRET=${SECRET} /usr/bin/pm2 start --name="zorbio-$BAL_COUNT" server/server.js -- dist

            let BAL_COUNT=BAL_COUNT+1
        done
    else
        echo "Starting single zorbio server on port: ${LISTEN_PORT}"
        HTTPS_PORT=${LISTEN_PORT} SERVER_LABEL=${LABEL} APP42_API_KEY=${KEY} APP42_API_SECRET=${SECRET} /usr/bin/pm2 start --name="zorbio-0" server/server.js -- dist
    fi
}

function stop {
    echo "Stopping zorbio server"
    /usr/bin/pm2 delete all
}

if [ $1 = "start" ]; then
    start
elif [ $1 = "stop" ]; then
    stop
elif [ $1 = "restart" ]; then
    stop
    start
fi

