#!/bin/bash

echo "=== Test complet recherche et tickets ==="

# 1. Tester les lignes SOTRAL
echo "1. Test /sotral/lines"
LINES_RESPONSE=$(curl -s "http://localhost:7000/sotral/lines")
if echo "$LINES_RESPONSE" | grep -q '"success":true'; then
    LINES_COUNT=$(echo "$LINES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "✅ Lignes: $LINES_COUNT trouvées"
else
    echo "❌ Erreur lignes"
fi

# 2. Tester les types de tickets
echo "2. Test /sotral/ticket-types"
TYPES_RESPONSE=$(curl -s "http://localhost:7000/sotral/ticket-types")
if echo "$TYPES_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Types de tickets OK"
else
    echo "❌ Erreur types de tickets"
fi

# 3. Tester les tickets générés
echo "3. Test /sotral/generated-tickets"
TICKETS_RESPONSE=$(curl -s "http://localhost:7000/sotral/generated-tickets")
if echo "$TICKETS_RESPONSE" | grep -q '"success":true'; then
    TICKETS_COUNT=$(echo "$TICKETS_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "✅ Tickets générés: $TICKETS_COUNT trouvés"
    # Afficher quelques exemples de tickets
    echo "$TICKETS_RESPONSE" | jq '.data[0:2] | map({id, ticket_code, price_paid_fcfa, line_name})' 2>/dev/null || echo "Erreur parsing JSON"
else
    echo "❌ Erreur tickets générés: $(echo "$TICKETS_RESPONSE" | head -1)"
fi

# 4. Tester la recherche simulée
echo "4. Simulation recherche frontend"
echo "Recherche vide (devrait retourner toutes les lignes):"
SEARCH_SIMULATION=$(curl -s "http://localhost:7000/sotral/lines" | jq '.data | map({
    id: (.id | tostring),
    from: .route_from,
    to: .route_to,
    price: "-- FCFA",
    type: ("Ligne " + (.line_number | tostring)),
    company: (.category.name // "SOTRAL")
})' 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Simulation recherche OK"
    echo "$SEARCH_SIMULATION" | jq 'length' 2>/dev/null && echo "lignes dans les résultats"
else
    echo "❌ Erreur simulation recherche"
fi

echo "=== Test terminé ==="
