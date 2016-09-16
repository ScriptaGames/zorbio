#!/usr/bin/env bash

#-------------------------------------------------------------------------------
# Script used for systemd start, restart, stop control of pm2 processes
#-------------------------------------------------------------------------------

NUM_NODES=1
PORT=31000

if [ -v BALANCER_NODES ]; then
    echo "Using environment variable BALANCER_NODES: ${BALANCER_NODES}"
    NUM_NODES=${BALANCER_NODES}
fi

if [ -v NODE_PORT ]; then
    echo "Using environment variable NODE_PORT: ${NODE_PORT}"
    PORT=${NODE_PORT}
fi

function start {
    echo "Starting zorbio server"
    # Check if environemt variable BALANCER_NODES is greater than 0 if so fork multiple processes
    if [ ${NUM_NODES} -gt 1 ]; then
        BAL_COUNT=0
        NEXT_PORT=${PORT}
        while [ ${BAL_COUNT} -lt ${NUM_NODES} ]; do
            let NEXT_PORT=PORT+BAL_COUNT
            echo "Starting next zorbio process on port: ${NEXT_PORT}"
            PORT=${NEXT_PORT} /usr/bin/pm2 start --name="zorbio-$BAL_COUNT" /usr/share/games/zorbio/server/server.js -- dist
            let BAL_COUNT=BAL_COUNT+1
        done
    else
        echo "Starting single zorbio process on port ${PORT}"
        PORT=${PORT} /usr/bin/pm2 start --name="zorbio-0" /usr/share/games/zorbio/server/server.js -- dist
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

