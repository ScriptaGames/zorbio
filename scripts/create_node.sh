#!/bin/bash

NUMBER=1
LABEL_PREFIX="zor-node-us-central-"
START_POSTFIX_NUM=1

while getopts ":hn:" opt; do
  case $opt in
    h)
      echo "-n number of nodes" >&2
      echo "-l location" >&2
      ;;
    n)
      echo "-n number of nodes: $OPTARG" >&2
      NUMBER=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

echo "Number: $NUMBER"

#linode create zor-node-us-central-02 --stackscript 37796 --stackscriptjson '{}' -P sdf344fdSV -L Dallas --group zor-nodes-us-central
#linode ip-add zor-node-us-central-02 --private
