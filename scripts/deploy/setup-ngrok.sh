#!/bin/bash

# Configuration avec ngrok pour accès public
echo "🌐 Configuration avec ngrok (accès public)"
echo "==========================================="

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok n'est pas installé"
    echo ""
    echo "📦 Installation de ngrok:"
    echo "1. Allez sur https://ngrok.com/download"
    echo "2. Téléchargez la version pour Linux"
    echo "3. Extrayez et placez ngrok dans /usr/local/bin/"
    echo "4. Authentifiez-vous: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

echo "✅ ngrok détecté"

# Vérifier si le backend est en cours d'exécution
if ! curl -s http://localhost:7000/health > /dev/null; then
    echo "⚠️  Backend non détecté sur localhost:7000"
    echo "   Démarrez-le d'abord: cd back && node dist/server.js"
    read -p "Continuer quand même ? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🚀 Démarrage de ngrok..."

# Tuer les processus ngrok existants
pkill -f ngrok 2>/dev/null

# Démarrer ngrok sur le port 7000
ngrok http 7000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Attendre que ngrok démarre
sleep 3

# Obtenir l'URL publique
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Impossible d'obtenir l'URL ngrok"
    echo "   Vérifiez les logs: cat /tmp/ngrok.log"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ ngrok opérationnel !"
echo "🌍 URL publique: $PUBLIC_URL"
echo ""

# Mettre à jour la configuration mobile
echo "📝 Mise à jour de la configuration mobile..."
sed -i "s|baseUrl: 'http://[^']*'|baseUrl: '$PUBLIC_URL'|g" /home/connect/kev/Go/front/src/screens/MyTicketsScreen.tsx
sed -i "s|baseUrl: 'http://[^']*'|baseUrl: '$PUBLIC_URL'|g" /home/connect/kev/Go/front/src/screens/ProductsScreen.tsx

echo "✅ Configuration mise à jour !"
echo ""
echo "📋 Instructions:"
echo "================"
echo "URL publique: $PUBLIC_URL"
echo ""
echo "🎯 Utilisation:"
echo "1. L'app mobile peut maintenant se connecter depuis n'importe quel réseau"
echo "2. Partagez cette URL avec vos testeurs"
echo "3. La synchronisation fonctionne partout !"
echo ""
echo "🔄 Pour arrêter:"
echo "   pkill -f ngrok"
echo ""
echo "💡 Conseil: Gardez cette fenêtre ouverte pendant vos tests"
echo "   ngrok s'arrêtera automatiquement si vous fermez ce terminal"