#!/bin/bash

# Script de test pour l'endpoint /sotral/my-tickets

echo "🧪 Test de l'endpoint /sotral/my-tickets"
echo "========================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:7000/api"

# Vérifier si un token est fourni
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  Aucun token fourni${NC}"
    echo "Usage: ./test-history-endpoint.sh <AUTH_TOKEN>"
    echo ""
    echo "Pour obtenir le token :"
    echo "1. Ouvrez l'application mobile"
    echo "2. Allez dans l'onglet Historique"
    echo "3. Cliquez sur 'Vérifier Auth'"
    echo "4. Copiez le token affiché dans les logs"
    echo ""
    exit 1
fi

TOKEN=$1

echo -e "${GREEN}✓${NC} Token reçu (${#TOKEN} caractères)"
echo ""

# Test 1: Vérifier l'authentification
echo "📡 Test 1: Vérification de l'authentification..."
AUTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/auth/me")

HTTP_STATUS=$(echo "$AUTH_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$AUTH_RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Authentification réussie${NC}"
    echo "Utilisateur: $(echo $BODY | jq -r '.user.email // "N/A"')"
    USER_ID=$(echo $BODY | jq -r '.user.id')
    echo "User ID: $USER_ID"
else
    echo -e "${RED}✗ Échec de l'authentification (Status: $HTTP_STATUS)${NC}"
    echo "Réponse: $BODY"
    exit 1
fi

echo ""

# Test 2: Récupérer les tickets de l'utilisateur
echo "📡 Test 2: Récupération des tickets via /sotral/my-tickets..."
TICKETS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/sotral/my-tickets")

HTTP_STATUS=$(echo "$TICKETS_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$TICKETS_RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Requête réussie${NC}"
    TICKET_COUNT=$(echo $BODY | jq -r '.data | length')
    echo "Nombre de tickets: $TICKET_COUNT"
    
    if [ "$TICKET_COUNT" -gt 0 ]; then
        echo ""
        echo "📋 Détails des tickets:"
        echo $BODY | jq -r '.data[] | "  - ID: \(.id) | Ligne: \(.line_id) | Prix: \(.price_paid_fcfa) FCFA | Acheté: \(.purchased_at // "N/A")"'
    else
        echo -e "${YELLOW}⚠️  Aucun ticket trouvé pour cet utilisateur${NC}"
        echo ""
        echo "Vérifications possibles:"
        echo "1. L'utilisateur a-t-il effectué un paiement ?"
        echo "2. Le paiement a-t-il été validé ?"
        echo "3. Le ticket a-t-il été attribué avec le bon user_id ?"
    fi
else
    echo -e "${RED}✗ Échec de la requête (Status: $HTTP_STATUS)${NC}"
    echo "Réponse: $BODY"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Tests terminés${NC}"
