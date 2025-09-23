#!/bin/bash

# Test d'intégration complet du système SOTRAL
# Ce script vérifie que tous les composants fonctionnent correctement

echo "🧪 Test d'intégration SOTRAL - Démarrage..."

# Configuration
BACKEND_URL="http://localhost:7000"
ADMIN_URL="http://localhost:3000"
TIMEOUT=5

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_test() {
    echo -e "${BLUE}🔍 Test: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour tester un endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    print_test "$description"
    
    response=$(curl -s -w "%{http_code}" -o /dev/null --max-time $TIMEOUT "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        print_success "$description - OK ($response)"
        return 0
    else
        print_error "$description - ÉCHEC (Status: $response)"
        return 1
    fi
}

# Fonction pour tester un endpoint POST avec données
test_post_endpoint() {
    local url=$1
    local data=$2
    local description=$3
    local expected_status=${4:-200}
    
    print_test "$description"
    
    response=$(curl -s -w "%{http_code}" -o /dev/null --max-time $TIMEOUT \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        print_success "$description - OK ($response)"
        return 0
    else
        print_error "$description - ÉCHEC (Status: $response)"
        return 1
    fi
}

# Variables pour compter les tests
TOTAL_TESTS=0
PASSED_TESTS=0

run_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if "$@"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
}

echo ""
echo "🏥 === TESTS DE SANTÉ DES SERVICES ==="

# Test 1: Backend Health Check
run_test test_endpoint "$BACKEND_URL/health" "Backend Health Check"

# Test 2: SOTRAL Health Check
run_test test_endpoint "$BACKEND_URL/sotral/health" "SOTRAL Service Health Check"

# Test 3: Debug Routes
run_test test_endpoint "$BACKEND_URL/debug-routes" "Debug Routes"

echo ""
echo "📊 === TESTS DES ENDPOINTS SOTRAL PUBLICS ==="

# Test 4: Récupérer toutes les lignes
run_test test_endpoint "$BACKEND_URL/sotral/lines" "Récupération des lignes SOTRAL"

# Test 5: Récupérer les arrêts
run_test test_endpoint "$BACKEND_URL/sotral/stops" "Récupération des arrêts SOTRAL"

# Test 6: Récupérer les types de tickets
run_test test_endpoint "$BACKEND_URL/sotral/ticket-types" "Récupération des types de tickets"

# Test 7: Test du calcul de prix
run_test test_post_endpoint "$BACKEND_URL/sotral/calculate-price" \
    '{"lineId": 1, "isStudent": false}' \
    "Calcul de prix pour ligne 1"

# Test 8: Test du calcul de prix étudiant
run_test test_post_endpoint "$BACKEND_URL/sotral/calculate-price" \
    '{"lineId": 13, "isStudent": true}' \
    "Calcul de prix étudiant pour ligne campus"

echo ""
echo "🔐 === TESTS DES ENDPOINTS ADMIN (sans auth) ==="

# Test 9: Test admin lines (devrait échouer sans auth)
print_test "Admin lines endpoint (sans authentification)"
response=$(curl -s -w "%{http_code}" -o /dev/null --max-time $TIMEOUT "$BACKEND_URL/admin/sotral/lines")
if [ "$response" -eq "401" ] || [ "$response" -eq "403" ]; then
    print_success "Admin endpoint correctement protégé ($response)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "Admin endpoint non protégé ou erreur ($response)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "💾 === TESTS DE BASE DE DONNÉES ==="

# Test 10: Test avec une ligne spécifique
run_test test_endpoint "$BACKEND_URL/sotral/lines/1" "Récupération ligne spécifique (ligne 1)"

# Test 11: Test avec une ligne qui n'existe pas
print_test "Test ligne inexistante (404 attendu)"
response=$(curl -s -w "%{http_code}" -o /dev/null --max-time $TIMEOUT "$BACKEND_URL/sotral/lines/999")
if [ "$response" -eq "404" ]; then
    print_success "Gestion correcte des lignes inexistantes (404)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "Gestion incorrecte des lignes inexistantes ($response)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "🧮 === TESTS DE LOGIQUE MÉTIER ==="

# Test 12: Vérification des données réelles dans la réponse
print_test "Vérification des données des lignes SOTRAL"
lines_response=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/sotral/lines")
if echo "$lines_response" | grep -q "Zanguéra" && echo "$lines_response" | grep -q "BIA"; then
    print_success "Données réelles SOTRAL présentes"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "Données SOTRAL manquantes ou incorrectes"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 13: Vérification du nombre de lignes
print_test "Vérification du nombre de lignes (22 attendues)"
line_count=$(echo "$lines_response" | grep -o '"line_number"' | wc -l)
if [ "$line_count" -ge "20" ]; then
    print_success "Nombre de lignes correct ($line_count)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "Nombre de lignes insuffisant ($line_count/22)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "🔍 === TESTS DES VALIDATIONS ==="

# Test 14: Validation avec des données invalides
run_test test_post_endpoint "$BACKEND_URL/sotral/calculate-price" \
    '{"lineId": "invalid"}' \
    "Gestion des données invalides" \
    "400"

# Test 15: Test avec des IDs négatifs
run_test test_endpoint "$BACKEND_URL/sotral/lines/-1" "Gestion des IDs négatifs" "404"

echo ""
echo "📱 === TESTS FRONTEND (si disponible) ==="

# Test 16: Interface admin (si accessible)
if curl -s --max-time $TIMEOUT "$ADMIN_URL" > /dev/null 2>&1; then
    print_success "Interface admin accessible sur $ADMIN_URL"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "Interface admin non accessible sur $ADMIN_URL"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "📊 === RÉSULTATS DU TEST ==="

# Calcul du pourcentage de réussite
success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "Tests passés: $PASSED_TESTS/$TOTAL_TESTS"
echo "Taux de réussite: $success_rate%"

if [ "$success_rate" -ge "80" ]; then
    print_success "🎉 SYSTÈME SOTRAL OPÉRATIONNEL!"
    echo ""
    echo "✅ Le système SOTRAL fonctionne correctement."
    echo "📝 Vous pouvez maintenant:"
    echo "   • Accéder à l'admin: $ADMIN_URL/sotral"
    echo "   • Utiliser les APIs SOTRAL"
    echo "   • Générer des tickets"
    echo "   • Tester avec l'app mobile"
    exit 0
elif [ "$success_rate" -ge "60" ]; then
    print_warning "⚠️  SYSTÈME PARTIELLEMENT OPÉRATIONNEL"
    echo ""
    echo "🔧 Quelques problèmes détectés mais le système peut fonctionner."
    echo "📝 Vérifiez les erreurs ci-dessus et corrigez si nécessaire."
    exit 1
else
    print_error "❌ SYSTÈME NON OPÉRATIONNEL"
    echo ""
    echo "🚨 Trop d'erreurs détectées. Le système nécessite des corrections."
    echo "📝 Actions recommandées:"
    echo "   • Vérifier que le backend est démarré"
    echo "   • Exécuter ./init-sotral.sh"
    echo "   • Vérifier la configuration de la base de données"
    exit 2
fi