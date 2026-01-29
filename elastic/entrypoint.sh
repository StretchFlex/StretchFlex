#!/bin/bash
set -e

echo "Starting custom Elasticsearch entrypoint..."

# Copy secret to private location
cp /run/secrets/elastic_password /tmp/elastic_password

# Fix permissions
chmod 600 /tmp/elastic_password

# Export new path
export ELASTIC_PASSWORD_FILE=/tmp/elastic_password

# Unset old variable if present
unset ELASTIC_PASSWORD

# Exec original entrypoint
exec /usr/local/bin/docker-entrypoint.sh
