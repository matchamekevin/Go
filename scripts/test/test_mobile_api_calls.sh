#!/bin/bash

echo "=== Test des appels API mobiles ==="

BASE_URL="http://localhost:7000"

# 1. Test de récupération des tickets disponibles (comme dans search.tsx)
echo "1. Test SotralMobileService.getGeneratedTickets()"
TICKETS_RESPONSE=$(curl -s "$BASE_URL/sotral/generated-tickets")
if echo "$TICKETS_RESPONSE" | grep -q '"success":true'; then
    COUNT=$(echo "$TICKETS_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "✅ Tickets disponibles: $COUNT"
    
    # Vérifier que les données nécessaires sont présentes
    HAS_PRICE=$(echo "$TICKETS_RESPONSE" | grep -c '"price_paid_fcfa":[0-9]')
    HAS_CODE=$(echo "$TICKETS_RESPONSE" | grep -c '"ticket_code":')
    HAS_QR=$(echo "$TICKETS_RESPONSE" | grep -c '"qr_code":')
    HAS_LINE=$(echo "$TICKETS_RESPONSE" | grep -c '"line":')
    
    echo "Prix présents: $HAS_PRICE, Codes: $HAS_CODE, QR: $HAS_QR, Lignes: $HAS_LINE"
    
    # Afficher un exemple de ticket
    echo "Exemple de ticket:"
    echo "$TICKETS_RESPONSE" | jq '.data[0] | {id, ticket_code, price_paid_fcfa, line}' 2>/dev/null || echo "Erreur parsing"
else
    echo "❌ Erreur récupération tickets: $(echo "$TICKETS_RESPONSE" | head -1)"
fi

echo ""

# 2. Test de récupération des lignes pour la recherche (comme dans SearchService)
echo "2. Test SearchService.searchRoutes() - récupération des lignes"
LINES_RESPONSE=$(curl -s "$BASE_URL/sotral/lines")
if echo "$LINES_RESPONSE" | grep -q '"success":true'; then
    LINES_COUNT=$(echo "$LINES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "✅ Lignes pour recherche: $LINES_COUNT"
else
    echo "❌ Erreur récupération lignes"
fi

echo ""

# 3. Test de récupération des types de tickets (pour les prix)
echo "3. Test récupération types de tickets"
TYPES_RESPONSE=$(curl -s "$BASE_URL/sotral/ticket-types")
if echo "$TYPES_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Types de tickets OK"
else
    echo "❌ Erreur types de tickets"
fi

echo ""

# 4. Simulation complète de ce que fait le frontend
echo "4. Simulation complète du chargement de la page recherche"
echo "- Tickets disponibles: $([ "$COUNT" -gt 0 ] && echo "OK ($COUNT)" || echo "RIEN")"
echo "- Lignes pour recherche: $([ "$LINES_COUNT" -gt 0 ] && echo "OK ($LINES_COUNT)" || echo "RIEN")"
echo "- Types de tickets: $(echo "$TYPES_RESPONSE" | grep -q '"success":true' && echo "OK" || echo "ERREUR")"

if [ "$COUNT" -gt 0 ] && [ "$LINES_COUNT" -gt 0 ]; then
    echo "✅ Les données sont disponibles - le problème est côté frontend"
else
    echo "❌ Problème côté backend - données manquantes"
fi

echo "=== Test terminé ==="
