#!/bin/bash

# Script de vérification de la configuration pour l'application Go
# Vérifie que tout est prêt pour compiler l'APK

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                      ║${NC}"
echo -e "${BLUE}║           🔍 VÉRIFICATION DE LA CONFIGURATION - APP GO 🔍            ║${NC}"
echo -e "${BLUE}║                                                                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

# Fonction pour afficher un avertissement
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Fonction pour afficher une info
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Vérifier le répertoire
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📁 Vérification du répertoire${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "app.json" ]; then
    success "Fichier app.json trouvé"
else
    error "Fichier app.json non trouvé"
fi

if [ -f "package.json" ]; then
    success "Fichier package.json trouvé"
else
    error "Fichier package.json non trouvé"
fi

if [ -f "eas.json" ]; then
    success "Fichier eas.json trouvé"
else
    error "Fichier eas.json non trouvé"
fi

echo ""

# Vérifier les icônes
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎨 Vérification des icônes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "assets/images/icon.png" ]; then
    size=$(identify -format "%wx%h" assets/images/icon.png 2>/dev/null || echo "unknown")
    if [ "$size" = "1024x1024" ]; then
        success "icon.png (1024x1024) ✓"
    else
        warning "icon.png trouvé mais taille incorrecte: $size (attendu: 1024x1024)"
    fi
else
    error "icon.png non trouvé"
fi

if [ -f "assets/images/adaptive-icon.png" ]; then
    size=$(identify -format "%wx%h" assets/images/adaptive-icon.png 2>/dev/null || echo "unknown")
    if [ "$size" = "1024x1024" ]; then
        success "adaptive-icon.png (1024x1024) ✓"
    else
        warning "adaptive-icon.png trouvé mais taille incorrecte: $size"
    fi
else
    error "adaptive-icon.png non trouvé"
fi

if [ -f "assets/images/splash-icon.png" ]; then
    success "splash-icon.png ✓"
else
    warning "splash-icon.png non trouvé"
fi

if [ -f "assets/images/favicon.png" ]; then
    success "favicon.png ✓"
else
    warning "favicon.png non trouvé"
fi

echo ""

# Vérifier les scripts
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📜 Vérification des scripts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -x "build-apk.sh" ]; then
    success "build-apk.sh (exécutable) ✓"
elif [ -f "build-apk.sh" ]; then
    warning "build-apk.sh trouvé mais pas exécutable"
else
    error "build-apk.sh non trouvé"
fi

if [ -x "find-apk.sh" ]; then
    success "find-apk.sh (exécutable) ✓"
elif [ -f "find-apk.sh" ]; then
    warning "find-apk.sh trouvé mais pas exécutable"
else
    error "find-apk.sh non trouvé"
fi

if [ -f "scripts/icon-generator/generate_icons.py" ]; then
    success "generate_icons.py ✓"
else
    error "generate_icons.py non trouvé"
fi

echo ""

# Vérifier les outils
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Vérification des outils${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v node &> /dev/null; then
    version=$(node --version)
    success "Node.js installé: $version"
else
    error "Node.js non installé"
fi

if command -v npm &> /dev/null; then
    version=$(npm --version)
    success "npm installé: $version"
else
    error "npm non installé"
fi

if command -v eas &> /dev/null; then
    version=$(eas --version 2>/dev/null || echo "unknown")
    success "EAS CLI installé: $version"
else
    error "EAS CLI non installé (npm install -g eas-cli)"
fi

if command -v yarn &> /dev/null; then
    version=$(yarn --version)
    success "Yarn installé: $version"
else
    warning "Yarn non installé (npm install -g yarn) - Requis pour build local"
fi

if command -v python3 &> /dev/null; then
    version=$(python3 --version)
    success "Python3 installé: $version"
else
    warning "Python3 non installé - Nécessaire pour générer les icônes"
fi

if command -v java &> /dev/null; then
    version=$(java -version 2>&1 | head -n 1)
    success "Java installé: $version"
else
    warning "Java non installé - Requis pour build local Android"
fi

if command -v adb &> /dev/null; then
    version=$(adb --version 2>&1 | head -n 1)
    success "ADB installé: $version"
else
    warning "ADB non installé - Utile pour installer l'APK"
fi

echo ""

# Vérifier Android SDK
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📱 Vérification de l'environnement Android${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$ANDROID_HOME" ]; then
    if [ -d "$ANDROID_HOME" ]; then
        success "ANDROID_HOME défini: $ANDROID_HOME"
    else
        warning "ANDROID_HOME défini mais répertoire non trouvé: $ANDROID_HOME"
    fi
else
    warning "ANDROID_HOME non défini - Requis pour build local"
fi

if [ -n "$ANDROID_NDK_HOME" ]; then
    success "ANDROID_NDK_HOME défini: $ANDROID_NDK_HOME"
else
    info "ANDROID_NDK_HOME non défini (optionnel)"
fi

echo ""

# Vérifier la connexion Expo
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 Vérification de la connexion Expo${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v eas &> /dev/null; then
    username=$(eas whoami 2>/dev/null)
    if [ -n "$username" ]; then
        success "Connecté à Expo en tant que: $username"
    else
        warning "Non connecté à Expo (eas login)"
    fi
fi

echo ""

# Vérifier les dépendances npm
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Vérification des dépendances${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "node_modules" ]; then
    success "node_modules présent"
else
    warning "node_modules absent (npm install)"
fi

echo ""

# Vérifier l'espace disque
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💾 Vérification de l'espace disque${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

available=$(df -h . | awk 'NR==2 {print $4}')
info "Espace disponible: $available"

available_gb=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$available_gb" -gt 10 ]; then
    success "Espace disque suffisant pour le build"
else
    warning "Espace disque faible (recommandé: >10GB)"
fi

echo ""

# Vérifier la documentation
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📚 Vérification de la documentation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "BUILD_APK_GUIDE.md" ]; then
    success "BUILD_APK_GUIDE.md ✓"
else
    warning "BUILD_APK_GUIDE.md non trouvé"
fi

if [ -f "RESUME.md" ]; then
    success "RESUME.md ✓"
else
    warning "RESUME.md non trouvé"
fi

if [ -f "COMMANDES_RAPIDES.md" ]; then
    success "COMMANDES_RAPIDES.md ✓"
else
    warning "COMMANDES_RAPIDES.md non trouvé"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Résumé
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}║              ✅ TOUT EST PRÊT POUR LA COMPILATION! ✅                ║${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Vous pouvez maintenant compiler l'APK:${NC}"
    echo -e "  ${BLUE}./build-apk.sh${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                                      ║${NC}"
    echo -e "${YELLOW}║          ⚠  PRÊT AVEC $WARNINGS AVERTISSEMENT(S) ⚠                     ║${NC}"
    echo -e "${YELLOW}║                                                                      ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Certains outils optionnels sont manquants mais vous pouvez compiler.${NC}"
    echo -e "  ${BLUE}./build-apk.sh${NC}"
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                      ║${NC}"
    echo -e "${RED}║          ❌ $ERRORS ERREUR(S) ET $WARNINGS AVERTISSEMENT(S) ❌           ║${NC}"
    echo -e "${RED}║                                                                      ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Corrigez les erreurs avant de compiler.${NC}"
    echo ""
    echo -e "${YELLOW}Actions recommandées:${NC}"
    if ! command -v eas &> /dev/null; then
        echo "  - Installer EAS CLI: ${BLUE}npm install -g eas-cli${NC}"
    fi
    if ! command -v yarn &> /dev/null; then
        echo "  - Installer Yarn: ${BLUE}npm install -g yarn${NC}"
    fi
    if [ ! -d "node_modules" ]; then
        echo "  - Installer les dépendances: ${BLUE}npm install${NC}"
    fi
fi

echo ""
