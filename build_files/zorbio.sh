#!/usr/bin/env bash

#-------------------------------------------------------------------------------
# Script used for systemd start, restart, stop control of pm2 processes
#-------------------------------------------------------------------------------

#defaults
NUM_NODES=1
HTTP_PORT=8080
WS_PORT=31000
LABEL=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)
KEY=0
SECRET=0

if [ -v BALANCER_NODES ]; then
    echo "Using environment variable BALANCER_NODES: ${BALANCER_NODES}"
    NUM_NODES=${BALANCER_NODES}
fi

if [ -v HTTP_PORT_START ]; then
    echo "Using environment variable HTTP_PORT_START: ${HTTP_PORT_START}"
    HTTP_PORT=${HTTP_PORT_START}
fi

if [ -v WS_PORT_START ]; then
    echo "Using environment variable WS_PORT_START: ${WS_PORT_START}"
    WS_PORT=${WS_PORT_START}
fi

if [ -v LOCAL_LINODE_LABEL ]; then
    echo "Using environment variable APP42_API_KEY"
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
    # Check if environemt variable BALANCER_NODES is greater than 0 if so fork multiple processes
    if [ ${NUM_NODES} -gt 1 ]; then
        BAL_COUNT=0

        NEXT_WS_PORT=${WS_PORT}
        NEXT_HTTP_PORT=${HTTP_PORT}

        while [ ${BAL_COUNT} -lt ${NUM_NODES} ]; do
            let NEXT_HTTP_PORT=HTTP_PORT+BAL_COUNT
            let NEXT_WS_PORT=WS_PORT+BAL_COUNT

            echo "Starting next zorbio process on http_port: ${NEXT_HTTP_PORT}"
            echo "Starting next zorbio process on ws_port: ${NEXT_WS_PORT}"

            HTTP_PORT=${NEXT_HTTP_PORT} WS_PORT=${NEXT_WS_PORT} SERVER_LABEL=${LABEL} APP42_API_KEY=${KEY} APP42_API_SECRET=${SECRET} /usr/bin/pm2 start --name="zorbio-$BAL_COUNT" /usr/share/games/zorbio/server/server.js -- dist

            let BAL_COUNT=BAL_COUNT+1
        done
    else
        echo "Starting next zorbio process on http_port: ${HTTP_PORT}"
        echo "Starting single zorbio process on ws port: ${WS_PORT}"
        HTTP_PORT=${HTTP_PORT} WS_PORT=${WS_PORT} SERVER_LABEL=${LABEL} APP42_API_KEY=${KEY} APP42_API_SECRET=${SECRET} /usr/bin/pm2 start --name="zorbio-0" /usr/share/games/zorbio/server/server.js -- dist
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

