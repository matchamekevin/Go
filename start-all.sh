#!/bin/bash

# Script universel pour lancer toutes les applications GoSOTRAL
# Usage : chmod +x start-all.sh && ./start-all.sh

# Ne pas arrêter sur les erreurs pour permettre la vérification des prérequis
set +e

# Version minimale de Node.js requise
REQUIRED_NODE_VERSION="18.0.0"
FRONT_EXPO_PORT="${FRONT_EXPO_PORT:-8082}"
SCAN_EXPO_PORT="${SCAN_EXPO_PORT:-8083}"
GOSOTRAL_EXPO_PORT="${GOSOTRAL_EXPO_PORT:-8084}"

# Charger NVM si disponible
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  echo "NVM détecté, chargement..."
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  # Utiliser Node.js 18 si disponible
  if nvm ls 18 > /dev/null 2>&1; then
    echo "Utilisation de Node.js 18 via NVM..."
    nvm use 18 > /dev/null
  fi
fi

# Vérification des prérequis
check_prereqs() {
  echo "=== Vérification des prérequis ==="
  local missing_prereqs=false

  if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé ou n'est pas dans le PATH"
    echo "   Installation recommandée: exécutez ./setup-env.sh pour installer automatiquement NVM et Node.js"
    echo "   Ou manuellement: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
    echo "   Puis: nvm install 18"
    missing_prereqs=true
  else
    local node_version=$(node --version | cut -d 'v' -f 2)
    echo "✅ Node.js est installé: $(node --version)"

    # Vérifier si la version est compatible
    if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$node_version" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
      echo "❌ Version de Node.js incompatible: $node_version (requise: $REQUIRED_NODE_VERSION ou supérieure)"

      # Vérifier si NVM est installé mais pas utilisé correctement
      if [ -f "$HOME/.nvm/nvm.sh" ]; then
        echo "   NVM est installé! Essai de basculer automatiquement vers Node.js 18..."
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        # Vérifier si Node.js 18 est installé via NVM
        if nvm ls 18 > /dev/null 2>&1; then
          echo "   Node.js 18 trouvé dans NVM, basculement..."
          nvm use 18
          node_version=$(node --version | cut -d 'v' -f 2)
          echo "   ✅ Utilisation de Node.js: $(node --version)"
          # Si la version est maintenant correcte, ne pas signaler d'erreur
          if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$node_version" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
            missing_prereqs=false
          fi
        else
          echo "   Node.js 18 n'est pas installé via NVM. Installation recommandée:"
          echo "   nvm install 18 && nvm use 18"
          echo "   Ou exécutez: ./setup-env.sh"
        fi
      else
        echo "   Recommandation: exécutez ./setup-env.sh pour installer automatiquement NVM et Node.js"
        echo "   Ou manuellement: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
        echo "   Puis: nvm install 18"
      fi

      missing_prereqs=true
    fi
  fi

  if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé ou n'est pas dans le PATH"
    echo "   Installation recommandée: exécutez ./setup-env.sh pour installer automatiquement NVM et Node.js"
    echo "   Ou manuellement: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
    echo "   Puis: nvm install 18"
    missing_prereqs=true
  else
    echo "✅ npm est installé: $(npm --version)"
  fi

  if [ "$missing_prereqs" = true ]; then
    echo "⚠️ Certains prérequis sont manquants ou incompatibles. Le projet nécessite Node.js 18+ pour fonctionner correctement."
    echo "Les composants comme React Native, Expo et les dépendances modernes utilisent des fonctionnalités JavaScript récentes."
    echo ""
    echo "Souhaitez-vous:"
    echo "1) Installer automatiquement NVM et Node.js 18 (recommandé)"
    echo "2) Continuer malgré les erreurs (certaines applications ne fonctionneront pas)"
    echo "3) Quitter"
    read -r choice

    case $choice in
      1)
        echo "Lancement du script d'installation..."
        if [ -f "./setup-env.sh" ]; then
          chmod +x ./setup-env.sh
          ./setup-env.sh
          echo "Installation terminée. Relancement du script principal..."
          exec "$0"
          exit 0
        else
          echo "❌ Le script setup-env.sh n'a pas été trouvé."
          echo "Voulez-vous créer et exécuter ce script? (o/n)"
          read -r create_script
          if [[ "$create_script" =~ ^[oO]$ ]]; then
            curl -o setup-env.sh https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh
            chmod +x setup-env.sh
            ./setup-env.sh
            echo "Installation terminée. Relancement du script principal..."
            exec "$0"
            exit 0
          fi
        fi
        ;;
      2)
        echo "⚠️ Certaines applications peuvent ne pas fonctionner correctement avec une version obsolète de Node.js."
        ;;
      *)
        echo "Installation annulée. Veuillez installer les prérequis et réessayer."
        exit 1
        ;;
    esac
  fi
  echo ""
}

# Vérification de l'existence d'un répertoire
check_directory() {
  if [ ! -d "$1" ]; then
    echo "❌ Le répertoire $1 n'existe pas ou n'est pas accessible"
    return 1
  else
    return 0
  fi
}

# Exécution d'une commande, avec gestion d'erreur
run_command() {
  local dir=$1
  local cmd=$2
  local pid_var=$3
  local name=$4

  if check_directory "$dir"; then
    echo "--- $name ---"
    cd "$dir" || return
    eval "$cmd" &
    local pid=$!
    eval "$pid_var=$pid"
    cd - > /dev/null || return
    return 0
  else
    eval "$pid_var=0"
    return 1
  fi
}

# Fonction principale
main() {
  check_prereqs


  # Initialisation des variables
  BACKEND_PID=0
  ADMIN_PID=0
  FRONT_PID=0
  GOSOTRAL_PID=0
  SCAN_PID=0
  BACKEND_STATUS="non démarré"

  # Lancement du backend
  echo "--- Configuration du backend ---"

  if check_directory "back"; then
    cd back || exit

    # Vérifier si Docker est installé
    if command -v docker &> /dev/null; then
      echo "Docker trouvé, lancement du backend avec Docker..."
      docker compose down -v --remove-orphans 2>/dev/null || echo "Docker Compose non disponible ou aucun container à arrêter"
      docker system prune -af 2>/dev/null || echo "Nettoyage Docker échoué, on continue..."
      echo "--- BACKEND (docker compose) ---"
      if docker compose up -d 2>/dev/null; then
        BACKEND_STATUS="running with Docker Compose"
      else
        echo "Échec du lancement Docker Compose, tentative de démarrage direct..."
        if command -v npm &> /dev/null; then
          npm install && npm run dev &
          BACKEND_PID=$!
          BACKEND_STATUS="running with npm (PID: $BACKEND_PID)"
        else
          echo "❌ Impossible de démarrer le backend - npm n'est pas disponible"
          BACKEND_STATUS="non démarré - npm manquant"
        fi
      fi
    elif command -v npm &> /dev/null; then
      echo "Docker non trouvé, lancement direct du backend avec npm..."
      npm install && npm run dev &
      BACKEND_PID=$!
      BACKEND_STATUS="running with npm (PID: $BACKEND_PID)"
    else
      echo "❌ Impossible de démarrer le backend - ni Docker ni npm ne sont disponibles"
      BACKEND_STATUS="non démarré - dépendances manquantes"
    fi
    cd ..
  else
    BACKEND_STATUS="non démarré - répertoire back inaccessible"
  fi

  # Lancement de l'admin
  if command -v npm &> /dev/null; then
    run_command "admin" "npm install && npm run dev" "ADMIN_PID" "ADMIN"
  else
    echo "❌ Impossible de démarrer l'admin - npm n'est pas disponible"
    ADMIN_PID=0
  fi

  # Lancement du front
  if command -v npm &> /dev/null; then
    run_command "front" "npm install && npx expo start --port ${FRONT_EXPO_PORT}" "FRONT_PID" "FRONT"
  else
    echo "❌ Impossible de démarrer le front - npm n'est pas disponible"
    FRONT_PID=0
  fi

  # Lancement de GoSOTRAL_front avec Expo
  if command -v npm &> /dev/null; then
    run_command "GoSOTRAL_front" "npm install && npx expo start --port ${GOSOTRAL_EXPO_PORT}" "GOSOTRAL_PID" "GoSOTRAL_front (expo)"
  else
    echo "❌ Impossible de démarrer GoSOTRAL_front - npm n'est pas disponible"
    GOSOTRAL_PID=0
  fi

  # Lancement de scan avec Expo
  if command -v npm &> /dev/null; then
    run_command "scan" "npm install && npx expo start --port ${SCAN_EXPO_PORT}" "SCAN_PID" "SCAN (expo)"
  else
    echo "❌ Impossible de démarrer scan - npm n'est pas disponible"
    SCAN_PID=0
  fi

  # Affichage des PID
  sleep 2
  echo ""
  # Run backend tests after healthcheck
  if command -v npm &> /dev/null; then
    echo "--- RUNNING BACKEND TESTS (no health wait) ---"
    (cd back && npm test) && echo "✅ Backend tests passed" || echo "❌ Backend tests failed"
  fi
  echo "=== Applications lancées ==="
  echo "BACKEND      : $BACKEND_STATUS"
  echo "ADMIN        : $([ "$ADMIN_PID" -eq 0 ] && echo "non démarré" || echo "$ADMIN_PID")"
  echo "FRONT        : $([ "$FRONT_PID" -eq 0 ] && echo "non démarré" || echo "$FRONT_PID")"
  echo "GOSOTRAL     : $([ "$GOSOTRAL_PID" -eq 0 ] && echo "non démarré" || echo "$GOSOTRAL_PID")"
  echo "SCAN         : $([ "$SCAN_PID" -eq 0 ] && echo "non démarré" || echo "$SCAN_PID")"
  echo ""

  # Construire la commande kill en fonction de ce qui a été lancé
  KILL_CMD="kill"
  PIDS_TO_KILL=""

  if [ "$BACKEND_PID" -ne 0 ]; then
    PIDS_TO_KILL="$PIDS_TO_KILL $BACKEND_PID"
  fi

  if [ "$ADMIN_PID" -ne 0 ]; then
    PIDS_TO_KILL="$PIDS_TO_KILL $ADMIN_PID"
  fi

  if [ "$FRONT_PID" -ne 0 ]; then
    PIDS_TO_KILL="$PIDS_TO_KILL $FRONT_PID"
  fi

  if [ "$GOSOTRAL_PID" -ne 0 ]; then
    PIDS_TO_KILL="$PIDS_TO_KILL $GOSOTRAL_PID"
  fi

  if [ "$SCAN_PID" -ne 0 ]; then
    PIDS_TO_KILL="$PIDS_TO_KILL $SCAN_PID"
  fi

  if [ -n "$PIDS_TO_KILL" ]; then
    echo "Pour arrêter tout : $KILL_CMD$PIDS_TO_KILL"
  else
    echo "Aucune application n'a été démarrée avec succès."
  fi
}

# Exécution de la fonction principale
main

# Attendre tous les processus fils
wait
