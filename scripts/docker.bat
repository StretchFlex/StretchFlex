@echo off
SETLOCAL
IF "%1"=="" (
    echo Usage: docker.bat [build^|run^|stop]
    goto :eof
)
IF "%1"=="build" (
    docker build -t stretchflex-frontend ./frontend
    docker build -t stretchflex-data-ingest ./data-ingest
    docker build -t stretchflex-patient-management ./patient-management
    goto :eof
)
IF "%1"=="run" (
    docker stack deploy -c docker-compose.yml stretchflex --detach=false
    goto :eof
)
IF "%1"=="stop" (
    docker stack rm stretchflex
    goto :eof
)
echo Usage: docker.bat [build^|run^|stop]