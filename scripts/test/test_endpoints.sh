#!/bin/bash

# Script de test de tous les endpoints pour connexion et inscription
# Génère un email unique pour éviter les conflits

EMAIL="test-$(date +%s)@example.com"
PASSWORD="test123456"

echo "🧪 Test de tous les endpoints pour connexion et inscription"
echo "📧 Email de test: $EMAIL"
echo "🔑 Mot de passe: $PASSWORD"
echo "=================================================="

# Liste des endpoints à tester
ENDPOINTS=(
    "http://localhost:7000"
    "http://127.0.0.1:7000" 
    "http://10.0.2.2:7000"
    "http://192.168.1.184:7000"
    "https://go-j2rr.onrender.com"
    "https://backend-api-production.up.railway.app"
)

# Fonction de test d'un endpoint
test_endpoint() {
    local endpoint=$1
    echo ""
    echo "🔍 Test de: $endpoint"
    echo "----------------------------------------"
    
    # Test 1: Health check
    echo "🏥 Health check..."
    if curl -s -f --max-time 10 "$endpoint/health" > /dev/null 2>&1; then
        echo "✅ Health check: OK"
    else
        echo "❌ Health check: FAILED"
        return 1
    fi
    
    # Test 2: Inscription
    echo "📝 Test inscription..."
    response=$(curl -s -X POST "$endpoint/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"name\":\"Test User\",\"password\":\"$PASSWORD\",\"phone\":\"+22890123456\"}" \
        --max-time 15)
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ Inscription: OK"
    elif echo "$response" | grep -q '"success":false' && echo "$response" | grep -q "Email déjà utilisé"; then
        echo "⚠️  Inscription: EMAIL_EXISTS (normal si déjà testé)"
    else
        echo "❌ Inscription: FAILED"
        echo "   Response: $response"
        return 1
    fi
    
    # Test 3: Connexion (si l'inscription a réussi)
    echo "🔐 Test connexion..."
    login_response=$(curl -s -X POST "$endpoint/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
        --max-time 15)
    
    if echo "$login_response" | grep -q '"success":true'; then
        echo "✅ Connexion: OK"
        # Extraire le token pour les tests suivants
        token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    elif echo "$login_response" | grep -q '"success":false' && echo "$login_response" | grep -q "non vérifié"; then
        echo "⚠️  Connexion: ACCOUNT_NOT_VERIFIED (normal après inscription)"
    else
        echo "❌ Connexion: FAILED"
        echo "   Response: $login_response"
        return 1
    fi
    
    echo "🎉 Endpoint $endpoint: FULLY FUNCTIONAL"
    return 0
}

# Tester chaque endpoint
WORKING_ENDPOINTS=()
FAILED_ENDPOINTS=()

for endpoint in "${ENDPOINTS[@]}"; do
    if test_endpoint "$endpoint"; then
        WORKING_ENDPOINTS+=("$endpoint")
    else
        FAILED_ENDPOINTS+=("$endpoint")
    fi
done

# Résumé
echo ""
echo "=================================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=================================================="
echo "✅ Endpoints fonctionnels (${#WORKING_ENDPOINTS[@]}):"
for endpoint in "${WORKING_ENDPOINTS[@]}"; do
    echo "   • $endpoint"
done

if [ ${#FAILED_ENDPOINTS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Endpoints défaillants (${#FAILED_ENDPOINTS[@]}):"
    for endpoint in "${FAILED_ENDPOINTS[@]}"; do
        echo "   • $endpoint"
    done
fi

echo ""
echo "🎯 Endpoint recommandé: ${WORKING_ENDPOINTS[0]:-'AUCUN'}"
echo "📧 Email de test utilisé: $EMAIL"
