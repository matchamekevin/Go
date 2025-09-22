#!/bin/bash

# Script de diagnostic et réparation pour la base de données SOTRAL sur Render

echo "🔍 Diagnostic du système SOTRAL..."

# Vérifier les variables d'environnement
echo ""
echo "📋 Variables d'environnement de base de données :"
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL: définie"
    DB_URL_MASKED=$(echo "$DATABASE_URL" | sed 's/:\/\/.*@/:\/\/***:***@/g')
    echo "   Masquée: $DB_URL_MASKED"
else
    echo "❌ DATABASE_URL: non définie"
fi

# Tester la connexion à la base de données
echo ""
echo "🔗 Test de connexion à la base de données..."
if [ -n "$DATABASE_URL" ]; then
    psql "$DATABASE_URL" -c "SELECT version();" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Connexion à PostgreSQL: réussie"
    else
        echo "❌ Connexion à PostgreSQL: échouée"
        echo "   Erreur: $(psql "$DATABASE_URL" -c "SELECT version();" 2>&1 | head -3)"
        exit 1
    fi
else
    echo "❌ Impossible de tester la connexion (DATABASE_URL manquante)"
    exit 1
fi

# Vérifier si les tables SOTRAL existent
echo ""
echo "📊 Vérification des tables SOTRAL..."
TABLES=("sotral_lines" "sotral_stops" "sotral_categories" "sotral_tickets" "sotral_pricing_zones")

for table in "${TABLES[@]}"; do
    COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "-1")
    if [ "$COUNT" = "-1" ]; then
        echo "❌ Table $table: n'existe pas"
        TABLE_MISSING=true
    else
        echo "✅ Table $table: $COUNT enregistrements"
    fi
done

# Si des tables sont manquantes, proposer l'initialisation
if [ "$TABLE_MISSING" = true ]; then
    echo ""
    echo "🚨 Des tables SOTRAL sont manquantes!"
    echo "🔧 Lancement de l'initialisation..."

    # Chemin vers le fichier SQL
    SQL_FILE="./src/schema/create_sotral_system.sql"

    if [ -f "$SQL_FILE" ]; then
        echo "📝 Exécution du script SQL..."
        psql "$DATABASE_URL" -f "$SQL_FILE" 2>&1

        if [ $? -eq 0 ]; then
            echo "✅ Initialisation réussie!"
        else
            echo "⚠️  Erreur lors de l'initialisation (certaines tables existent peut-être déjà)"
        fi
    else
        echo "❌ Fichier SQL introuvable: $SQL_FILE"
        exit 1
    fi
else
    echo ""
    echo "✅ Toutes les tables SOTRAL sont présentes!"
fi

# Test final
echo ""
echo "🎯 Test final - Comptage des lignes SOTRAL..."
LINE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM sotral_lines;" 2>/dev/null || echo "0")
echo "📈 Nombre de lignes SOTRAL: $LINE_COUNT"

if [ "$LINE_COUNT" -gt 0 ]; then
    echo "🎉 Système SOTRAL opérationnel!"
else
    echo "⚠️  Aucune ligne trouvée - vérifiez l'initialisation"
fi

echo ""
echo "✨ Diagnostic terminé!"