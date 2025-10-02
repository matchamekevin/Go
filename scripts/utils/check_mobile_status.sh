#!/bin/bash

echo "=== Vérification du statut mobile ==="

# 1. Vérifier que le serveur local répond
echo "1. Serveur local (devrait être utilisé par l'app)"
curl -s -w " -> %{http_code} (%{time_total}s)\n" "http://localhost:7000/health" | head -1

# 2. Vérifier le serveur de production
echo "2. Serveur production (ne devrait pas être utilisé)"
curl -s -w " -> %{http_code} (%{time_total}s)\n" "https://go-j2rr.onrender.com/health" | head -1

# 3. Vérifier les données disponibles
echo "3. Données disponibles localement"
TICKETS=$(curl -s "http://localhost:7000/sotral/generated-tickets" | grep -o '"count":[0-9]*' | cut -d':' -f2)
LINES=$(curl -s "http://localhost:7000/sotral/lines" | grep -o '"count":[0-9]*' | cut -d':' -f2)

echo "Tickets disponibles: $TICKETS"
echo "Lignes disponibles: $LINES"

# 4. Instructions pour l'utilisateur
echo ""
echo "=== Instructions pour tester ==="
echo "1. Ouvrez l'app mobile Expo"
echo "2. Allez dans l'onglet 'Rechercher'"
echo "3. Ouvrez la console de debug (Cmd+D sur iOS, Cmd+M sur Android)"
echo "4. Regardez les logs qui commencent par [SearchTab] et [SearchService]"
echo "5. Vérifiez si les tickets et résultats de recherche s'affichent"
echo ""
echo "Si rien ne s'affiche, le problème est probablement :"
echo "- L'app utilise encore l'ancien endpoint (redémarrer complètement)"
echo "- Cache non vidé (expo start --clear)"
echo "- Erreur réseau (vérifier la connexion)"

