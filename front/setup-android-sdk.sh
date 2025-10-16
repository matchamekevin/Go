#!/bin/bash

# Script pour configurer Android SDK pour le build local
# Configure les variables d'environnement nécessaires

set -e

echo "🔧 Configuration du SDK Android pour le build local"
echo "===================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}✗${NC} $1"
}

# Fonction pour afficher une info
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Chercher le SDK Android
info "Recherche du SDK Android..."

POSSIBLE_LOCATIONS=(
    "/usr/lib/android-sdk"
    "/home/connect/Android/Sdk"
    "$HOME/Android/Sdk"
    "/opt/android-sdk"
    "$ANDROID_SDK_ROOT"
    "$ANDROID_HOME"
)

FOUND_SDK=""

for location in "${POSSIBLE_LOCATIONS[@]}"; do
    if [ -n "$location" ] && [ -d "$location" ]; then
        if [ -d "$location/platform-tools" ] || [ -d "$location/platforms" ]; then
            FOUND_SDK="$location"
            success "SDK Android trouvé: $location"
            break
        fi
    fi
done

if [ -z "$FOUND_SDK" ]; then
    error "SDK Android non trouvé dans les emplacements standards"
    echo ""
    echo "Veuillez installer Android SDK:"
    echo "  sudo apt install android-sdk"
    echo ""
    echo "Ou télécharger depuis:"
    echo "  https://developer.android.com/studio#command-tools"
    exit 1
fi

# Créer le fichier local.properties dans le répertoire android
echo ""
info "Configuration du projet pour utiliser le SDK..."

# Créer le fichier local.properties
LOCAL_PROPERTIES_FILE="$PWD/android/local.properties"

if [ ! -d "$PWD/android" ]; then
    info "Le dossier android sera créé lors du build"
fi

# Exporter les variables pour la session actuelle
export ANDROID_HOME="$FOUND_SDK"
export ANDROID_SDK_ROOT="$FOUND_SDK"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"

success "Variables d'environnement configurées pour cette session:"
echo "  ANDROID_HOME=$ANDROID_HOME"
echo "  ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Créer un fichier .env.local pour les futurs builds
echo ""
info "Création du fichier de configuration locale..."

cat > .android-sdk-config << EOF
# Configuration Android SDK pour builds locaux
# Source ce fichier avant de lancer un build: source .android-sdk-config

export ANDROID_HOME="$FOUND_SDK"
export ANDROID_SDK_ROOT="$FOUND_SDK"
export PATH="\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
EOF

success "Fichier .android-sdk-config créé"

# Vérifier les composants du SDK
echo ""
info "Vérification des composants du SDK..."

if [ -d "$ANDROID_HOME/platforms" ]; then
    PLATFORMS=$(ls "$ANDROID_HOME/platforms" 2>/dev/null | wc -l)
    if [ "$PLATFORMS" -gt 0 ]; then
        success "Plateformes Android installées: $PLATFORMS"
        ls "$ANDROID_HOME/platforms" | head -3
    else
        error "Aucune plateforme Android installée"
    fi
fi

if [ -d "$ANDROID_HOME/build-tools" ]; then
    BUILD_TOOLS=$(ls "$ANDROID_HOME/build-tools" 2>/dev/null | wc -l)
    if [ "$BUILD_TOOLS" -gt 0 ]; then
        success "Build-tools installés: $BUILD_TOOLS"
        ls "$ANDROID_HOME/build-tools" | head -3
    else
        error "Aucun build-tools installé"
    fi
fi

echo ""
echo "===================================================="
success "Configuration terminée!"
echo "===================================================="
echo ""
echo "Pour que les modifications persistent entre les sessions, ajoutez ceci à votre ~/.bashrc:"
echo ""
echo "export ANDROID_HOME=\"$FOUND_SDK\""
echo "export ANDROID_SDK_ROOT=\"$FOUND_SDK\""
echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools\""
echo ""
echo "Ou sourcez le fichier de config avant chaque build:"
echo "  source .android-sdk-config"
echo ""

# Proposer d'ajouter au .bashrc
read -p "Voulez-vous ajouter ces variables à ~/.bashrc maintenant? (o/n): " add_to_bashrc

if [ "$add_to_bashrc" = "o" ] || [ "$add_to_bashrc" = "O" ]; then
    if ! grep -q "ANDROID_HOME.*$FOUND_SDK" ~/.bashrc 2>/dev/null; then
        echo "" >> ~/.bashrc
        echo "# Android SDK configuration (ajouté par setup-android-sdk.sh)" >> ~/.bashrc
        echo "export ANDROID_HOME=\"$FOUND_SDK\"" >> ~/.bashrc
        echo "export ANDROID_SDK_ROOT=\"$FOUND_SDK\"" >> ~/.bashrc
        echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools\"" >> ~/.bashrc
        success "Variables ajoutées à ~/.bashrc"
        echo "Redémarrez votre terminal ou exécutez: source ~/.bashrc"
    else
        info "ANDROID_HOME déjà configuré dans ~/.bashrc"
    fi
fi

echo ""
info "Vous pouvez maintenant lancer le build avec:"
echo "  source .android-sdk-config && ./build-apk.sh"
