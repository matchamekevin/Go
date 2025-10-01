#!/bin/bash

# Test du système de synchronisation temps réel SOTRAL
echo "🧪 Test du système de synchronisation temps réel SOTRAL"
echo "=================================================="

# Vérifier que le serveur backend fonctionne
echo "🔍 Vérification du serveur backend..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Serveur backend opérationnel"
else
    echo "❌ Serveur backend non accessible sur localhost:3000"
    echo "   Veuillez démarrer le serveur avec: cd back && npm run dev"
    exit 1
fi

# Tester la route de diffusion de test
echo ""
echo "📡 Test de diffusion d'événement..."
response=$(curl -s -X POST http://localhost:3000/realtime/test-broadcast \
  -H "Content-Type: application/json" \
  -d '{"eventType": "test", "data": {"message": "Test de synchronisation temps réel"}}')

if echo "$response" | grep -q '"success":true'; then
    echo "✅ Diffusion d'événement réussie"
    clients_count=$(echo "$response" | grep -o '"connectedClients":[0-9]*' | cut -d':' -f2)
    echo "   Clients connectés: $clients_count"
else
    echo "❌ Échec de la diffusion d'événement"
    echo "   Réponse: $response"
fi

# Tester la connexion SSE
echo ""
echo "🔌 Test de connexion Server-Sent Events..."
sse_response=$(timeout 3 curl -s -H "Accept: text/event-stream" http://localhost:3000/realtime/events?clientId=test_client 2>/dev/null || echo "timeout")

if echo "$sse_response" | grep -q "data:"; then
    echo "✅ Connexion SSE établie avec succès"
    echo "   Événements reçus:"
    echo "$sse_response" | head -3
else
    echo "❌ Échec de connexion SSE"
    echo "   Réponse: $sse_response"
fi

# Tester le nombre de clients connectés
echo ""
echo "👥 Vérification du nombre de clients connectés..."
clients_response=$(curl -s http://localhost:3000/realtime/clients-count)

if echo "$clients_response" | grep -q '"connectedClients"'; then
    echo "✅ Route clients-count opérationnelle"
    connected=$(echo "$clients_response" | grep -o '"connectedClients":[0-9]*' | cut -d':' -f2)
    echo "   Clients actuellement connectés: $connected"
else
    echo "❌ Erreur lors de la récupération du nombre de clients"
    echo "   Réponse: $clients_response"
fi

echo ""
echo "🎯 Test terminé !"
echo ""
echo "Pour tester manuellement:"
echo "1. Ouvrez http://localhost:7000 dans votre navigateur (interface admin)"
echo "2. Modifiez une ligne SOTRAL dans l'admin"
echo "3. Vérifiez que les changements apparaissent automatiquement"
echo ""
echo "Ou testez avec curl:"
echo "curl -N http://localhost:3000/realtime/events?clientId=admin_client"