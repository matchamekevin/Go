#!/bin/bash

# Script de test pour vérifier les corrections du dashboard
echo "=== Test des corrections du dashboard ==="

# Vérifier si le serveur backend fonctionne
echo "1. Vérification du serveur backend..."
if curl -s https://go-j2rr.onrender.com/health > /dev/null; then
    echo "✅ Serveur backend accessible"
else
    echo "❌ Serveur backend non accessible"
    exit 1
fi

# Tester l'endpoint des statistiques du dashboard
echo "2. Test de l'endpoint /admin/dashboard/stats..."
RESPONSE=$(curl -s -H "Authorization: Bearer test-token" https://go-j2rr.onrender.com/admin/dashboard/stats)
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Endpoint stats fonctionne"
    echo "Données reçues:"
    echo "$RESPONSE" | jq '.data' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ Endpoint stats échoue"
    echo "Réponse: $RESPONSE"
fi

# Tester l'endpoint des données de graphique
echo "3. Test de l'endpoint /admin/dashboard/chart-data..."
CHART_RESPONSE=$(curl -s -H "Authorization: Bearer test-token" "https://go-j2rr.onrender.com/admin/dashboard/chart-data?type=revenue&period=30d")
if echo "$CHART_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Endpoint chart-data fonctionne"
    echo "Données de revenus reçues:"
    echo "$CHART_RESPONSE" | jq '.data' 2>/dev/null || echo "$CHART_RESPONSE"
else
    echo "❌ Endpoint chart-data échoue"
    echo "Réponse: $CHART_RESPONSE"
fi

# Tester l'endpoint d'activité récente
echo "4. Test de l'endpoint /admin/dashboard/recent-activity..."
ACTIVITY_RESPONSE=$(curl -s -H "Authorization: Bearer test-token" https://go-j2rr.onrender.com/admin/dashboard/recent-activity)
if echo "$ACTIVITY_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Endpoint recent-activity fonctionne"
    echo "Activités reçues:"
    echo "$ACTIVITY_RESPONSE" | jq '.data' 2>/dev/null || echo "$ACTIVITY_RESPONSE"
else
    echo "❌ Endpoint recent-activity échoue"
    echo "Réponse: $ACTIVITY_RESPONSE"
fi

echo "=== Test terminé ==="