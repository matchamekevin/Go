#!/bin/bash

# Déploiement rapide du système de synchronisation temps réel
echo "🚀 Déploiement rapide - Synchronisation temps réel SOTRAL"
echo "======================================================="

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Vérifier les prérequis
echo "🔍 Vérification des prérequis..."

if ! command_exists node; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Prérequis OK"
echo ""

# Configuration réseau pour mobile
echo "📱 Configuration réseau pour l'app mobile..."
./configure-mobile-realtime.sh

echo ""
echo "🔧 Démarrage du backend..."

# Aller dans le dossier back
cd back

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Compiler pour vérifier qu'il n'y a pas d'erreurs
echo "🔨 Compilation TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur de compilation"
    exit 1
fi

echo "✅ Compilation réussie"
echo ""

# Démarrer le serveur en arrière-plan
echo "🚀 Démarrage du serveur..."
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Backend démarré (PID: $BACKEND_PID)"
echo ""

# Attendre que le serveur soit prêt
echo "⏳ Attente du démarrage du serveur..."
sleep 5

# Tester que le serveur fonctionne
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Serveur opérationnel"
else
    echo "❌ Serveur ne répond pas"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🧪 Tests automatiques..."

# Tester les routes temps réel
./../test-realtime-sync.sh

echo ""
echo "📋 Instructions finales:"
echo "========================"
echo ""
echo "🎯 Le système est maintenant opérationnel !"
echo ""
echo "Pour tester la synchronisation complète:"
echo ""
echo "1️⃣ Interface Admin:"
echo "   • Ouvrez: http://localhost:7000"
echo "   • Allez dans Gestion SOTRAL"
echo "   • Modifiez une ligne (créer/modifier/supprimer)"
echo ""
echo "2️⃣ App Mobile:"
echo "   • Lancez l'app sur votre téléphone"
echo "   • Allez dans 'Mes tickets' ou 'Billets disponibles'"
echo "   • Vérifiez l'indicateur 'Synchronisation active' (point vert)"
echo "   • Les données se mettent à jour automatiquement !"
echo ""
echo "3️⃣ Arrêt du système:"
echo "   • Ctrl+C pour arrêter ce script"
echo "   • Le backend sera arrêté automatiquement"
echo ""

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🧹 Nettoyage..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Backend arrêté"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Garder le script en cours d'exécution
echo "🔄 Système en cours d'exécution... Appuyez sur Ctrl+C pour arrêter"
wait $BACKEND_PID