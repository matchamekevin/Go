#!/bin/bash

# Test en temps réel de la synchronisation
echo "🔴 Test en temps réel - Clients connectés"
echo "=========================================="

BASE_URL="http://192.168.1.78:7000"

echo "📊 Nombre de clients connectés:"
curl -s "$BASE_URL/realtime/clients-count" | jq .

echo ""
echo "🎯 Diffusion d'un événement test..."
curl -s -X POST "$BASE_URL/realtime/test-broadcast" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ticket_purchased",
    "data": {
      "user_id": 1,
      "product_code": "T100",
      "quantity": 2,
      "message": "Test temps réel - vérifiez vos apps !"
    }
  }' | jq .

echo ""
echo "✅ Événement diffusé !"
echo ""
echo "📱 Vérifiez maintenant:"
echo "- L'indicateur de synchronisation dans l'app mobile"
echo "- Les logs de console (ouvrez Dev Menu > Debug)"
echo "- Si l'événement apparaît dans les logs"