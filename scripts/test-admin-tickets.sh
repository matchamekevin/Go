#!/bin/bash

# Script de test pour l'interface admin de génération de tickets SOTRAL
# Ce script teste les endpoints de génération de tickets depuis l'admin

echo "=== Test de l'interface admin SOTRAL - Génération de tickets ==="

# Configuration
BACKEND_URL="http://localhost:3000"  # Ajustez selon votre configuration
ADMIN_EMAIL="admin@sotral.com"
ADMIN_PASSWORD="admin123"

# Fonction pour afficher les résultats
show_result() {
    echo "--- $1 ---"
    echo "Status: $2"
    echo "Response:"
    echo "$3" | jq '.' 2>/dev/null || echo "$3"
    echo ""
}

# 1. Connexion admin
echo "1. Connexion admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$ADMIN_EMAIL'",
    "password": "'$ADMIN_PASSWORD'"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Échec de la connexion admin"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Connexion admin réussie"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. Récupérer les lignes SOTRAL
echo "2. Récupération des lignes SOTRAL..."
LINES_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/admin/sotral/lines" \
  -H "Authorization: Bearer $TOKEN")

LINES_STATUS=$?
show_result "Récupération des lignes" "$LINES_STATUS" "$LINES_RESPONSE"

# Extraire la première ligne pour les tests
FIRST_LINE_ID=$(echo "$LINES_RESPONSE" | jq -r '.data[0].id' 2>/dev/null)

if [ "$FIRST_LINE_ID" = "null" ] || [ -z "$FIRST_LINE_ID" ]; then
    echo "❌ Aucune ligne SOTRAL trouvée"
    exit 1
fi

echo "🚌 Ligne de test sélectionnée: ID $FIRST_LINE_ID"
echo ""

# 3. Récupérer les types de tickets
echo "3. Récupération des types de tickets..."
TICKET_TYPES_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/admin/sotral/ticket-types" \
  -H "Authorization: Bearer $TOKEN")

TICKET_TYPES_STATUS=$?
show_result "Récupération des types de tickets" "$TICKET_TYPES_STATUS" "$TICKET_TYPES_RESPONSE"

# Extraire le premier type de ticket
FIRST_TICKET_TYPE=$(echo "$TICKET_TYPES_RESPONSE" | jq -r '.data[0].code' 2>/dev/null)

if [ "$FIRST_TICKET_TYPE" = "null" ] || [ -z "$FIRST_TICKET_TYPE" ]; then
    echo "❌ Aucun type de ticket trouvé"
    exit 1
fi

echo "🎫 Type de ticket de test: $FIRST_TICKET_TYPE"
echo ""

# 4. Génération d'un ticket individuel
echo "4. Génération d'un ticket individuel..."
GENERATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/admin/sotral/generate-tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lineId": '$FIRST_LINE_ID',
    "ticketTypeCode": "'$FIRST_TICKET_TYPE'",
    "quantity": 2,
    "validityHours": 24
  }')

GENERATE_STATUS=$?
show_result "Génération de tickets individuels" "$GENERATE_STATUS" "$GENERATE_RESPONSE"

# 5. Génération de tickets en lot
echo "5. Génération de tickets en lot..."
BULK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/admin/sotral/bulk-generate-tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "lineId": '$FIRST_LINE_ID',
        "ticketTypeCode": "'$FIRST_TICKET_TYPE'",
        "quantity": 3,
        "validityHours": 48
      }
    ]
  }')

BULK_STATUS=$?
show_result "Génération en lot" "$BULK_STATUS" "$BULK_RESPONSE"

# 6. Récupération des tickets avec filtres
echo "6. Récupération des tickets générés..."
TICKETS_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/admin/sotral/tickets?page=1&limit=10&status=active" \
  -H "Authorization: Bearer $TOKEN")

TICKETS_STATUS=$?
show_result "Récupération des tickets" "$TICKETS_STATUS" "$TICKETS_RESPONSE"

# 7. Statistiques de génération
echo "7. Statistiques admin..."
STATS_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/admin/sotral/analytics" \
  -H "Authorization: Bearer $TOKEN")

STATS_STATUS=$?
show_result "Statistiques admin" "$STATS_STATUS" "$STATS_RESPONSE"

# Résumé
echo "=== RÉSUMÉ DES TESTS ==="
echo "✅ Connexion admin: OK"
echo "🚌 Lignes SOTRAL: $(echo "$LINES_RESPONSE" | jq '.data | length' 2>/dev/null || echo "N/A")"
echo "🎫 Types de tickets: $(echo "$TICKET_TYPES_RESPONSE" | jq '.data | length' 2>/dev/null || echo "N/A")"
echo "📝 Génération individuelle: $([ $GENERATE_STATUS -eq 0 ] && echo "OK" || echo "ERREUR")"
echo "📦 Génération en lot: $([ $BULK_STATUS -eq 0 ] && echo "OK" || echo "ERREUR")"
echo "📊 Récupération tickets: $([ $TICKETS_STATUS -eq 0 ] && echo "OK" || echo "ERREUR")"
echo "📈 Statistiques: $([ $STATS_STATUS -eq 0 ] && echo "OK" || echo "ERREUR")"
echo ""
echo "🎉 Tests terminés ! Vérifiez les réponses ci-dessus pour plus de détails."