#!/usr/bin/env bash

docker run -v $PWD:/root/zorbio -it mwcz/zorbio-builder sh -c "cd && cd zorbio && bash build.sh"
