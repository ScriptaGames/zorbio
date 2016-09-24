#!/usr/bin/env bash

FILES=$(cat index.html | grep '".*\.js"' -o | sed 's/"//g')

for file in $FILES; do
    echo $file
done

uglifyjs                              \
    $FILES                            \
    --beautify                        \
    --stats                           \
    --screw-ie8                       \
    --mangle                          \
    --mangle-props                    \
    --reserved 'THREE' \
    --define 'THREE' \
    --reserved-file min-reserved.json \
    --reserve-domprops                \
    --source-map bundle.min.map.js    \
    --output bundle.min.js
    # --compress                        \
    # --enclose 'x'                     \
