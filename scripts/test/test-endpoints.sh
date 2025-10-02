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
echo -e "${BLUE}= TEST DE TOUS LES ENDPOINTS API   =${NC}"
echo -e "${BLUE}=====================================${NC}"

# Attendre que le serveur soit prêt
echo "Attente du démarrage du serveur..."
sleep 5

# Tester l'endpoint racine
test_endpoint "GET" "/" "" "Endpoint racine"

# Tests des endpoints d'authentification
echo -e "\n${BLUE}=== TESTS D'AUTHENTIFICATION ===${NC}"

# Inscription
test_endpoint "POST" "/auth/register" '{
    "email": "test2@example.com",
    "name": "Test User 2",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "phone": "+2289222222"
}' "Inscription utilisateur"

# Connexion
test_endpoint "POST" "/auth/login" '{
    "email": "test4@example.com",
    "password": "Password123"
}' "Connexion utilisateur"

# Connexion admin (utilisant les identifiants d'environnement)
test_endpoint "POST" "/auth/admin/login" '{
    "email": "ton-admin@example.com",
    "password": "ton_mot_de_passe_admin"
}' "Connexion admin"

# Tests des endpoints utilisateurs
echo -e "\n${BLUE}=== TESTS DES ENDPOINTS UTILISATEURS ===${NC}"

# Obtenir le profil utilisateur sans token (devrait échouer)
test_endpoint "GET" "/users/profile" "" "Obtenir le profil utilisateur (sans token, devrait échouer)"

# Obtenir le profil utilisateur avec token
if [ -n "$USER_TOKEN" ]; then
    test_endpoint "GET" "/users/profile" "" "Obtenir le profil utilisateur (avec token)" "$USER_TOKEN"
fi

# Tests des endpoints de paiement
echo -e "\n${BLUE}=== TESTS DES ENDPOINTS DE PAIEMENT ===${NC}"

# Obtenir le placeholder des paiements
test_endpoint "GET" "/payment/placeholder" "" "Obtenir le placeholder des paiements (sans token, devrait échouer)"

# Obtenir le placeholder des paiements avec token admin
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/payment/placeholder" "" "Obtenir le placeholder des paiements (avec token admin)" "$ADMIN_TOKEN"
fi

echo -e "\n${BLUE}=== TESTS TERMINÉS ===${NC}"
