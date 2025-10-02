#!/bin/bash

# Script pour créer la table des paiements SOTRAL

echo "💳 Création de la table des paiements SOTRAL..."

# Chemin vers le fichier SQL
SQL_FILE="./schema/create_sotral_payments_table.sql"

# Vérifier que le fichier existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur: Le fichier $SQL_FILE n'existe pas"
    exit 1
fi

echo "🔗 Vérification de la connexion à la base de données..."
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL est définie"
    DB_URL_MASKED=$(echo "$DATABASE_URL" | sed 's/:\/\/.*@/:\/\/***:***@/g')
    echo "📍 Connexion masquée: $DB_URL_MASKED"

    PGPASSWORD="$DATABASE_URL" psql "$DATABASE_URL" -f "$SQL_FILE" 2>&1 || {
        echo "❌ Erreur lors de la création de la table des paiements"
        exit 1
    }
else
    echo "❌ DATABASE_URL n'est pas définie"
    echo "💡 Variables d'environnement disponibles:"
    env | grep -E "(DATABASE|DB_)" | sed 's/=.*/=***hidden***/' || echo "Aucune variable DB trouvée"

    # Variables par défaut
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-go_transport}
    DB_USER=${DB_USER:-postgres}
    DB_PASSWORD=${DB_PASSWORD:-password}

    echo "📍 Connexion à: ${DB_HOST}:${DB_PORT}/${DB_NAME} avec l'utilisateur ${DB_USER}"

    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f "$SQL_FILE" 2>&1 || {
        echo "❌ Erreur lors de la création de la table des paiements"
        exit 1
    }
fi

echo "✅ Table des paiements SOTRAL créée avec succès!"
echo ""
echo "📊 Table créée:"
echo "   • sotral_payments: stockage des transactions mobile money"
echo "   • Support pour Mixx by YAS et Flooz"
echo "   • Suivi des statuts de paiement (pending, completed, failed, cancelled)"
echo "   • Intégration avec les tickets SOTRAL"
echo ""
echo "🎯 Prêt pour les paiements mobiles!"