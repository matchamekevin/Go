#!/bin/bash
# Script d'initialisation complète de la base de données
set -euo pipefail

echo "[init-db] Initialisation de la base de données GoSOTRAL..."

# Détecter le conteneur PostgreSQL
CONTAINER=$(docker ps --format '{{.Names}}' | grep -E 'db|postgres' | head -n1 || echo "")

if [ -z "$CONTAINER" ]; then
  echo "[init-db] ERREUR: Aucun conteneur PostgreSQL trouvé. Lancez 'docker compose up -d'"
  exit 1
fi

echo "[init-db] Conteneur PostgreSQL détecté: $CONTAINER"

# Paramètres DB (alignés avec .env)
DB_USER="gosotral_user"
DB_NAME="gosotral_db"

# Créer les tables depuis les fichiers schema
SCHEMA_DIR="src/schema"
if [ ! -d "$SCHEMA_DIR" ]; then
  echo "[init-db] ERREUR: Dossier $SCHEMA_DIR introuvable"
  exit 1
fi

# Trouver et exécuter les fichiers SQL
SQL_FILES=$(find "$SCHEMA_DIR" -name "*.sql" | sort)

if [ -z "$SQL_FILES" ]; then
  echo "[init-db] ATTENTION: Aucun fichier .sql trouvé dans $SCHEMA_DIR"
  exit 0
fi

echo "[init-db] Fichiers SQL trouvés:"
for file in $SQL_FILES; do
  echo "  - $(basename "$file")"
done

# Exécuter chaque fichier SQL
for sql_file in $SQL_FILES; do
  filename=$(basename "$sql_file")
  echo "[init-db] Exécution de $filename..."
  
  if docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$sql_file" >/dev/null 2>&1; then
    echo "[init-db] ✓ $filename exécuté avec succès"
  else
    echo "[init-db] ⚠ Erreur lors de l'exécution de $filename (peut-être déjà existant)"
  fi
done

# Afficher l'état final des tables
echo "[init-db] Tables existantes:"
docker exec -it "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "\\dt" 2>/dev/null | sed 's/^/  /' || echo "  (Erreur d'affichage des tables)"

echo "[init-db] ✓ Initialisation terminée"

