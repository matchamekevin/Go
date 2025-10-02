#!/bin/bash

# Script de diagnostic complet pour l'historique des tickets

echo "🔍 DIAGNOSTIC COMPLET - HISTORIQUE DES TICKETS"
echo "=============================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:7000/api"
DB_NAME="gosotral_db"

echo -e "${BLUE}📋 Étape 1: Vérification de la base de données${NC}"
echo "------------------------------------------------"

# Demander le user_id
read -p "Entrez le user_id (ou appuyez sur Entrée pour utiliser 1): " USER_ID
USER_ID=${USER_ID:-1}

echo "User ID utilisé: $USER_ID"
echo ""

# Vérifier les tickets dans la base de données
echo -e "${YELLOW}🔍 Recherche des tickets pour user_id = $USER_ID...${NC}"

# Connexion à la base de données PostgreSQL
PGPASSWORD="Ps33lqNo85kEjLVgosFFxcWsCsnt3z3W" psql \
  -h dpg-d305h0mr433s73euqgfg-a.oregon-postgres.render.com \
  -p 5432 \
  -U gosotral_user \
  -d gosotral_db \
  -c "SELECT id, ticket_code, user_id, line_id, price_paid_fcfa, status, purchased_at, trips_remaining FROM sotral_tickets WHERE user_id = $USER_ID ORDER BY purchased_at DESC LIMIT 10;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Connexion à la base de données réussie${NC}"
else
    echo -e "${RED}✗ Erreur de connexion à la base de données${NC}"
    echo "Vérifiez les credentials de connexion"
fi

echo ""
echo -e "${BLUE}📋 Étape 2: Vérification du token d'authentification${NC}"
echo "------------------------------------------------"

# Demander le token
read -p "Entrez votre token d'authentification (copiez depuis l'app): " TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Aucun token fourni${NC}"
    echo ""
    echo "Pour obtenir le token:"
    echo "1. Ouvrez l'application mobile"
    echo "2. Allez dans Historique"
    echo "3. Cliquez sur 'Vérifier Auth'"
    echo "4. Copiez le token depuis les logs"
    exit 1
fi

echo -e "${GREEN}✓ Token reçu (${#TOKEN} caractères)${NC}"
echo ""

echo -e "${BLUE}📋 Étape 3: Test de l'endpoint /auth/me${NC}"
echo "------------------------------------------------"

AUTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/auth/me")

HTTP_STATUS=$(echo "$AUTH_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$AUTH_RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Authentification réussie${NC}"
    API_USER_ID=$(echo $BODY | jq -r '.user.id')
    API_USER_EMAIL=$(echo $BODY | jq -r '.user.email')
    echo "  User ID API: $API_USER_ID"
    echo "  Email: $API_USER_EMAIL"
    
    if [ "$API_USER_ID" != "$USER_ID" ]; then
        echo -e "${YELLOW}⚠️  Le user_id de l'API ($API_USER_ID) est différent de celui cherché dans la BDD ($USER_ID)${NC}"
        echo "  Voulez-vous utiliser $API_USER_ID pour la suite? (o/n)"
        read -r RESPONSE
        if [ "$RESPONSE" = "o" ]; then
            USER_ID=$API_USER_ID
            echo "  User ID mis à jour: $USER_ID"
        fi
    fi
else
    echo -e "${RED}✗ Échec de l'authentification (Status: $HTTP_STATUS)${NC}"
    echo "Réponse: $BODY"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Étape 4: Test de l'endpoint /sotral/my-tickets${NC}"
echo "------------------------------------------------"

TICKETS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/sotral/my-tickets")

HTTP_STATUS=$(echo "$TICKETS_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$TICKETS_RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')

echo "Status HTTP: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Requête réussie${NC}"
    
    # Sauvegarder la réponse dans un fichier pour analyse
    echo "$BODY" > /tmp/sotral_tickets_response.json
    echo "Réponse sauvegardée dans: /tmp/sotral_tickets_response.json"
    echo ""
    
    TICKET_COUNT=$(echo $BODY | jq -r '.data | length')
    echo "Nombre de tickets retournés: $TICKET_COUNT"
    
    if [ "$TICKET_COUNT" -gt 0 ]; then
        echo ""
        echo -e "${GREEN}✅ TICKETS TROUVÉS !${NC}"
        echo ""
        echo "📋 Détails des tickets:"
        echo "$BODY" | jq -r '.data[] | "────────────────────────────────────\n  ID: \(.id)\n  Code: \(.ticket_code)\n  Ligne: \(.line_id) - \(.line_name // "N/A")\n  Type: \(.ticket_type_name // "N/A")\n  Prix: \(.price_paid_fcfa) FCFA\n  Status: \(.status)\n  Acheté: \(.purchased_at // "N/A")\n  Trajets restants: \(.trips_remaining)\n  User ID: \(.user_id)"'
        echo "────────────────────────────────────"
        echo ""
        echo -e "${YELLOW}💡 Les tickets sont bien dans la base et l'API les retourne.${NC}"
        echo -e "${YELLOW}   Le problème vient probablement du frontend (transformation des données).${NC}"
        echo ""
        echo "Vérifiez les logs dans l'application mobile:"
        echo "  [UserTicketService] Réponse API reçue"
        echo "  [History] ✅ Données reçues"
    else
        echo ""
        echo -e "${YELLOW}⚠️  AUCUN TICKET RETOURNÉ${NC}"
        echo ""
        echo "Raisons possibles:"
        echo "  1. Aucun ticket n'a été acheté pour ce user_id ($USER_ID)"
        echo "  2. Les tickets existent mais n'ont pas de purchased_at"
        echo "  3. Le user_id n'est pas correctement attribué lors du paiement"
        echo ""
        echo "Vérification dans la base de données..."
        
        # Compter les tickets dans la BDD
        PGPASSWORD="Ps33lqNo85kEjLVgosFFxcWsCsnt3z3W" psql \
          -h dpg-d305h0mr433s73euqgfg-a.oregon-postgres.render.com \
          -p 5432 \
          -U gosotral_user \
          -d gosotral_db \
          -t -c "SELECT COUNT(*) FROM sotral_tickets WHERE user_id = $USER_ID;" 2>/dev/null | xargs
        
        DB_COUNT=$?
        echo ""
        echo "Pour créer un ticket de test, utilisez l'interface admin:"
        echo "  http://localhost:5173 (si admin est lancé)"
    fi
else
    echo -e "${RED}✗ Échec de la requête (Status: $HTTP_STATUS)${NC}"
    echo "Réponse brute:"
    echo "$BODY"
    echo ""
    echo "Erreur possible:"
    if [ "$HTTP_STATUS" = "401" ]; then
        echo "  - Token invalide ou expiré"
        echo "  - Middleware d'authentification non configuré"
    elif [ "$HTTP_STATUS" = "404" ]; then
        echo "  - Endpoint /sotral/my-tickets non trouvé"
        echo "  - Backend pas redémarré après les modifications"
    elif [ "$HTTP_STATUS" = "500" ]; then
        echo "  - Erreur serveur"
        echo "  - Vérifiez les logs du backend"
    fi
fi

echo ""
echo -e "${BLUE}📋 Étape 5: Analyse des données retournées${NC}"
echo "------------------------------------------------"

if [ -f "/tmp/sotral_tickets_response.json" ]; then
    echo "Structure des données:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    # Vérifier les champs importants
    echo "Vérification des champs requis pour l'historique:"
    echo "$BODY" | jq -r '.data[0] | "  ✓ id: \(.id)\n  ✓ line_name: \(.line_name // "MANQUANT ❌")\n  ✓ ticket_type_name: \(.ticket_type_name // "MANQUANT ❌")\n  ✓ price_paid_fcfa: \(.price_paid_fcfa)\n  ✓ purchased_at: \(.purchased_at // "MANQUANT ❌")\n  ✓ qr_code: \(.qr_code[0:20])..."' 2>/dev/null
else
    echo "Aucune donnée à analyser"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ DIAGNOSTIC TERMINÉ${NC}"
echo "=============================================="
echo ""
echo "📝 Prochaines étapes selon le diagnostic:"
echo ""
echo "1. Si des tickets sont retournés mais pas affichés dans l'app:"
echo "   → Problème de transformation des données dans userTicketService.ts"
echo "   → Vérifiez les logs [History] dans l'app mobile"
echo ""
echo "2. Si aucun ticket n'est retourné:"
echo "   → Vérifiez que le paiement attribue bien le user_id au ticket"
echo "   → Testez l'achat d'un ticket via l'app"
echo ""
echo "3. Si erreur 401:"
echo "   → Token expiré, reconnectez-vous"
echo ""
echo "4. Si erreur 404:"
echo "   → Redémarrez le backend: cd back && npm run dev"
