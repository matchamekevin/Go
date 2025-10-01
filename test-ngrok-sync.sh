#!/bin/bash

# Test de la synchronisation avec ngrok
echo "🧪 Test de synchronisation avec ngrok"
echo "====================================="

# Vérifier si ngrok est en cours d'exécution
if ! pgrep -f "ngrok http 7000" > /dev/null; then
    echo "❌ ngrok n'est pas en cours d'exécution"
    echo "   Lancez d'abord: ./setup-ngrok.sh"
    exit 1
fi

# Obtenir l'URL publique
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*' | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Impossible d'obtenir l'URL ngrok"
    exit 1
fi

echo "✅ ngrok actif: $PUBLIC_URL"
echo ""

# Tester la connectivité backend
echo "🔍 Test de connectivité backend..."
if curl -s "$PUBLIC_URL/health" > /dev/null; then
    echo "✅ Backend accessible via ngrok"
else
    echo "❌ Backend non accessible via ngrok"
    exit 1
fi

# Tester les routes SSE
echo "📡 Test des routes SSE..."
if curl -s "$PUBLIC_URL/api/realtime/events" > /dev/null; then
    echo "✅ Routes SSE accessibles"
else
    echo "❌ Routes SSE non accessibles"
    exit 1
fi

echo ""
echo "🎉 Tout fonctionne !"
echo ""
echo "📱 Test mobile:"
echo "==============="
echo "1. Ouvrez l'app mobile"
echo "2. Vérifiez que la synchronisation fonctionne"
echo "3. Testez depuis un autre réseau WiFi"
echo ""
echo "🔧 Debug:"
echo "========"
echo "Si ça ne marche pas:"
echo "- Vérifiez que le backend tourne sur localhost:7000"
echo "- Vérifiez les logs ngrok: curl http://localhost:4040/api/tunnels"
echo "- Testez directement: curl $PUBLIC_URL/health"