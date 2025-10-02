#!/bin/bash

# Script de déploiement multi-plateforme pour GoSOTRAL Backend
# Usage: ./deploy.sh [platform]
# Platforms supportées: render, railway, heroku, docker

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier les prérequis
check_requirements() {
    log_info "Vérification des prérequis..."
    
    if [ ! -f "package.json" ]; then
        log_error "Ce script doit être exécuté depuis le dossier backend (back/)"
        exit 1
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        log_error "Fichier docker-compose.yml introuvable"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction pour préparer les fichiers de déploiement
prepare_deployment() {
    log_info "Préparation des fichiers de déploiement..."
    
    # Créer un Dockerfile pour production si pas existant
    if [ ! -f "Dockerfile.prod" ]; then
        cat > Dockerfile.prod << EOF
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Exposer le port
EXPOSE 7000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=7000

# Commande de démarrage
CMD ["npm", "start"]
EOF
        log_success "Dockerfile.prod créé"
    fi
    
    # Créer un fichier .dockerignore
    if [ ! -f ".dockerignore" ]; then
        cat > .dockerignore << EOF
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.docker
tests
*.test.js
*.md
EOF
        log_success ".dockerignore créé"
    fi
}

# Fonction pour déployer sur Render
deploy_render() {
    log_info "Déploiement sur Render..."
    
    # Créer render.yaml si pas existant
    if [ ! -f "render.yaml" ]; then
        cat > render.yaml << EOF
services:
  - type: web
    name: gosotral-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 7000
      - key: DATABASE_URL
        fromDatabase:
          name: gosotral-db
          property: connectionString

databases:
  - name: gosotral-db
    plan: free
    databaseName: gosotral_db
    user: gosotral_user
EOF
        log_success "render.yaml créé"
    fi
    
    log_info "Pour déployer sur Render:"
    echo "1. Allez sur https://render.com"
    echo "2. Connectez votre repository GitHub"
    echo "3. Sélectionnez 'New' > 'Blueprint'"
    echo "4. Le fichier render.yaml sera utilisé automatiquement"
    log_warning "N'oubliez pas de configurer les variables d'environnement!"
}

# Fonction pour déployer sur Railway
deploy_railway() {
    log_info "Déploiement sur Railway..."
    
    # Vérifier si Railway CLI est installé
    if ! command -v railway &> /dev/null; then
        log_warning "Railway CLI non installé. Installation..."
        npm install -g @railway/cli
    fi
    
    # Créer railway.json
    if [ ! -f "railway.json" ]; then
        cat > railway.json << EOF
{
  "deploy": {
    "buildCommand": "npm install && npm run build",
    "startCommand": "npm start"
  }
}
EOF
        log_success "railway.json créé"
    fi
    
    log_info "Connexion à Railway..."
    railway login
    
    log_info "Initialisation du projet..."
    railway init
    
    log_info "Ajout de la base de données PostgreSQL..."
    railway add --plugin postgresql
    
    log_info "Déploiement en cours..."
    railway up
    
    log_success "Déploiement terminé!"
    railway open
}

# Fonction pour déployer sur Heroku
deploy_heroku() {
    log_info "Déploiement sur Heroku..."
    
    # Vérifier si Heroku CLI est installé
    if ! command -v heroku &> /dev/null; then
        log_error "Heroku CLI non installé. Installez-le depuis https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Créer Procfile
    if [ ! -f "Procfile" ]; then
        echo "web: npm start" > Procfile
        log_success "Procfile créé"
    fi
    
    log_info "Connexion à Heroku..."
    heroku login
    
    log_info "Création de l'application..."
    read -p "Nom de l'application Heroku: " app_name
    heroku create $app_name
    
    log_info "Ajout de la base de données PostgreSQL..."
    heroku addons:create heroku-postgresql:mini
    
    log_info "Configuration des variables d'environnement..."
    heroku config:set NODE_ENV=production
    
    log_info "Déploiement en cours..."
    git push heroku main
    
    log_success "Déploiement terminé!"
    heroku open
}

# Fonction pour créer une image Docker
build_docker() {
    log_info "Construction de l'image Docker..."
    
    prepare_deployment
    
    docker build -f Dockerfile.prod -t gosotral-backend:latest .
    
    log_success "Image Docker créée: gosotral-backend:latest"
    
    log_info "Pour déployer l'image:"
    echo "1. Sur un VPS: docker run -p 7000:7000 gosotral-backend:latest"
    echo "2. Sur Docker Hub: docker tag gosotral-backend:latest your-username/gosotral-backend"
    echo "3. Push: docker push your-username/gosotral-backend"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  render    Préparer le déploiement pour Render.com"
    echo "  railway   Déployer sur Railway.app"
    echo "  heroku    Déployer sur Heroku"
    echo "  docker    Construire une image Docker"
    echo "  help      Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 railway    # Déploie sur Railway"
    echo "  $0 render     # Prépare pour Render"
    echo "  $0 docker     # Construit l'image Docker"
}

# Fonction principale
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    check_requirements
    
    case $1 in
        "render")
            deploy_render
            ;;
        "railway")
            deploy_railway
            ;;
        "heroku")
            deploy_heroku
            ;;
        "docker")
            build_docker
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Appel de la fonction principale
main "$@"
