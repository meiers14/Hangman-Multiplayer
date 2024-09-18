#!/bin/sh

stopped_containers=$(docker ps -aq -f "status=exited")

if [ -n "$stopped_containers" ]; then
  echo "$stopped_containers"
  docker start $stopped_containers
fi
