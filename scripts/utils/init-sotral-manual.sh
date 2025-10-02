#!/bin/bash

# Script d'initialisation manuelle pour Render
# À exécuter via les logs Render ou SSH après déploiement

echo "🚀 Initialisation manuelle du système SOTRAL sur Render..."

# Vérifier que nous sommes sur Render
if [ -z "$RENDER" ] && [ -z "$DATABASE_URL" ]; then
    echo "❌ Ce script doit être exécuté sur Render ou avec DATABASE_URL définie"
    exit 1
fi

# Chemin vers le fichier SQL
SQL_FILE="./src/schema/create_sotral_system.sql"

# Vérifier que le fichier existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur: Le fichier $SQL_FILE n'existe pas"
    echo "📁 Contenu du répertoire actuel:"
    ls -la
    exit 1
fi

echo "📝 Exécution du script de création des tables SOTRAL..."

# Essayer d'exécuter avec DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
    echo "🔗 Utilisation de DATABASE_URL"
    DB_URL_MASKED=$(echo "$DATABASE_URL" | sed 's/:\/\/.*@/:\/\/***:***@/g')
    echo "📍 Connexion: $DB_URL_MASKED"

    # Exécuter le script SQL
    psql "$DATABASE_URL" -f "$SQL_FILE" 2>&1

    if [ $? -eq 0 ]; then
        echo "✅ Initialisation réussie!"
    else
        echo "⚠️  Erreur lors de l'initialisation (certaines tables existent peut-être déjà)"
    fi
else
    echo "❌ DATABASE_URL non trouvée"
    exit 1
fi

echo ""
echo "🎯 Test de connexion aux tables..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_lines FROM sotral_lines;" 2>/dev/null || echo "❌ Impossible de compter les lignes"

echo "🎉 Initialisation terminée!"