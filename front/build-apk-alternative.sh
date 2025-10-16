#!/bin/bash

# Script alternatif pour compiler l'APK de l'application Go
# Utilise npx expo pour générer un APK directement sans EAS Build

set -e

echo "🚀 Script alternatif de compilation APK pour l'application Go"
echo "=============================================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Vérifier si on est dans le bon répertoire
if [ ! -f "app.json" ]; then
    error "Erreur: app.json non trouvé. Assurez-vous d'être dans le dossier front/"
    exit 1
fi

info "Vérification des prérequis..."
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi
success "Node.js installé: $(node --version)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi
success "npm installé: $(npm --version)"

# Vérifier expo-cli
if ! command -v npx &> /dev/null; then
    error "npx n'est pas disponible"
    exit 1
fi
success "npx disponible"

echo ""
echo "=============================================================="
echo "OPTIONS DE COMPILATION"
echo "=============================================================="
echo ""
echo "Ce script offre plusieurs méthodes pour générer votre APK:"
echo ""
echo "1. Build APK avec Expo (Android Studio requis)"
echo "2. Générer le projet Android natif pour build manuel"
echo "3. Créer un fichier .aab pour Google Play Store (EAS required)"
echo "4. Instructions pour build avec Android Studio"
echo "5. Retour"
echo ""

read -p "Choisissez une option (1-5): " choice

case $choice in
    1)
        info "Option 1: Build APK avec Expo..."
        echo ""
        warning "Cette méthode nécessite Android Studio et le SDK Android configuré"
        echo ""

        read -p "Continuer? (o/n): " continue_build

        if [ "$continue_build" != "o" ] && [ "$continue_build" != "O" ]; then
            info "Build annulé"
            exit 0
        fi

        info "Génération du projet Android natif..."
        npx expo prebuild --platform android --clean

        info "Installation des dépendances..."
        npm install

        info "Build de l'APK..."
        cd android

        if [ -f "gradlew" ]; then
            chmod +x gradlew
            ./gradlew assembleRelease

            if [ $? -eq 0 ]; then
                success "Build terminé avec succès!"

                # Chercher l'APK généré
                APK_PATH=$(find . -name "*.apk" -path "*/build/outputs/apk/release/*" | head -1)

                if [ -n "$APK_PATH" ]; then
                    success "APK trouvé: $APK_PATH"

                    # Copier l'APK dans le répertoire racine
                    cp "$APK_PATH" ../GoSOTRAL.apk
                    success "APK copié dans: GoSOTRAL.apk"

                    SIZE=$(du -h ../GoSOTRAL.apk | cut -f1)
                    info "Taille du fichier: $SIZE"
                else
                    warning "APK non trouvé dans les emplacements attendus"
                fi
            else
                error "Le build a échoué"
                exit 1
            fi
        else
            error "gradlew non trouvé"
            exit 1
        fi
        ;;

    2)
        info "Option 2: Génération du projet Android natif..."
        echo ""
        info "Cette commande va créer le dossier 'android' avec tous les fichiers nécessaires"
        echo ""

        npx expo prebuild --platform android --clean

        success "Projet Android généré dans le dossier 'android/'"
        echo ""
        info "Vous pouvez maintenant:"
        echo "  1. Ouvrir le projet dans Android Studio:"
        echo "     android-studio android/"
        echo ""
        echo "  2. Ou compiler en ligne de commande:"
        echo "     cd android"
        echo "     ./gradlew assembleRelease"
        echo ""
        echo "  L'APK sera dans:"
        echo "     android/app/build/outputs/apk/release/"
        ;;

    3)
        info "Option 3: Build AAB avec EAS..."
        echo ""
        warning "Cette méthode nécessite un compte Expo et utilise les serveurs cloud"
        echo ""

        read -p "Continuer? (o/n): " continue_eas

        if [ "$continue_eas" != "o" ] && [ "$continue_eas" != "O" ]; then
            info "Build annulé"
            exit 0
        fi

        if ! command -v eas &> /dev/null; then
            error "EAS CLI n'est pas installé"
            echo "Installez-le avec: npm install -g eas-cli"
            exit 1
        fi

        info "Connexion à Expo..."
        eas whoami || eas login

        info "Lancement du build AAB..."
        eas build --platform android --profile production

        success "Build lancé sur les serveurs Expo"
        info "Suivez la progression sur: https://expo.dev"
        ;;

    4)
        info "Option 4: Instructions pour Android Studio..."
        echo ""
        echo "════════════════════════════════════════════════════════════════"
        echo "INSTRUCTIONS POUR BUILD AVEC ANDROID STUDIO"
        echo "════════════════════════════════════════════════════════════════"
        echo ""
        echo "1. PRÉPARER LE PROJET:"
        echo "   npx expo prebuild --platform android --clean"
        echo ""
        echo "2. OUVRIR DANS ANDROID STUDIO:"
        echo "   - Lancez Android Studio"
        echo "   - File → Open"
        echo "   - Sélectionnez le dossier 'android'"
        echo ""
        echo "3. CONFIGURER LE PROJET:"
        echo "   - Attendez que Gradle sync se termine"
        echo "   - Tools → SDK Manager"
        echo "   - Installez Android SDK Platform 34"
        echo "   - Installez Build-Tools 34.x.x"
        echo ""
        echo "4. GÉNÉRER L'APK:"
        echo "   - Build → Build Bundle(s) / APK(s) → Build APK(s)"
        echo "   - Attendez la fin de la compilation"
        echo "   - Cliquez sur 'locate' pour trouver l'APK"
        echo ""
        echo "5. L'APK SERA DANS:"
        echo "   android/app/build/outputs/apk/release/app-release.apk"
        echo ""
        echo "════════════════════════════════════════════════════════════════"
        echo ""
        info "Générer le projet Android maintenant? (o/n)"
        read -p "> " gen_now

        if [ "$gen_now" = "o" ] || [ "$gen_now" = "O" ]; then
            npx expo prebuild --platform android --clean
            success "Projet généré! Vous pouvez l'ouvrir dans Android Studio"
        fi
        ;;

    5)
        info "Retour au menu"
        exit 0
        ;;

    *)
        error "Option invalide"
        exit 1
        ;;
esac

echo ""
echo "════════════════════════════════════════════════════════════════"
success "Script terminé!"
echo "════════════════════════════════════════════════════════════════"
