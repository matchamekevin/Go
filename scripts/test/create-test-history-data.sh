#!/bin/bash

# Script pour créer des données de test d'historique
echo "📊 Création de données de test pour l'historique client"
echo "===================================================="

API_URL="https://go-j2rr.onrender.com"
USER_ID=75
USER_EMAIL="testuser2@example.com"
USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzUsImVtYWlsIjoidGVzdHVzZXIyQGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlcjIiLCJyb2xlIjoidXNlciIsImlhdCI6MTc1OTQ5MDEyNiwiZXhwIjoxNzYwMDk0OTI2fQ.jqdeoYNvUIP4fBWGt3vjeNjK-DBvTpZ0oxF8A3srhzs"

echo "🎫 1. Achat de tickets pour l'utilisateur de test..."

# Acheter plusieurs tickets pour l'utilisateur
echo "   Achat ticket 1 - Ligne 1 (Simple)..."
TICKET1=$(curl -s -X POST "$API_URL/sotral/purchase" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "line_id": 1,
    "ticket_type_code": "SIMPLE",
    "departure_stop_id": 1,
    "arrival_stop_id": 5,
    "payment_method": "mobile_money"
  }')

echo "Résultat ticket 1:"
echo $TICKET1 | jq '.'

echo ""
echo "   Achat ticket 2 - Ligne 2 (Étudiant)..."
TICKET2=$(curl -s -X POST "$API_URL/sotral/purchase" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "line_id": 2,
    "ticket_type_code": "STUDENT",
    "departure_stop_id": 8,
    "arrival_stop_id": 12,
    "payment_method": "cash"
  }')

echo "Résultat ticket 2:"
echo $TICKET2 | jq '.'

echo ""
echo "   Achat ticket 3 - Ligne 3 (Simple)..."
TICKET3=$(curl -s -X POST "$API_URL/sotral/purchase" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "line_id": 3,
    "ticket_type_code": "SIMPLE",
    "departure_stop_id": 15,
    "arrival_stop_id": 20,
    "payment_method": "card"
  }')

echo "Résultat ticket 3:"
echo $TICKET3 | jq '.'

echo ""
echo "📋 2. Vérification des tickets achetés..."
SOTRAL_TICKETS=$(curl -s -X GET "$API_URL/sotral/my-tickets" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "Tickets SOTRAL de l'utilisateur:"
echo $SOTRAL_TICKETS | jq '.'

echo ""
echo "📊 3. Test de l'historique de validation..."
VALIDATION_HISTORY=$(curl -s -X GET "$API_URL/tickets/my-ticket-validations" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "Historique de validation:"
echo $VALIDATION_HISTORY | jq '.'

echo ""
echo "✅ RÉSUMÉ"
echo "=========="
echo "Tickets SOTRAL créés: $(echo $SOTRAL_TICKETS | jq '.count // 0')"
echo "Historique de validation: $(echo $VALIDATION_HISTORY | jq '.data | length')"

echo ""
echo "🎯 L'utilisateur $USER_EMAIL (ID: $USER_ID) devrait maintenant avoir:"
echo "   • Des tickets dans l'historique SOTRAL"
echo "   • Un historique visible dans l'app frontend"
echo ""
echo "📱 Testez maintenant l'app frontend avec ces identifiants:"
echo "   Email: $USER_EMAIL"
echo "   Password: 123456"