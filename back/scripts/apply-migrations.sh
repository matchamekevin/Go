#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./apply-migrations.sh <DATABASE_URL>
# or set DATABASE_URL environment variable

DB_URL=${1:-${DATABASE_URL:-}}
if [ -z "$DB_URL" ]; then
  echo "Usage: $0 <DATABASE_URL>\nOr set DATABASE_URL environment variable" >&2
  exit 2
fi

MIGRATIONS_DIR="$(cd "$(dirname "$0")/../src/schema/migrations" && pwd)"

echo "Applying SQL migrations from: $MIGRATIONS_DIR"

for f in "$MIGRATIONS_DIR"/*.sql; do
  [ -e "$f" ] || continue
  echo "-- Running $f"
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$f"
done

echo "All migrations applied."
