#!/bin/bash

# Surveillance en continu des clients SSE connectés
echo "👀 Surveillance des clients SSE connectés"
echo "=========================================="
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

BASE_URL="http://192.168.1.78:7000"

while true; do
    # Obtenir le nombre de clients
    RESPONSE=$(curl -s "$BASE_URL/realtime/clients-count" 2>/dev/null)
    if [ $? -eq 0 ]; then
        CLIENTS=$(echo "$RESPONSE" | grep -o '"connectedClients":[0-9]*' | cut -d':' -f2)
        TIMESTAMP=$(date '+%H:%M:%S')

        if [ "$CLIENTS" -gt 0 ]; then
            echo "🟢 [$TIMESTAMP] $CLIENTS client(s) connecté(s)"
        else
            echo "🔴 [$TIMESTAMP] Aucun client connecté"
        fi
    else
        echo "❌ [$TIMESTAMP] Erreur de connexion au serveur"
    fi

    sleep 2
done