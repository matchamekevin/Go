#!/bin/bash

# 🚌 SOTRAL Admin v2.0 - Installation automatique
# ================================================

set -e

echo ""
echo "🚌 SOTRAL Admin Dashboard v2.0"
echo "======================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Vérifier si Node.js est installé
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        print_info "Veuillez installer Node.js 18+ depuis https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
    
    if [ "$MAJOR_VERSION" -lt 16 ]; then
        print_error "Node.js version $NODE_VERSION détectée"
        print_info "Veuillez installer Node.js 16+ pour ce projet"
        exit 1
    fi
    
    print_success "Node.js $NODE_VERSION détecté"
}

# Vérifier si npm est installé
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION détecté"
}

# Vérifier la connexion au backend
check_backend() {
    print_info "Vérification de la connexion au backend SOTRAL..."
    
    BACKEND_URL="http://localhost:7000"
    
    if curl -s --connect-timeout 5 "$BACKEND_URL/api/sotral/health" > /dev/null 2>&1; then
        print_success "Backend SOTRAL accessible sur $BACKEND_URL"
    else
        print_warning "Backend SOTRAL non accessible sur $BACKEND_URL"
        print_info "Assurez-vous que le backend soit démarré avant d'utiliser l'admin"
    fi
}

# Installation des dépendances
install_dependencies() {
    print_info "Installation des dépendances..."
    
    if npm install; then
        print_success "Dépendances installées avec succès"
    else
        print_error "Erreur lors de l'installation des dépendances"
        exit 1
    fi
}

# Créer le fichier .env.local
setup_env() {
    print_info "Configuration de l'environnement..."
    
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# Configuration SOTRAL Admin Dashboard
VITE_API_BASE_URL=http://localhost:7000

# Configuration optionnelle
VITE_APP_NAME=SOTRAL Admin
VITE_APP_VERSION=2.0.0
EOF
        print_success "Fichier .env.local créé"
    else
        print_info "Fichier .env.local existe déjà"
    fi
}

# Vérifier la structure du projet
check_structure() {
    print_info "Vérification de la structure du projet..."
    
    REQUIRED_DIRS=(
        "src"
        "src/features"
        "src/shared"
        "src/features/lines"
        "src/features/tickets"
        "src/features/analytics"
    )
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            print_error "Dossier manquant: $dir"
            exit 1
        fi
    done
    
    print_success "Structure du projet validée"
}

# Fonction de nettoyage
cleanup_build() {
    print_info "Nettoyage des anciens builds..."
    
    if [ -d "dist" ]; then
        rm -rf dist
        print_success "Dossier dist supprimé"
    fi
    
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        print_success "Cache Vite nettoyé"
    fi
}

# Test de build
test_build() {
    print_info "Test de build de production..."
    
    if npm run build > /tmp/build.log 2>&1; then
        print_success "Build de production réussie"
        
        # Afficher la taille du build
        if [ -d "dist" ]; then
            BUILD_SIZE=$(du -sh dist | cut -f1)
            print_info "Taille du build: $BUILD_SIZE"
        fi
    else
        print_error "Erreur lors du build de production"
        print_info "Logs disponibles dans /tmp/build.log"
        exit 1
    fi
}

# Menu principal
main() {
    print_info "Début de l'installation..."
    echo ""
    
    # Vérifications préliminaires
    check_node
    check_npm
    
    # Configuration du projet
    setup_env
    check_structure
    
    # Installation
    cleanup_build
    install_dependencies
    
    # Vérifications post-installation
    check_backend
    
    echo ""
    print_success "🎉 Installation terminée avec succès !"
    echo ""
    
    # Instructions pour démarrer
    echo "📋 Prochaines étapes:"
    echo ""
    echo "1. Démarrer le serveur de développement:"
    echo "   npm run dev"
    echo ""
    echo "2. Ouvrir votre navigateur sur:"
    echo "   http://localhost:3001"
    echo ""
    echo "3. S'assurer que le backend SOTRAL fonctionne:"
    echo "   http://localhost:7000/api/sotral/health"
    echo ""
    
    # Optionnel : démarrage automatique
    read -p "🚀 Démarrer le serveur de développement maintenant ? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Démarrage du serveur de développement..."
        npm run dev
    else
        print_info "Vous pouvez démarrer le serveur plus tard avec: npm run dev"
    fi
}

# Options en ligne de commande
case "${1:-}" in
    --build-only)
        print_info "Mode build uniquement"
        check_node
        check_npm
        test_build
        ;;
    --check-backend)
        print_info "Vérification backend uniquement"
        check_backend
        ;;
    --cleanup)
        print_info "Nettoyage uniquement"
        cleanup_build
        ;;
    --help|-h)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --build-only      Tester uniquement le build de production"
        echo "  --check-backend   Vérifier uniquement la connexion backend"
        echo "  --cleanup         Nettoyer les anciens builds"
        echo "  --help, -h        Afficher cette aide"
        echo ""
        ;;
    *)
        main
        ;;
esac