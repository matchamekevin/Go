#!/bin/bash

# Script de test de l'API SOTRAL
echo "🚌 Test de l'API SOTRAL - Système de transport de Lomé"
echo "=================================================="

BASE_URL="http://localhost:7000"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "\n${YELLOW}Testing:${NC} $description"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ SUCCESS${NC} (HTTP $http_code)"
        echo "Response: $(echo "$body" | head -c 200)..."
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "Error: $body"
    fi
}

echo -e "\n${YELLOW}1. Health Check${NC}"
test_endpoint "GET" "/sotral/health" "Service health check"

echo -e "\n${YELLOW}2. Lignes SOTRAL${NC}"
test_endpoint "GET" "/sotral/lines" "Récupérer toutes les lignes"

echo -e "\n${YELLOW}3. Types de tickets${NC}"
test_endpoint "GET" "/sotral/ticket-types" "Récupérer les types de tickets"

echo -e "\n${YELLOW}4. Zones de tarification${NC}"
test_endpoint "GET" "/sotral/pricing-zones" "Récupérer les zones de tarification"

echo -e "\n${YELLOW}5. Calcul de prix${NC}"
test_endpoint "GET" "/sotral/calculate-price?ticket_type_id=1&is_student=false" "Calculer le prix d'un ticket"

echo -e "\n${YELLOW}6. Achat de ticket (simulation)${NC}"
purchase_data='{
    "ticket_type_id": 1,
    "line_id": 1,
    "payment_method": "mobile_money",
    "payment_phone": "+22890123456"
}'
test_endpoint "POST" "/sotral/purchase" "Acheter un ticket" "$purchase_data"

echo -e "\n${YELLOW}7. Validation de ticket (simulation avec QR fictif)${NC}"
validation_data='{
    "qr_code": "SOTRAL_TICKET:TEST123456:999999999999",
    "scanner_location": {
        "latitude": 6.1319,
        "longitude": 1.2228
    }
}'
test_endpoint "POST" "/sotral/validate" "Valider un ticket QR" "$validation_data"

echo -e "\n=================================================="
echo "🏁 Tests terminés !"
echo -e "Pour démarrer le serveur: ${GREEN}cd /home/connect/kev/Go/back && npm run dev${NC}"
echo -e "Pour démarrer l'admin: ${GREEN}cd /home/connect/kev/Go/admin && npm run dev${NC}"
echo "=================================================="