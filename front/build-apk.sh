#!/bin/bash

# Script pour compiler l'APK de l'application Go
# Ce script automatise le processus de build avec EAS

set -e

echo "🚀 Script de compilation APK pour l'application Go"
echo "=================================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ Erreur: app.json non trouvé. Assurez-vous d'être dans le dossier front/${NC}"
    exit 1
fi

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Fonction pour afficher un message d'information
info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Fonction pour afficher un avertissement
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Vérifier si EAS CLI est installé
info "Vérification de EAS CLI..."
if ! command -v eas &> /dev/null; then
    error "EAS CLI n'est pas installé. Installation en cours..."
    npm install -g eas-cli
    success "EAS CLI installé avec succès"
else
    success "EAS CLI est installé"
fi

# Vérifier si Yarn est installé
info "Vérification de Yarn..."
if ! command -v yarn &> /dev/null; then
    error "Yarn n'est pas installé. Installation en cours..."
    npm install -g yarn
    success "Yarn installé avec succès"
else
    success "Yarn est installé"
fi

# Vérifier la connexion à Expo
info "Vérification de la connexion Expo..."
if eas whoami &> /dev/null; then
    USERNAME=$(eas whoami)
    success "Connecté en tant que: $USERNAME"
else
    error "Non connecté à Expo. Veuillez vous connecter:"
    eas login
fi

echo ""
echo "=================================================="
echo "Options de compilation disponibles:"
echo "=================================================="
echo "1. Build local (nécessite Android SDK)"
echo "2. Build sur serveurs Expo (nécessite un plan payant ou quota disponible)"
echo "3. Annuler"
echo ""

read -p "Choisissez une option (1-3): " choice

case $choice in
    1)
        info "Lancement du build local..."
        warning "Cela peut prendre 15-30 minutes selon votre machine"
        echo ""

        # Vérifier si Android SDK est installé
        if [ -z "$ANDROID_HOME" ]; then
            error "ANDROID_HOME n'est pas défini. Vérifiez votre installation Android SDK."
            exit 1
        fi

        success "Android SDK trouvé: $ANDROID_HOME"
        echo ""

        # Lancer le build local
        eas build --platform android --profile preview --local

        if [ $? -eq 0 ]; then
            success "Build terminé avec succès!"
            info "L'APK devrait se trouver dans le répertoire courant ou dans /tmp/"

            # Chercher l'APK généré
            APK_FILE=$(find /tmp -name "*.apk" -type f -mmin -60 2>/dev/null | head -1)
            if [ -n "$APK_FILE" ]; then
                success "APK trouvé: $APK_FILE"

                # Copier l'APK dans le répertoire courant
                cp "$APK_FILE" ./GoSOTRAL.apk
                success "APK copié dans le répertoire courant: GoSOTRAL.apk"

                # Afficher la taille du fichier
                SIZE=$(du -h ./GoSOTRAL.apk | cut -f1)
                info "Taille du fichier: $SIZE"
            fi
        else
            error "Échec du build"
            exit 1
        fi
        ;;

    2)
        info "Lancement du build sur les serveurs Expo..."
        warning "Vérifiez que vous avez des builds disponibles dans votre quota"
        echo ""

        eas build --platform android --profile preview

        if [ $? -eq 0 ]; then
            success "Build lancé avec succès!"
            info "Vous recevrez un lien pour télécharger l'APK une fois la compilation terminée"
            info "Vous pouvez suivre la progression sur: https://expo.dev/accounts/$USERNAME/builds"
        else
            error "Échec du lancement du build"
            exit 1
        fi
        ;;

    3)
        info "Opération annulée"
        exit 0
        ;;

    *)
        error "Option invalide"
        exit 1
        ;;
esac

echo ""
echo "=================================================="
success "Script terminé!"
echo "=================================================="

# Instructions pour installer l'APK
echo ""
info "Pour installer l'APK sur votre appareil Android:"
echo "  1. Activez 'Sources inconnues' dans les paramètres de sécurité"
echo "  2. Transférez l'APK sur votre appareil"
echo "  3. Ouvrez le fichier APK pour l'installer"
echo ""
info "Pour tester via USB:"
echo "  adb install -r GoSOTRAL.apk"
echo ""
