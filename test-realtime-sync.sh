#!/bin/bash

# Test complet de la synchronisation temps réel
echo "🧪 Test complet de la synchronisation temps réel"
echo "==============================================="

# Vérifier que le backend est en cours d'exécution
echo "🔍 Vérification du backend..."
if ! curl -s http://localhost:7000/health > /dev/null; then
    echo "❌ Backend non accessible sur localhost:7000"
    echo "   Démarrez-le d'abord: cd back && docker compose up -d"
    exit 1
fi
echo "✅ Backend opérationnel"

# Tester les événements temps réel
echo ""
echo "📡 Test des événements temps réel..."

# Test 1: Achat de ticket
echo "🧾 Test 1: Simulation d'achat de ticket..."
curl -s -X POST http://localhost:7000/api/realtime/test-broadcast \
  -H "Content-Type: application/json" \
  -d '{"eventType": "ticket_purchased", "data": {"user_id": 1, "product_code": "T100", "quantity": 2}}' > /dev/null
echo "✅ Événement 'ticket_purchased' diffusé"

# Test 2: Validation de ticket
echo "✅ Test 2: Simulation de validation de ticket..."
curl -s -X POST http://localhost:7000/api/realtime/test-broadcast \
  -H "Content-Type: application/json" \
  -d '{"eventType": "ticket_validated", "data": {"ticket_code": "ABC123", "validator_id": 1}}' > /dev/null
echo "✅ Événement 'ticket_validated' diffusé"

# Test 3: Suppression de ticket
echo "🗑️  Test 3: Simulation de suppression de ticket..."
curl -s -X POST http://localhost:7000/api/realtime/test-broadcast \
  -H "Content-Type: application/json" \
  -d '{"eventType": "ticket_deleted", "data": {"ticket_id": 123}}' > /dev/null
echo "✅ Événement 'ticket_deleted' diffusé"

# Test 4: Création de ligne
echo "🚌 Test 4: Simulation de création de ligne..."
curl -s -X POST http://localhost:7000/api/realtime/test-broadcast \
  -H "Content-Type: application/json" \
  -d '{"eventType": "line_created", "data": {"line_id": 1, "name": "Ligne A"}}' > /dev/null
echo "✅ Événement 'line_created' diffusé"

# Test 5: Événements SOTRAL
echo "🎫 Test 5: Simulation d'événements SOTRAL..."
curl -s -X POST http://localhost:7000/api/realtime/test-broadcast \
  -H "Content-Type: application/json" \
  -d '{"eventType": "sotral_ticket_purchased", "data": {"user_id": 1, "line_id": 1}}' > /dev/null
echo "✅ Événement 'sotral_ticket_purchased' diffusé"

# Vérifier le nombre de clients connectés
echo ""
echo "👥 Vérification des clients connectés..."
CLIENTS_COUNT=$(curl -s http://localhost:7000/api/realtime/clients-count | grep -o '"connectedClients":[0-9]*' | cut -d':' -f2)
echo "📊 Clients connectés: $CLIENTS_COUNT"

echo ""
echo "🎉 Tests terminés !"
echo ""
echo "📱 Vérifications manuelles:"
echo "=========================="
echo "1. Ouvrez l'app mobile (MyTicketsScreen)"
echo "2. Ouvrez l'interface admin"
echo "3. Ouvrez une autre fenêtre avec ProductsScreen"
echo ""
echo "4. Dans l'admin, effectuez une action (achat, validation, suppression)"
echo "5. Vérifiez que toutes les fenêtres se mettent à jour automatiquement"
echo ""
echo "✅ Si tout se met à jour en temps réel, la synchronisation fonctionne !"