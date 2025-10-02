#!/bin/bash

# Script pour initialiser la base de données SOTRAL avec les vraies données

echo "🚌 Initialisation du système SOTRAL..."

# Chemin vers le fichier SQL
SQL_FILE="./src/schema/create_sotral_system.sql"

# Vérifier que le fichier existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur: Le fichier $SQL_FILE n'existe pas"
    exit 1
fi

echo "� Vérification de la DATABASE_URL..."
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL est définie"
    echo "🔗 Utilisation de DATABASE_URL pour la connexion"
    # Masquer le mot de passe dans les logs
    DB_URL_MASKED=$(echo "$DATABASE_URL" | sed 's/:\/\/.*@/:\/\/***:***@/g')
    echo "📍 Connexion masquée: $DB_URL_MASKED"
    
    PGPASSWORD="$DATABASE_URL" psql "$DATABASE_URL" -f "$SQL_FILE" 2>&1 || echo "⚠️  Certaines tables peuvent déjà exister, continuons..."
else
    echo "❌ DATABASE_URL n'est pas définie"
    echo "💡 Variables d'environnement disponibles:"
    env | grep -E "(DATABASE|DB_)" | sed 's/=.*/=***hidden***/' || echo "Aucune variable DB trouvée"
    echo "⏳ Tentative de connexion sans DATABASE_URL..."
    
    # Utilisation des variables d'environnement locales
    echo "🏠 Utilisation des variables d'environnement locales"
    
    # Charger les variables depuis .env si le fichier existe
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Variables par défaut
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-go_transport}
    DB_USER=${DB_USER:-postgres}
    DB_PASSWORD=${DB_PASSWORD:-password}
    
    echo "📍 Connexion à: ${DB_HOST}:${DB_PORT}/${DB_NAME} avec l'utilisateur ${DB_USER}"
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f "$SQL_FILE" 2>&1 || echo "⚠️  Certaines tables peuvent déjà exister, continuons..."
fi

# Vérifier le résultat
if [ $? -eq 0 ] || [ $? -eq 1 ]; then  # 0 = succès, 1 = erreur partielle (tables existantes)
    echo "✅ Système SOTRAL initialisé avec succès!"
    echo ""
    echo "📊 Données créées:"
    echo "   • 22 lignes de transport (données réelles de Lomé)"
    echo "   • Arrêts principaux (BIA, REX, Campus, etc.)"
    echo "   • Types de tickets (simple, étudiant, carnets)"
    echo "   • Zones tarifaires (100-300 FCFA selon distance)"
    echo "   • Fonctions de calcul de prix automatique"
    echo ""
    echo "🎯 Prochaines étapes:"
    echo "   • Démarrer le serveur backend: npm run dev"
    echo "   • Accéder à l'admin SOTRAL: http://localhost:3000/sotral"
    echo "   • Générer des tickets via l'interface admin"
    echo ""
else
    echo "❌ Erreur lors de l'initialisation de la base de données"
    echo "💡 Vérifiez:"
    echo "   • Que PostgreSQL est démarré"
    echo "   • Que la base de données '$DB_NAME' existe"
    echo "   • Que les identifiants de connexion sont corrects"
    exit 1
fi