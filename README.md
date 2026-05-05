# StretchFlex

---

## Prerequisites

- Docker with Swarm mode support
- OpenSSL
- Linux or Windows environment

---

## Setup

### 1. Initialize Docker Swarm

```bash
docker swarm init
```

### 2. Create Secrets

Run the following commands to provision all required Docker secrets:

```bash
echo -n "data_manager"        | docker secret create db_user -
echo -n "DB_PASSWORD"         | docker secret create db_password -
echo "admin"                  | docker secret create admin_user -
echo "password"               | docker secret create admin_pass -
echo "user"                   | docker secret create clinician_user -
echo "password"               | docker secret create clinician_pass -
echo -n "elastic_password"    | docker secret create elastic_password -
echo -n "kibana_system_password" | docker secret create kibana_system_password -
openssl rand -base64 64       | docker secret create jwt_secret -
```

### 3. Set Script Permissions

```bash
chmod +x elastic/entrypoint.sh
```

---

## Build & Deploy

### Build Images

```bash
docker build -t stretchflex-frontend          ./frontend
docker build -t stretchflex-data-ingest       ./data-ingest
docker build -t stretchflex-patient-management ./patient-management
docker build -t stretchflex-auth              ./auth
```

### Deploy the Stack

```bash
docker stack deploy -c docker-compose.yml stretchflex
```

### Verify Deployment

```bash
docker stack services stretchflex
docker ps
```

---

## Teardown

To stop and remove all running containers:

```bash
docker stack rm stretchflex
```

---

## Scripts

For convenience, build/run/stop scripts are provided for both Linux and Windows.

### Linux

```bash
chmod +x ./scripts/docker.sh

./scripts/docker.sh build
./scripts/docker.sh run
./scripts/docker.sh stop
```

### Windows

```bat
./scripts/docker.bat build
./scripts/docker.bat run
./scripts/docker.bat stop
```
