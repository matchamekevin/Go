#!/bin/bash

# Test de la synchronisation temps réel mobile
echo "🧪 Test de la synchronisation temps réel mobile"
echo "=============================================="

# Vérifier que le backend fonctionne
echo "🔍 Vérification du backend..."
if curl -s http://localhost:7000/health > /dev/null; then
    echo "✅ Backend opérationnel"
else
    echo "❌ Backend non accessible. Démarrez-le avec: cd back && node dist/server.js"
    exit 1
fi

# Tester la connexion SSE
echo ""
echo "🔌 Test de la connexion Server-Sent Events..."
sse_test=$(timeout 3 curl -s -H "Accept: text/event-stream" "http://localhost:7000/realtime/events?clientId=mobile_test" 2>/dev/null || echo "timeout")

if echo "$sse_test" | grep -q "Nouveau client SSE connecté"; then
    echo "✅ SSE opérationnel côté backend"
else
    echo "❌ SSE non fonctionnel"
fi

# Vérifier la configuration IP dans les fichiers
echo ""
echo "📱 Vérification de la configuration mobile..."

# Extraire l'IP des fichiers
tickets_ip=$(grep -o "http://[^']*:7000" /home/connect/kev/Go/front/src/screens/MyTicketsScreen.tsx | head -1)
products_ip=$(grep -o "http://[^']*:7000" /home/connect/kev/Go/front/src/screens/ProductsScreen.tsx | head -1)

echo "MyTicketsScreen: $tickets_ip"
echo "ProductsScreen: $products_ip"

if [ "$tickets_ip" = "$products_ip" ]; then
    echo "✅ Configuration cohérente"
else
    echo "⚠️  Configurations différentes détectées"
fi

# Tester la connectivité réseau
ip_address=$(echo $tickets_ip | sed 's|http://||' | sed 's|:7000||')
echo ""
echo "🌐 Test de connectivité réseau vers $ip_address..."

if ping -c 1 -W 2 $ip_address > /dev/null 2>&1; then
    echo "✅ Adresse IP accessible"
else
    echo "❌ Adresse IP non accessible"
    echo "   Vérifiez que votre téléphone et ordinateur sont sur le même réseau"
fi

# Tester les routes temps réel
echo ""
echo "📡 Test des routes temps réel..."
clients_response=$(curl -s "$tickets_ip/realtime/clients-count" 2>/dev/null || echo "error")

if echo "$clients_response" | grep -q '"connectedClients"'; then
    connected=$(echo "$clients_response" | grep -o '"connectedClients":[0-9]*' | cut -d':' -f2)
    echo "✅ Route clients-count accessible: $connected clients connectés"
else
    echo "❌ Route clients-count non accessible"
    echo "   Réponse: $clients_response"
fi

echo ""
echo "🎯 Instructions de test:"
echo "========================"
echo ""
echo "1️⃣ Lancez l'app mobile sur votre téléphone"
echo "2️⃣ Ouvrez l'interface admin: http://localhost:7000"
echo "3️⃣ Vérifiez les indicateurs 'Synchronisation active' (point vert)"
echo "4️⃣ Modifiez une ligne SOTRAL dans l'admin"
echo "5️⃣ Les données devraient se mettre à jour automatiquement dans l'app"
echo ""
echo "🔧 Si ça ne marche pas:"
echo "- Vérifiez les logs React Native pour les erreurs de connexion"
echo "- Relancez: ./configure-mobile-realtime.sh"
echo "- Vérifiez que téléphone et PC sont sur le même réseau WiFi"
