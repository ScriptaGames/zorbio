#!/usr/bin/env bash

FILES=$(cat index.html  | grep '".*\.js"' -o | sed 's/"//g')

for file in $FILES; do
    echo $file
done

uglifyjs                           \
    $FILES                         \
    --stats                        \
    --mangle-props                 \
    --mangle                       \
    --compress     \
    --reserved "THREE,_,Wad,schemapack" \
    --screw-ie8                    \
    --reserve-domprops \
    --source-map bundle.min.map.js \
    --output bundle.min.js
    # --enclose 'x'                  \
    # --reserved-file min-reserved.json \
