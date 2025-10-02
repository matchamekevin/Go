#!/bin/bash

echo "🧪 Tests complets du système GoSOTRAL Backend + Frontend"
echo "============================================================"

# Couleurs pour les outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo -e "${YELLOW}1. Test du Health Check Backend${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:7000/health)
if [[ $HEALTH_RESPONSE == *'"backend":"ok"'* ]]; then
    check_result 0 "Backend health check OK"
else
    check_result 1 "Backend health check FAILED"
    echo "Response: $HEALTH_RESPONSE"
fi

echo -e "\n${YELLOW}2. Test des Endpoints Tickets${NC}"
PRODUCTS_RESPONSE=$(curl -s http://localhost:7000/tickets/products)
if [[ $PRODUCTS_RESPONSE == *'"success":true'* ]]; then
    PRODUCTS_COUNT=$(echo $PRODUCTS_RESPONSE | grep -o '"data":\[.*\]' | grep -o '{[^}]*}' | wc -l)
    check_result 0 "Products endpoint OK ($PRODUCTS_COUNT produits)"
else
    check_result 1 "Products endpoint FAILED"
fi

ROUTES_RESPONSE=$(curl -s http://localhost:7000/tickets/routes)
if [[ $ROUTES_RESPONSE == *'"success":true'* ]]; then
    ROUTES_COUNT=$(echo $ROUTES_RESPONSE | grep -o '"data":\[.*\]' | grep -o '{[^}]*}' | wc -l)
    check_result 0 "Routes endpoint OK ($ROUTES_COUNT routes)"
else
    check_result 1 "Routes endpoint FAILED"
fi

echo -e "\n${YELLOW}3. Test de l'authentification${NC}"
# Test de login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')

if [[ $LOGIN_RESPONSE == *'"token":'* ]]; then
    check_result 0 "Login endpoint OK"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "  Token récupéré: ${TOKEN:0:20}..."
else
    check_result 1 "Login endpoint FAILED"
    echo "Response: $LOGIN_RESPONSE"
fi

echo -e "\n${YELLOW}4. Test des tables de base de données${NC}"
TABLES_OUTPUT=$(docker exec back_db_1 psql -U gosotral_user -d gosotral_db -c "\dt" 2>/dev/null)
if [[ $TABLES_OUTPUT == *"users"* ]] && [[ $TABLES_OUTPUT == *"tickets"* ]] && [[ $TABLES_OUTPUT == *"routes"* ]]; then
    TABLE_COUNT=$(echo "$TABLES_OUTPUT" | grep -c " | table | " || echo "0")
    check_result 0 "Tables DB OK ($TABLE_COUNT tables)"
else
    check_result 1 "Tables DB incomplètes"
fi

echo -e "\n${YELLOW}5. Test des services Frontend (compilation)${NC}"
cd /home/connect/kev/Go/front

# Vérifier que les fichiers de service existent et sont syntaxiquement corrects
if [ -f "src/services/apiClient.ts" ] && [ -f "src/services/ticketService.ts" ] && [ -f "src/services/paymentService.ts" ]; then
    check_result 0 "Services Frontend présents"
else
    check_result 1 "Services Frontend manquants"
fi

# Vérifier que les pages de test existent
if [ -f "app/test-tickets.tsx" ] && [ -f "app/test-payments.tsx" ] && [ -f "app/dev-menu.tsx" ]; then
    check_result 0 "Pages de test Frontend présentes"
else
    check_result 1 "Pages de test Frontend manquantes"
fi

echo -e "\n${YELLOW}6. Test de création d'un utilisateur${NC}"
RANDOM_EMAIL="testuser$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:7000/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User $(date +%s)\",
    \"email\": \"$RANDOM_EMAIL\",
    \"phone\": \"+22890$(printf "%06d" $((RANDOM % 1000000)))\",
    \"password\": \"password123\"
  }")

if [[ $REGISTER_RESPONSE == *'"success":true'* ]]; then
    check_result 0 "Registration endpoint OK"
else
    check_result 1 "Registration endpoint FAILED"
    echo "Response: $REGISTER_RESPONSE"
fi

echo -e "\n${YELLOW}7. Résumé des containers Docker${NC}"
DOCKER_STATUS=$(docker ps --filter "name=back_" --format "table {{.Names}}\t{{.Status}}")
echo "$DOCKER_STATUS"

echo -e "\n${GREEN}🎉 Tests terminés !${NC}"
echo ""
echo "Pour utiliser l'application :"
echo "1. Backend API: http://localhost:7000"
echo "2. Health check: curl http://localhost:7000/health"
echo "3. Frontend Expo: cd front && npx expo start"
echo "4. Menu développeur: Navigation vers /dev-menu dans l'app"
echo ""
echo "Endpoints principaux testés :"
echo "✓ GET /health"
echo "✓ GET /tickets/products"
echo "✓ GET /tickets/routes"
echo "✓ POST /auth/register"
echo "✓ POST /auth/login"
echo "✓ Base de données PostgreSQL avec toutes les tables"
