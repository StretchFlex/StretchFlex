#!/bin/sh
set -e

echo "Waiting for Postgres to be ready..."

until pg_isready -U "$(cat /run/secrets/db_user)"; do
  sleep 2
done

echo "Running bootstrap insert..."

ADMIN_USER=$(cat /run/secrets/admin_user)
ADMIN_PASS=$(cat /run/secrets/admin_pass)

psql -U "$(cat /run/secrets/db_user)" -d patient_database <<EOF

INSERT INTO stretchflex_db.users (username, password_hash, role)
VALUES (
  '${ADMIN_USER}',
  '${ADMIN_PASS}',
  'admin'
)
ON CONFLICT (username) DO NOTHING;

EOF

echo "Bootstrap complete."