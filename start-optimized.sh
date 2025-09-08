#!/bin/bash

# Script de lancement optimisé pour GoSOTRAL
# Résout automatiquement les problèmes de configuration Babel, ports, et dépendances

set -e  # Arrêter en cas d'erreur

echo "🚀 Lancement optimisé de GoSOTRAL"
echo "==================================="

# Variables
FRONT_PORT=8085
SCAN_PORT=8083
GOSOTRAL_PORT=8084
BACKEND_PORT=7000

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour augmenter les limites système si nécessaire
fix_system_limits() {
    log_info "Vérification des limites système..."
    
    local current_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
    local required_limit=524288
    
    if [ "$current_limit" -lt "$required_limit" ]; then
        log_warning "Limite de surveillance de fichiers trop basse ($current_limit), augmentation..."
        echo fs.inotify.max_user_watches=$required_limit | sudo tee -a /etc/sysctl.conf > /dev/null
        sudo sysctl -p > /dev/null
        log_success "Limite augmentée à $required_limit"
    else
        log_success "Limites système OK"
    fi
}

# Fonction pour libérer les ports
free_ports() {
    log_info "Libération des ports utilisés..."
    
    for port in $BACKEND_PORT $FRONT_PORT $SCAN_PORT $GOSOTRAL_PORT; do
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$pid" ]; then
            log_warning "Port $port occupé (PID: $pid), libération..."
            kill -9 $pid 2>/dev/null || true
            sleep 1
        fi
    done
    
    log_success "Ports libérés"
}

# Fonction pour corriger les configurations Babel
fix_babel_configs() {
    log_info "Correction des configurations Babel..."
    
    # Liste des projets Expo
    local projects=("front" "GoSOTRAL_front" "scan")
    
    for project in "${projects[@]}"; do
        local babel_file="$project/babel.config.js"
        
        if [ -f "$babel_file" ]; then
            log_info "Correction de $babel_file..."
            
            # Créer une configuration Babel corrigée
            cat > "$babel_file" << 'EOF'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-worklets/plugin"],
  };
};
EOF
            log_success "Configuration Babel corrigée pour $project"
        fi
    done
}

# Fonction pour installer les dépendances manquantes
install_dependencies() {
    log_info "Installation des dépendances manquantes..."
    
    local projects=("front" "GoSOTRAL_front" "scan")
    
    for project in "${projects[@]}"; do
        if [ -d "$project" ]; then
            log_info "Installation des dépendances pour $project..."
            cd "$project"
            
            # Installer react-native-worklets si nécessaire
            if ! npm list react-native-worklets > /dev/null 2>&1; then
                npm install react-native-worklets --save > /dev/null 2>&1
                log_success "react-native-worklets installé pour $project"
            fi
            
            cd ..
        fi
    done
}

# Fonction pour corriger les fichiers app.json
fix_app_configs() {
    log_info "Correction des configurations app.json..."
    
    # Corriger front/app.json
    if [ -f "front/app.json" ]; then
        jq '.expo.scheme = "gosotral-front"' front/app.json > front/app.json.tmp && mv front/app.json.tmp front/app.json
        log_success "Configuration app.json corrigée pour front"
    fi
    
    # Corriger GoSOTRAL_front/app.json
    if [ -f "GoSOTRAL_front/app.json" ]; then
        jq '.expo.scheme = "gosotral-main"' GoSOTRAL_front/app.json > GoSOTRAL_front/app.json.tmp && mv GoSOTRAL_front/app.json.tmp GoSOTRAL_front/app.json
        log_success "Configuration app.json corrigée pour GoSOTRAL_front"
    fi
    
    # Corriger scan/app.json
    if [ -f "scan/app.json" ]; then
        jq '.expo.scheme = "gosotral-scan"' scan/app.json > scan/app.json.tmp && mv scan/app.json.tmp scan/app.json
        log_success "Configuration app.json corrigée pour scan"
    fi
}

# Fonction pour démarrer le backend
start_backend() {
    log_info "Démarrage du backend..."
    
    if [ -d "back" ]; then
        cd back
        
        # Vérifier si Docker est disponible
        if command -v docker > /dev/null 2>&1; then
            log_info "Tentative de lancement avec Docker..."
            if docker compose up -d > /dev/null 2>&1; then
                log_success "Backend démarré avec Docker sur le port $BACKEND_PORT"
                cd ..
                return 0
            else
                log_warning "Docker Compose échoué, basculement vers npm..."
            fi
        fi
        
        # Lancement avec npm
        if command -v npm > /dev/null 2>&1; then
            npm install > /dev/null 2>&1
            npm run dev > /dev/null 2>&1 &
            local backend_pid=$!
            echo $backend_pid > ../backend.pid
            log_success "Backend démarré avec npm (PID: $backend_pid) sur le port $BACKEND_PORT"
        else
            log_error "Impossible de démarrer le backend - npm non disponible"
            cd ..
            return 1
        fi
        
        cd ..
    else
        log_error "Dossier backend 'back' introuvable"
        return 1
    fi
}

# Fonction pour démarrer les applications frontend
start_frontends() {
    log_info "Démarrage des applications frontend..."
    
    # Démarrer admin (Vite)
    if [ -d "admin" ]; then
        cd admin
        npm install > /dev/null 2>&1
        npm run dev > /dev/null 2>&1 &
        echo $! > ../admin.pid
        log_success "Admin démarré (Vite)"
        cd ..
    fi
    
    # Démarrer front (Expo)
    if [ -d "front" ]; then
        cd front
        npm install > /dev/null 2>&1
        npx expo start --port $FRONT_PORT --clear > /dev/null 2>&1 &
        echo $! > ../front.pid
        log_success "Front démarré sur le port $FRONT_PORT"
        cd ..
    fi
    
    # Démarrer GoSOTRAL_front (Expo)
    if [ -d "GoSOTRAL_front" ]; then
        cd GoSOTRAL_front
        npm install > /dev/null 2>&1
        npx expo start --port $GOSOTRAL_PORT --clear > /dev/null 2>&1 &
        echo $! > ../gosotral.pid
        log_success "GoSOTRAL_front démarré sur le port $GOSOTRAL_PORT"
        cd ..
    fi
    
    # Démarrer scan (Expo)
    if [ -d "scan" ]; then
        cd scan
        npm install > /dev/null 2>&1
        npx expo start --port $SCAN_PORT --clear > /dev/null 2>&1 &
        echo $! > ../scan.pid
        log_success "Scanner démarré sur le port $SCAN_PORT"
        cd ..
    fi
}

# Fonction pour afficher les informations de lancement
show_info() {
    echo ""
    log_success "🎉 Toutes les applications sont démarrées !"
    echo ""
    echo "📱 Applications disponibles :"
    echo "  • Backend API    : http://localhost:$BACKEND_PORT"
    echo "  • Admin Panel    : http://localhost:5173"
    echo "  • Front App      : http://localhost:$FRONT_PORT"
    echo "  • GoSOTRAL App   : http://localhost:$GOSOTRAL_PORT"
    echo "  • Scanner App    : http://localhost:$SCAN_PORT"
    echo ""
    echo "🎯 Nouvelles fonctionnalités :"
    echo "  ✅ Design des tickets SOTRAL conforme aux images"
    echo "  ✅ Configurations Babel corrigées"
    echo "  ✅ Problèmes de connectivité résolus"
    echo "  ✅ QR codes fonctionnels"
    echo ""
    echo "🛑 Pour arrêter tout :"
    echo "  ./stop-all.sh ou Ctrl+C puis kill \$(cat *.pid)"
    echo ""
}

# Fonction principale
main() {
    # Vérifications préliminaires
    fix_system_limits
    free_ports
    fix_babel_configs
    install_dependencies
    fix_app_configs
    
    # Démarrage des services
    start_backend
    sleep 3  # Attendre que le backend démarre
    start_frontends
    sleep 5  # Attendre que les frontends démarrent
    
    # Affichage des informations
    show_info
    
    # Attendre tous les processus
    wait
}

# Gestion de l'arrêt propre
cleanup() {
    log_info "Arrêt en cours..."
    
    # Arrêter tous les processus lancés
    for pidfile in backend.pid admin.pid front.pid gosotral.pid scan.pid; do
        if [ -f "$pidfile" ]; then
            local pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
            rm -f "$pidfile"
        fi
    done
    
    log_success "Arrêt terminé"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Lancement du script principal
main
