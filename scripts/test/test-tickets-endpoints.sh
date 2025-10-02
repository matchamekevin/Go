#!/bin/bash

# Couleurs pour améliorer la lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:7000"
USER_TOKEN=""
ADMIN_TOKEN=""

# Fonction pour afficher les messages de test
test_endpoint() {
    method=$1
    endpoint=$2
    payload=$3
    description=$4
    token=$5
    
    echo -e "\n${BLUE}=== TEST: $description ===${NC}"
    echo -e "${YELLOW}$method $endpoint${NC}"
    
    if [ -n "$payload" ]; then
        echo -e "Payload: $payload"
    fi
    
    if [ -n "$token" ]; then
        echo -e "Using Authorization: Bearer $token"
    fi
    
    # Construire la commande curl
    cmd="curl -s -w \"\\n%{http_code}\" -X $method \"$API_BASE$endpoint\" -H \"Content-Type: application/json\""
    
    if [ -n "$token" ]; then
        cmd="$cmd -H \"Authorization: Bearer $token\""
    fi
    
    if [ -n "$payload" ]; then
        cmd="$cmd -d '$payload'"
    fi
    
    # Exécuter la commande curl
    response=$(eval $cmd)
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    # Formatage de la réponse JSON pour une meilleure lisibilité
    if [[ "$response_body" == \{* ]] || [[ "$response_body" == \[* ]]; then
        response_body=$(echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body")
    fi
    
    echo -e "Status: $status_code"
    echo -e "Response: $response_body"
    
    # Vérifier si le statut est dans les 200
    if [[ $status_code -ge 200 ]] && [[ $status_code -lt 300 ]]; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    # Stocker les jetons pour les tests d'authentification
    if [[ "$endpoint" == "/auth/login" ]] || [[ "$endpoint" == "/auth/admin/login" ]]; then
        if [[ $status_code -ge 200 ]] && [[ $status_code -lt 300 ]]; then
            token=$(echo "$response_body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
            if [[ "$endpoint" == "/auth/login" ]]; then
                USER_TOKEN=$token
                echo "User token: $USER_TOKEN"
                export USER_TOKEN
            else
                ADMIN_TOKEN=$token
                echo "Admin token: $ADMIN_TOKEN"
                export ADMIN_TOKEN
            fi
        fi
    fi
}

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}= TEST DES ENDPOINTS DE TICKETS    =${NC}"
echo -e "${BLUE}=====================================${NC}"

# Obtenir le token admin d'abord
test_endpoint "POST" "/auth/admin/login" '{
    "email": "admin@example.com",
    "password": "password123"
}' "Connexion admin"

# 1. Tester l'obtention des produits de tickets (public)
test_endpoint "GET" "/tickets/products" "" "Obtenir tous les produits de tickets"

# 1.1 Tester l'obtention des trajets (public)
test_endpoint "GET" "/tickets/routes" "" "Obtenir tous les trajets disponibles"

# 1.2 Tester l'obtention des trajets par catégorie de prix (public)
test_endpoint "GET" "/tickets/routes/category/T100" "" "Obtenir les trajets de catégorie T100"

# 2. Essayer d'acheter un ticket sans authentification (doit échouer)
test_endpoint "POST" "/tickets/purchase" '{
    "product_code": "T100",
    "route_code": "ADIDO-BE",
    "quantity": 1,
    "purchase_method": "mobile_money",
    "payment_details": {
        "phone": "+22890123456",
        "operator": "togocom"
    }
}' "Acheter un ticket sans authentification (doit échouer)"

# 3. Acheter un ticket avec authentification admin
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "POST" "/tickets/purchase" '{
        "product_code": "T100",
        "route_code": "ADIDO-BE",
        "quantity": 1,
        "purchase_method": "mobile_money",
        "payment_details": {
            "phone": "+22890123456",
            "operator": "togocom"
        }
    }' "Acheter un ticket avec authentification admin" "$ADMIN_TOKEN"
fi

# 4. Obtenir les tickets de l'utilisateur
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/tickets/my-tickets" "" "Obtenir les tickets de l'utilisateur" "$ADMIN_TOKEN"
fi

# 5. Obtenir les statistiques de tickets (admin uniquement)
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/tickets/stats" "" "Obtenir les statistiques de tickets (admin uniquement)" "$ADMIN_TOKEN"
fi

echo -e "\n${BLUE}=== TESTS TERMINÉS ===${NC}"
