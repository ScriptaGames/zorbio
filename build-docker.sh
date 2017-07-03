#!/usr/bin/env bash

docker run -v $PWD:/root/zorbio:Z -it mwcz/zorbio-builder sh -c "cd && cd zorbio && bash build.sh"
