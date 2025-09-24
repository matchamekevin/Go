#!/bin/bash

# Couleurs pour améliorer la lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="https://go-j2rr.onrender.com"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}= TEST DES ENDPOINTS PROBLÉMATIQUES =${NC}"
echo -e "${BLUE}=====================================${NC}"

# 1. Obtenir le token admin
echo -e "\n${BLUE}=== OBTENTION DU TOKEN ADMIN ===${NC}"
ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gosotral.com", "password": "admin123"}')

echo "Admin login response: $ADMIN_RESPONSE"

# Extraire le token
TOKEN=$(echo "$ADMIN_RESPONSE" | python3 -c "
import json
import sys
try:
    data = json.load(sys.stdin)
    print(data['data']['token'])
except:
    print('ERROR_EXTRACTING_TOKEN')
")

if [ "$TOKEN" = "ERROR_EXTRACTING_TOKEN" ]; then
    echo -e "${RED}❌ Impossible d'extraire le token admin${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtenu: ${TOKEN:0:50}...${NC}"

# 2. Tester les utilisateurs - obtenir la liste d'abord
echo -e "\n${BLUE}=== TEST DES UTILISATEURS ===${NC}"
USERS_RESPONSE=$(curl -s -X GET "$API_BASE/admin/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Users response: $USERS_RESPONSE"

# 3. Tester les lignes SOTRAL - obtenir la liste d'abord
echo -e "\n${BLUE}=== TEST DES LIGNES SOTRAL ===${NC}"
LINES_RESPONSE=$(curl -s -X GET "$API_BASE/admin/sotral/lines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Lines response: $LINES_RESPONSE"

# 4. Tester les tickets - obtenir la liste d'abord
echo -e "\n${BLUE}=== TEST DES TICKETS ===${NC}"
TICKETS_RESPONSE=$(curl -s -X GET "$API_BASE/admin/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Tickets response: $TICKETS_RESPONSE"

# 5. Test de suppression de tickets (avec des IDs factices pour voir l'erreur)
echo -e "\n${BLUE}=== TEST SUPPRESSION TICKETS ===${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/admin/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": [999, 998, 997]}')

echo "Delete tickets response: $DELETE_RESPONSE"

echo -e "\n${BLUE}=== TESTS TERMINÉS ===${NC}"