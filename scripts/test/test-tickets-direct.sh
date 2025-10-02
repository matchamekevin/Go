#!/bin/bash

# Couleurs pour améliorer la lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Tester les endpoints publics de l'API des tickets
echo -e "${BLUE}=== TEST: Récupération des produits de tickets ===${NC}"
curl -s http://localhost:7000/tickets/products | python -m json.tool

echo -e "\n${BLUE}=== TEST: Récupération des trajets disponibles ===${NC}"
curl -s http://localhost:7000/tickets/routes | python -m json.tool

echo -e "\n${BLUE}=== TEST: Récupération des trajets de catégorie T100 ===${NC}"
curl -s http://localhost:7000/tickets/routes/category/T100 | python -m json.tool

echo -e "\n${BLUE}=== TESTS TERMINÉS ===${NC}"
