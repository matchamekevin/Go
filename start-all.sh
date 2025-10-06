#!/bin/bash

# 🚀 Script de démarrage complet du système SOTRAL
# Démarre les 4 applications en parallèle

echo "🎯 Démarrage du système SOTRAL complet..."
echo ""
echo "Applications à démarrer:"
echo "  1. Backend (API) - Port 3000"
echo "  2. Frontend Mobile (Client) - Expo"
echo "  3. Scanner (Contrôleur) - Expo"
echo "  4. Admin (Panel Web) - Port 5173"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si tmux est installé
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}❌ tmux n'est pas installé${NC}"
    echo "Installation: sudo apt-get install tmux"
    exit 1
fi

# Créer une session tmux
SESSION="sotral-dev"

# Tuer la session si elle existe déjà
tmux kill-session -t $SESSION 2>/dev/null

echo -e "${YELLOW}🔧 Création de la session tmux: $SESSION${NC}"

# Créer une nouvelle session
tmux new-session -d -s $SESSION

# Window 0: Backend
tmux rename-window -t $SESSION:0 'Backend'
tmux send-keys -t $SESSION:0 "cd $(pwd)/back && echo '🚀 Démarrage Backend...' && npm run dev" C-m

# Window 1: Frontend Mobile
tmux new-window -t $SESSION:1 -n 'Frontend'
tmux send-keys -t $SESSION:1 "cd $(pwd)/front && echo '📱 Démarrage Frontend Mobile...' && npm start" C-m

# Window 2: Scanner
tmux new-window -t $SESSION:2 -n 'Scanner'
tmux send-keys -t $SESSION:2 "cd $(pwd)/scan && echo '📸 Démarrage Scanner...' && npm start" C-m

# Window 3: Admin
tmux new-window -t $SESSION:3 -n 'Admin'
tmux send-keys -t $SESSION:3 "cd $(pwd)/admin && echo '⚙️ Démarrage Admin Panel...' && npm run dev" C-m

echo ""
echo -e "${GREEN}✅ Session tmux créée avec succès!${NC}"
echo ""
echo "📋 Commandes utiles:"
echo "  - Attacher à la session: ${YELLOW}tmux attach -t $SESSION${NC}"
echo "  - Naviguer entre fenêtres: ${YELLOW}Ctrl+b puis 0/1/2/3${NC}"
echo "  - Détacher: ${YELLOW}Ctrl+b puis d${NC}"
echo "  - Quitter la session: ${YELLOW}tmux kill-session -t $SESSION${NC}"
echo ""
echo -e "${YELLOW}🔗 URLs d'accès:${NC}"
echo "  - Backend API: http://localhost:3000"
echo "  - Admin Panel: http://localhost:5173"
echo "  - Frontend Mobile: Scan QR code avec Expo Go"
echo "  - Scanner: Scan QR code avec Expo Go"
echo ""

# Attacher automatiquement
sleep 2
echo -e "${GREEN}🎉 Démarrage terminé! Attachement à la session...${NC}"
sleep 1
tmux attach -t $SESSION
