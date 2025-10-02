#!/bin/bash

# Couleurs pour améliorer la lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="https://go-j2rr.onrender.com"

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}= TEST DES ENDPOINTS PROBLÉMATIQUES SPÉCIFIQUES =${NC}"
echo -e "${BLUE}===========================================${NC}"

# 1. Obtenir le token admin
echo -e "\n${BLUE}=== OBTENTION DU TOKEN ADMIN ===${NC}"
ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gosotral.com", "password": "admin123"}')

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

echo -e "${GREEN}✅ Token obtenu${NC}"

# 2. Test des différentes variantes de suspension d'utilisateur
echo -e "\n${BLUE}=== TEST SUSPENSION UTILISATEUR (ID 17) ===${NC}"

echo -e "\n${YELLOW}Test 1: PATCH /admin/users/17/toggle-suspension${NC}"
curl -s -X PATCH "$API_BASE/admin/users/17/toggle-suspension" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n"

echo -e "\n${YELLOW}Test 2: POST /admin/users/17/toggle-suspension${NC}"
curl -s -X POST "$API_BASE/admin/users/17/toggle-suspension" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n"

# 3. Test de suspension de ligne SOTRAL
echo -e "\n${BLUE}=== TEST SUSPENSION LIGNE SOTRAL (ID 6) ===${NC}"

echo -e "\n${YELLOW}Test: POST /admin/sotral/lines/6/toggle-status${NC}"
curl -s -X POST "$API_BASE/admin/sotral/lines/6/toggle-status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n"

# 4. Test de récupération des tickets
echo -e "\n${BLUE}=== TEST RÉCUPÉRATION TICKETS ===${NC}"

echo -e "\n${YELLOW}Test: GET /admin/tickets${NC}"
curl -s -X GET "$API_BASE/admin/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n"

# 5. Test de suppression des tickets
echo -e "\n${BLUE}=== TEST SUPPRESSION TICKETS ===${NC}"

echo -e "\n${YELLOW}Test: DELETE /admin/tickets avec IDs fictifs${NC}"
curl -s -X DELETE "$API_BASE/admin/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": [999, 998, 997]}' \
  -w "\nStatus Code: %{http_code}\n"

echo -e "\n${BLUE}=== TESTS TERMINÉS ===${NC}"