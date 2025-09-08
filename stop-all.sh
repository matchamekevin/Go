#!/bin/bash

# Script d'arrêt pour GoSOTRAL

echo "🛑 Arrêt de toutes les applications GoSOTRAL..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${YELLOW}ℹ️ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Arrêter les processus par PID files
for pidfile in backend.pid admin.pid front.pid gosotral.pid scan.pid; do
    if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "Arrêt du processus $pid ($pidfile)..."
            kill "$pid" 2>/dev/null || true
            sleep 1
        fi
        rm -f "$pidfile"
    fi
done

# Arrêter les processus par ports
ports=(7000 5173 8082 8083 8084 8085)
for port in "${ports[@]}"; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        log_info "Arrêt du processus sur le port $port (PID: $pid)..."
        kill -9 "$pid" 2>/dev/null || true
    fi
done

# Arrêter Docker si nécessaire
if command -v docker > /dev/null 2>&1; then
    if [ -f "back/docker-compose.yml" ]; then
        log_info "Arrêt des conteneurs Docker..."
        cd back && docker compose down > /dev/null 2>&1 && cd .. || true
    fi
fi

log_success "🎉 Toutes les applications ont été arrêtées"
