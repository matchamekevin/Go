#!/bin/bash

echo "=== Test récupération tickets depuis mobile ==="

# Tester l'endpoint local directement
echo "1. Test endpoint local /sotral/generated-tickets"
LOCAL_RESPONSE=$(curl -s "http://localhost:7000/sotral/generated-tickets")
if echo "$LOCAL_RESPONSE" | grep -q '"success":true'; then
    COUNT=$(echo "$LOCAL_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "✅ Local: $COUNT tickets trouvés"
else
    echo "❌ Local: Erreur ou pas de données"
fi

# Tester l'endpoint de production
echo "2. Test endpoint production /sotral/generated-tickets"
PROD_RESPONSE=$(curl -s "https://go-j2rr.onrender.com/sotral/generated-tickets")
if echo "$PROD_RESPONSE" | grep -q '"success":true'; then
    COUNT=$(echo "$PROD_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "✅ Production: $COUNT tickets trouvés"
else
    echo "❌ Production: Erreur ou pas de données"
fi

# Tester l'endpoint health pour voir lequel répond
echo "3. Test détection NetworkManager"
LOCAL_HEALTH=$(curl -s -w "%{time_total}" "http://localhost:7000/health" 2>/dev/null | tail -1)
PROD_HEALTH=$(curl -s -w "%{time_total}" "https://go-j2rr.onrender.com/health" 2>/dev/null | tail -1)

echo "Local health time: ${LOCAL_HEALTH}s"
echo "Prod health time: ${PROD_HEALTH}s"

if (( $(echo "$LOCAL_HEALTH < $PROD_HEALTH" | bc -l 2>/dev/null || echo "1") )); then
    echo "✅ Local devrait être choisi (plus rapide)"
else
    echo "❌ Production pourrait être choisi (plus rapide)"
fi

echo "=== Test terminé ==="
