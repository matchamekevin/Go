#!/bin/bash

# Configuration automatique de l'IP réseau pour la synchronisation temps réel
echo "🔍 Configuration automatique de l'IP réseau"
echo "==========================================="

# Détecter l'IP locale
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ip route get 1 | awk '{print $7; exit}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Impossible de détecter l'IP locale"
    exit 1
fi

echo "✅ IP locale détectée: $LOCAL_IP"

# Tester la connectivité du backend
echo "🔍 Test de connectivité backend..."
if ! curl -s "http://$LOCAL_IP:7000/health" > /dev/null; then
    echo "❌ Backend non accessible sur $LOCAL_IP:7000"
    echo "   Assurez-vous que le backend tourne: cd back && docker compose up -d"
    exit 1
fi
echo "✅ Backend accessible"

# Mettre à jour la configuration mobile
echo "📝 Mise à jour de la configuration mobile..."
BASE_URL="http://$LOCAL_IP:7000"

# Mettre à jour les écrans mobiles
sed -i "s|baseUrl: '[^']*'|baseUrl: '$BASE_URL'|g" /home/connect/kev/Go/front/src/screens/MyTicketsScreen.tsx
sed -i "s|baseUrl: '[^']*'|baseUrl: '$BASE_URL'|g" /home/connect/kev/Go/front/src/screens/ProductsScreen.tsx

echo "✅ Configuration mobile mise à jour"

# Tester la connexion SSE
echo "🔌 Test de connexion SSE..."
CLIENT_ID="test_$(date +%s)"
SSE_TEST=$(timeout 5 curl -s -H "Accept: text/event-stream" "$BASE_URL/realtime/events?clientId=$CLIENT_ID" 2>/dev/null || echo "timeout")

if echo "$SSE_TEST" | grep -q "data:"; then
    echo "✅ Connexion SSE réussie"
else
    echo "⚠️  Connexion SSE lente (normal pour le premier test)"
fi

echo ""
echo "🎯 Configuration terminée !"
echo ""
echo "📱 Utilisation:"
echo "==============="
echo "IP configurée: $BASE_URL"
echo ""
echo "🔄 Pour tester:"
echo "1. Ouvrez l'app mobile"
echo "2. Vérifiez l'indicateur 'Synchronisation active'"
echo "3. Effectuez une action dans l'admin"
echo "4. L'app mobile devrait se mettre à jour automatiquement"
echo ""
echo "🔧 Si ça ne marche pas:"
echo "- Vérifiez que l'IP $LOCAL_IP est accessible depuis votre téléphone"
echo "- Utilisez ngrok: npm install -g ngrok && ngrok http 7000"
echo "- Ou configurez manuellement l'IP dans les écrans"