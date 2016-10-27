#!/bin/bash
echo "Spawning $1 processes"
for i in $(eval echo {1..$1});
do
    echo "Spawning client $i"
    ( node ./node_client.js & ) > /dev/null
    sleep 1.5
done
