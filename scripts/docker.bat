IF "%1"=="build" (
    docker build -t stretchflex-frontend ./frontend
    docker build -t stretchflex-data-ingest ./data-ingest
) ELSE IF "%1"=="run" (
    docker stack deploy -c docker-compose.yml stretchflex
) ELSE IF "%1"=="stop" (
    docker stack rm stretchflex
) ELSE (
    echo Usage: docker.bat [build|run|stop]
)