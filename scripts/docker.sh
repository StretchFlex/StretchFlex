#!/bin/sh

if [ "$1" = "" ]; then
    echo "Usage: $0 {build|run|stop}"
    exit 1
elif [ "$1" = "build" ]; then
    docker build -t stretchflex-frontend ./frontend
    docker build -t stretchflex-data-ingest ./data-ingest
    docker build -t stretchflex-patient-management ./patient-management
elif [ "$1" = "run" ]; then
    docker stack deploy -c docker-compose.yml stretchflex --detach=false
elif [ "$1" = "stop" ]; then
    docker stack rm stretchflex
else
    echo "Usage: $0 {build|run|stop}"
    exit 1
fi