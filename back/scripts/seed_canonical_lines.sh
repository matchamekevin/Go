#!/usr/bin/env bash
set -euo pipefail

# Simple helper to run the canonical lines SQL against the configured Postgres DB.
# Usage: ./seed_canonical_lines.sh

DB_HOST=${PGHOST:-localhost}
DB_PORT=${PGPORT:-5432}
DB_NAME=${PGDATABASE:-sotral_db}
DB_USER=${PGUSER:-postgres}

SQL_FILE="$(dirname "$0")/../schema/insert_canonical_lines.sql"

if ! [ -f "$SQL_FILE" ]; then
  echo "SQL file not found: $SQL_FILE"
  exit 1
fi

echo "Running seed SQL: $SQL_FILE against $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

PGPASSWORD=${PGPASSWORD:-} psql "postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -f "$SQL_FILE"

echo "Seed complete."
