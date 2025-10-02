#!/bin/bash

# Test des endpoints OTP pour diagnostiquer le problème
# Couleurs pour améliorer la lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="https://go-j2rr.onrender.com"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}= TEST DES ENDPOINTS OTP =${NC}"
echo -e "${BLUE}=====================================${NC}"

# Générer un email de test unique
TEST_EMAIL="testotp$(date +%s)@example.com"
TEST_PASSWORD="password123"
TEST_NAME="Test OTP User"
TEST_PHONE="+22890000000"

echo -e "\n${YELLOW}1. Test d'inscription${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"phone\": \"$TEST_PHONE\"
  }")

echo "Register response: $REGISTER_RESPONSE"

# Vérifier si l'inscription a réussi
if [[ $REGISTER_RESPONSE == *'"success":true'* ]]; then
    echo -e "${GREEN}✅ Inscription réussie pour $TEST_EMAIL${NC}"
else
    echo -e "${RED}❌ Échec de l'inscription${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

echo -e "\n${YELLOW}2. Test de renvoi OTP${NC}"
RESEND_RESPONSE=$(curl -s -X POST "$API_BASE/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

echo "Resend OTP response: $RESEND_RESPONSE"

if [[ $RESEND_RESPONSE == *'"success":true'* ]]; then
    echo -e "${GREEN}✅ Renvoi OTP réussi${NC}"
else
    echo -e "${RED}❌ Échec du renvoi OTP${NC}"
    echo "Response: $RESEND_RESPONSE"
fi

echo -e "\n${YELLOW}3. Test de vérification OTP avec code invalide${NC}"
VERIFY_RESPONSE=$(curl -s -X POST "$API_BASE/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"otp\": \"000000\"}")

echo "Verify OTP response: $VERIFY_RESPONSE"

if [[ $VERIFY_RESPONSE == *'"success":false'* ]] || [[ $VERIFY_RESPONSE == *'OTP invalide'* ]]; then
    echo -e "${GREEN}✅ Endpoint de vérification OTP répond correctement${NC}"
else
    echo -e "${RED}❌ Problème avec l'endpoint de vérification OTP${NC}"
    echo "Response: $VERIFY_RESPONSE"
fi

echo -e "\n${YELLOW}4. Test avec un email inexistant${NC}"
INVALID_RESEND=$(curl -s -X POST "$API_BASE/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"nonexistent@example.com\"}")

echo "Invalid email resend response: $INVALID_RESEND"

echo -e "\n${BLUE}=== RÉSULTATS ===${NC}"
echo "Email de test utilisé: $TEST_EMAIL"
echo "Vérifiez vos emails et les logs du serveur pour confirmer l'envoi"
echo ""
echo "Si les emails ne sont pas reçus:"
echo "1. Vérifiez la configuration SMTP dans les variables d'environnement"
echo "2. Consultez les logs du serveur pour les erreurs d'envoi"
echo "3. Testez avec un email réel pour confirmer"