if [ $1 = "build" ]; then
    docker build -t stretchflex-frontend ./frontend
    docker build -t stretchflex-data-ingest ./data-ingest
elif [ $1 = "run" ]; then
    docker stack deploy -c docker-compose.yml stretchflex
elif [ $1 = "stop" ]; then
    docker stack rm stretchflex
else
    echo "Usage: $0 {build|run|stop}"
fi
