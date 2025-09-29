#!/bin/bash

# Script pour démarrer le système SOTRAL avec temps réel
echo "🚀 Démarrage du système SOTRAL avec synchronisation temps réel"

# Fonction de nettoyage
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Gestionnaire de signaux
trap cleanup SIGINT SIGTERM

# Démarrer le backend
echo "🔧 Démarrage du backend..."
cd /home/connect/kev/Go/back
npm run dev &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo "⏳ Attente du backend..."
sleep 5

# Démarrer l'admin
echo "🖥️  Démarrage de l'interface admin..."
cd /home/connect/kev/Go/admin
npm run dev &
ADMIN_PID=$!

echo ""
echo "✅ Services démarrés :"
echo "   🔌 Backend WebSocket: http://localhost:7000"
echo "   🖥️  Admin: http://localhost:5173"
echo ""
echo "🎯 Fonctionnalités temps réel activées :"
echo "   • Mise à jour automatique des lignes"
echo "   • Synchronisation des tickets"
echo "   • Notifications en temps réel"
echo ""
echo "📝 Testez en ouvrant l'admin et en modifiant des données"
echo "   Les changements apparaîtront instantanément !"
echo ""
echo "🛑 Appuyez sur Ctrl+C pour arrêter tous les services"

# Attendre que les processus se terminent
wait