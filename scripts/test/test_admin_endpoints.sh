#!/bin/bash

# Test des endpoints admin qui avaient des erreurs 500
echo "=== Test des endpoints admin ==="

# 1. Login admin
echo "1. Login admin..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:7000/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gosotral.com", "password": "admin123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extraire le token avec jq si disponible, sinon python
if command -v jq &> /dev/null; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .data.token // empty')
else
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    token = data.get('token') or (data.get('data', {}).get('token'))
    print(token or '')
except:
    print('')
")
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Impossible d'obtenir le token admin"
    exit 1
fi

echo "✅ Token obtenu: ${TOKEN:0:20}..."

# 2. Test /admin/users
echo "2. Test /admin/users..."
USERS_RESPONSE=$(curl -s -X GET "http://localhost:7000/admin/users" \
  -H "Authorization: Bearer $TOKEN")

if echo "$USERS_RESPONSE" | grep -q '"success":true'; then
    echo "✅ /admin/users fonctionne"
else
    echo "❌ /admin/users erreur: $USERS_RESPONSE"
fi

# 3. Test /admin/dashboard/stats
echo "3. Test /admin/dashboard/stats..."
STATS_RESPONSE=$(curl -s -X GET "http://localhost:7000/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q '"success":true'; then
    echo "✅ /admin/dashboard/stats fonctionne"
else
    echo "❌ /admin/dashboard/stats erreur: $STATS_RESPONSE"
fi

echo "=== Tests terminés ==="
