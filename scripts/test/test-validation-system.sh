#!/bin/bash

# Test du système de validation avec historique
echo "🎫 Test du système de validation SOTRAL avec historique"
echo ""

# Variables
API_URL="https://go-j2rr.onrender.com"
TICKET_CODE="SOT17594876421928092"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzAsImVtYWlsIjoidmFsaWRhdG9yQHRlc3QuY29tIiwibmFtZSI6IlZhbGlkYXRvciBUZXN0Iiwicm9sZSI6InZhbGlkYXRvciIsImlhdCI6MTc1OTQ4NjA3MiwiZXhwIjoxNzYwMDkwODcyfQ.OZ8PyElEljKBixXkZ-IIHB0W9T6mi2QLHhJtDJqUxJA"

echo "📊 1. Vérification du statut du backend..."
curl -s "$API_URL/health" | jq '.'
echo ""

echo "🎫 2. Tentative de validation du ticket: $TICKET_CODE"
VALIDATION_RESULT=$(curl -s -X POST "$API_URL/tickets/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"ticket_code\": \"$TICKET_CODE\"}")

echo "Résultat de la validation:"
echo $VALIDATION_RESULT | jq '.'
echo ""

echo "📋 3. Récupération de l'historique de validation..."
HISTORY_RESULT=$(curl -s -X GET "$API_URL/tickets/my-validation-history" \
  -H "Authorization: Bearer $TOKEN")

echo "Historique des validations:"
echo $HISTORY_RESULT | jq '.data[0:3]' # Afficher les 3 premières entrées
echo ""

echo "📈 4. Statistiques de validation (admin)..."
STATS_RESULT=$(curl -s -X GET "$API_URL/tickets/validation-stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Statistiques:"
echo $STATS_RESULT | jq '.'
echo ""

echo "✅ Test terminé!"