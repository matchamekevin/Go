#!/bin/bash
# Script pour synchroniser la base de données locale avec Render
set -euo pipefail

echo "🔄 Synchronisation de la base de données locale avec Render"
echo "========================================================="

# Vérifier si l'URL Render est fournie
if [ $# -eq 0 ]; then
    echo "❌ Erreur: Veuillez fournir l'URL de connexion Render"
    echo ""
    echo "Usage: $0 'postgresql://user:password@host:port/database'"
    echo ""
    echo "Pour obtenir l'URL:"
    echo "1. Allez sur https://dashboard.render.com/d/dpg-d305h0mr433s73euqgfg-a"
    echo "2. Onglet 'Connection'"
    echo "3. Copiez 'External Database URL'"
    exit 1
fi

RENDER_DB_URL="$1"
BACKUP_FILE="render_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📋 Configuration:"
echo "  URL Render: ${RENDER_DB_URL:0:50}..."
echo "  Fichier de sauvegarde: $BACKUP_FILE"
echo ""

# Étape 1: Vérifier que Docker est disponible
echo "🐳 Étape 1: Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas disponible"
    exit 1
fi

echo "✅ Docker est disponible"
echo ""

# Étape 2: Créer le dump de Render
echo "📤 Étape 2: Création du dump depuis Render..."
if pg_dump "$RENDER_DB_URL" > "$BACKUP_FILE"; then
    echo "✅ Dump créé avec succès: $BACKUP_FILE"
    echo "   Taille: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Échec de la création du dump"
    echo "   Vérifiez que l'URL Render est correcte et accessible"
    exit 1
fi
echo ""

# Étape 3: Arrêter les conteneurs
echo "🛑 Étape 3: Arrêt des conteneurs locaux..."
docker compose down
echo "✅ Conteneurs arrêtés"
echo ""

# Étape 4: Supprimer le volume de données
echo "🗑️  Étape 4: Suppression du volume de données local..."
if docker volume ls | grep -q go_db_data; then
    docker volume rm go_db_data
    echo "✅ Volume supprimé"
else
    echo "ℹ️  Volume go_db_data non trouvé (peut-être déjà supprimé)"
fi
echo ""

# Étape 5: Redémarrer les conteneurs
echo "🚀 Étape 5: Redémarrage des conteneurs..."
docker compose up -d

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 15

# Vérifier que PostgreSQL est accessible
if ! docker exec go-db-1 pg_isready -U gosotral_user -d gosotral_db >/dev/null 2>&1; then
    echo "❌ PostgreSQL n'est pas accessible après 15 secondes"
    echo "   Attendez un peu plus ou vérifiez les logs: docker compose logs db"
    exit 1
fi

echo "✅ PostgreSQL est prêt"
echo ""

# Étape 6: Restaurer le dump
echo "📥 Étape 6: Restauration du dump..."
if docker exec -i go-db-1 psql -U gosotral_user -d gosotral_db < "$BACKUP_FILE" >/dev/null 2>&1; then
    echo "✅ Restauration terminée avec succès"
else
    echo "❌ Erreur lors de la restauration"
    echo "   Vérifiez les logs pour plus de détails"
    exit 1
fi
echo ""

# Étape 7: Vérification
echo "🔍 Étape 7: Vérification des données..."
echo "   Nombre de lignes SOTRAL:"
docker exec -it go-db-1 psql -U gosotral_user -d gosotral_db -c "SELECT COUNT(*) as lignes_sotral FROM sotral_lines;" 2>/dev/null || echo "   ⚠️ Impossible de compter les lignes"

echo "   Nombre d'arrêts:"
docker exec -it go-db-1 psql -U gosotral_user -d gosotral_db -c "SELECT COUNT(*) as arrets FROM sotral_stops;" 2>/dev/null || echo "   ⚠️ Impossible de compter les arrêts"

echo "   Nombre d'utilisateurs:"
docker exec -it go-db-1 psql -U gosotral_user -d gosotral_db -c "SELECT COUNT(*) as utilisateurs FROM users;" 2>/dev/null || echo "   ⚠️ Impossible de compter les utilisateurs"
echo ""

echo "🎉 Synchronisation terminée avec succès !"
echo ""
echo "📁 Fichier de sauvegarde conservé: $BACKUP_FILE"
echo "💡 Vous pouvez maintenant tester votre application locale"