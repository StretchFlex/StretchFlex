#!/bin/sh
set -e

USER=$(cat /run/secrets/rabbit_user)
PASS=$(cat /run/secrets/rabbit_pass)

sed "s/PLACEHOLDER_USER/$USER/g; s/PLACEHOLDER_PASS/$PASS/g" \
  /etc/rabbitmq/definitions.json \
  > /etc/rabbitmq/definitions.final.json

export RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-rabbitmq_management load_definitions \"/etc/rabbitmq/definitions.final.json\""

exec docker-entrypoint.sh rabbitmq-server
