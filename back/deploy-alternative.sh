#!/bin/bash
# Script de déploiement alternatif pour Render
# Utilise ce script si le déploiement automatique échoue

echo "🚀 Déploiement alternatif SOTRAL pour Render"
echo "==========================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier 'back/'"
    exit 1
fi

echo "📦 Construction de l'image Docker..."
docker build -t gosotral-api:latest .

if [ $? -ne 0 ]; then
    echo "❌ Échec de la construction Docker"
    exit 1
fi

echo "✅ Image Docker construite avec succès"

echo ""
echo "📋 Instructions pour Render:"
echo "============================"
echo ""
echo "1. Allez sur https://dashboard.render.com"
echo ""
echo "2. Créez un nouveau service Web:"
echo "   - Nom: gosotral-api"
echo "   - Environnement: Docker"
echo "   - Repository: https://github.com/matchamekevin/Go"
echo "   - Branch: dev2"
echo "   - Root Directory: back"
echo "   - Dockerfile Path: ./Dockerfile"
echo ""
echo "3. Variables d'environnement:"
echo "   - NODE_ENV: production"
echo "   - DATABASE_URL: [votre URL Render PostgreSQL]"
echo "   - PORT: 7000"
echo "   - JWT_SECRET: [générez un secret sécurisé]"
echo "   - ADMIN_EMAIL: admin@gosotral.com"
echo "   - ADMIN_PASSWORD: [mot de passe sécurisé]"
echo ""
echo "4. Commande de démarrage (optionnel):"
echo "   node dist/server.js"
echo ""
echo "5. Health Check Path:"
echo "   /health"
echo ""
echo "✅ Configuration terminée!"
echo ""
echo "💡 Le Dockerfile inclut maintenant des scripts d'initialisation robustes"
echo "   qui ne feront pas échouer le déploiement même en cas d'erreur."