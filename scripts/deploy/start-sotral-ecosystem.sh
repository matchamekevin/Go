#!/bin/bash

# Script pour démarrer l'écosystème SOTRAL complet
echo "🚀 Démarrage de l'écosystème SOTRAL complet"
echo "=========================================="

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis la racine du projet"
    exit 1
fi

# Fonction pour afficher le statut
show_status() {
    echo "📍 $1"
}

# Fonction pour afficher les erreurs
show_error() {
    echo "❌ Erreur: $1"
}

# 1. Vérifier la base de données
show_status "Vérification de la base de données PostgreSQL..."
if ! command -v psql &> /dev/null; then
    show_error "PostgreSQL n'est pas installé"
    exit 1
fi

# 2. Démarrer le backend
show_status "Démarrage du backend Express.js..."
cd back

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    npm install
fi

# Vérifier le fichier .env
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant dans le backend"
    echo "📝 Créez un fichier .env avec les variables nécessaires"
    exit 1
fi

# Démarrer le backend en arrière-plan
echo "🔧 Démarrage du serveur backend..."
npm run dev &
BACKEND_PID=$!
echo "Backend démarré avec PID: $BACKEND_PID"

# Attendre que le backend soit prêt
sleep 5

# 3. Démarrer l'interface admin
show_status "Démarrage de l'interface admin React..."
cd ../admin

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances admin..."
    npm install
fi

# Démarrer l'admin en arrière-plan
echo "🎨 Démarrage de l'interface admin..."
npm run dev &
ADMIN_PID=$!
echo "Interface admin démarrée avec PID: $ADMIN_PID"

# 4. Tester la connectivité
sleep 10

echo ""
echo "🔍 Test de connectivité des services..."

# Test backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend accessible sur http://localhost:3000"
else
    echo "❌ Backend non accessible (code: $BACKEND_STATUS)"
fi

# Test admin
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "000")
if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Interface admin accessible sur http://localhost:5173"
else
    echo "❌ Interface admin non accessible (code: $ADMIN_STATUS)"
fi

# 5. Afficher les informations de démarrage
echo ""
echo "🌟 Écosystème SOTRAL démarré avec succès !"
echo "=========================================="
echo "📍 Backend API:        http://localhost:3000"
echo "📍 Interface Admin:    http://localhost:5173"
echo "📍 Documentation API:  http://localhost:3000/api/docs"
echo ""
echo "🎯 Fonctionnalités disponibles:"
echo "   • Gestion des lignes SOTRAL (lecture seule depuis la BD)"
echo "   • Génération de tickets admin"
echo "   • Interface de gestion des tickets"
echo "   • Analytics et statistiques"
echo "   • API complète pour l'app mobile"
echo ""
echo "🔧 Commandes utiles:"
echo "   • Test des endpoints: ./test-admin-tickets.sh"
echo "   • Test API SOTRAL: ./test-sotral-api.sh"
echo "   • Intégration complète: ./test-sotral-integration.sh"
echo ""

# Fonction pour arrêter les services
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "Backend arrêté"
    fi
    if [ ! -z "$ADMIN_PID" ]; then
        kill $ADMIN_PID 2>/dev/null || true
        echo "Interface admin arrêtée"
    fi
    echo "👋 Services arrêtés avec succès"
    exit 0
}

# Capturer Ctrl+C pour arrêter proprement
trap cleanup SIGINT SIGTERM

echo "💡 Appuyez sur Ctrl+C pour arrêter tous les services"
echo "📱 Ouvrez http://localhost:5173 dans votre navigateur pour accéder à l'admin"
echo ""

# Attendre indéfiniment
while true; do
    sleep 1
done