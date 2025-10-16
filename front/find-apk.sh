#!/bin/bash

# Script pour trouver et copier l'APK généré par EAS Build
# Ce script recherche l'APK dans les emplacements courants

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Recherche de l'APK généré...${NC}"
echo ""

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

# Chercher dans les emplacements courants
APK_FOUND=0
APK_FILES=()

info "Recherche dans le répertoire courant..."
if ls *.apk 1> /dev/null 2>&1; then
    for apk in *.apk; do
        APK_FILES+=("$apk")
        APK_FOUND=1
    done
fi

info "Recherche dans /tmp..."
while IFS= read -r -d '' apk; do
    APK_FILES+=("$apk")
    APK_FOUND=1
done < <(find /tmp -name "*.apk" -type f -mmin -120 -print0 2>/dev/null)

info "Recherche dans le répertoire home..."
while IFS= read -r -d '' apk; do
    APK_FILES+=("$apk")
    APK_FOUND=1
done < <(find ~ -name "*.apk" -type f -mmin -120 -maxdepth 3 -print0 2>/dev/null)

echo ""

if [ $APK_FOUND -eq 0 ]; then
    error "Aucun APK trouvé récemment (dernières 2 heures)"
    echo ""
    info "Assurez-vous que la compilation est terminée"
    info "Vous pouvez également télécharger l'APK depuis:"
    info "https://expo.dev/accounts/$(eas whoami 2>/dev/null || echo 'votre-compte')/builds"
    exit 1
fi

echo -e "${GREEN}✓ ${#APK_FILES[@]} APK trouvé(s)${NC}"
echo ""

# Afficher la liste des APK trouvés
echo "=================================================="
echo "APK trouvés:"
echo "=================================================="

for i in "${!APK_FILES[@]}"; do
    apk="${APK_FILES[$i]}"
    size=$(du -h "$apk" | cut -f1)
    date=$(stat -c %y "$apk" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1 || stat -f "%Sm" "$apk" 2>/dev/null)

    echo ""
    echo -e "${BLUE}[$((i+1))]${NC} $(basename "$apk")"
    echo "    Chemin: $apk"
    echo "    Taille: $size"
    echo "    Modifié: $date"
done

echo ""
echo "=================================================="

# Si un seul APK trouvé, le copier automatiquement
if [ ${#APK_FILES[@]} -eq 1 ]; then
    apk="${APK_FILES[0]}"

    if [ ! -f "./GoSOTRAL.apk" ] || [ "$apk" -nt "./GoSOTRAL.apk" ]; then
        info "Copie de l'APK dans le répertoire courant..."
        cp "$apk" ./GoSOTRAL.apk
        success "APK copié: ./GoSOTRAL.apk"

        # Afficher les informations
        echo ""
        info "Informations sur l'APK:"
        size=$(du -h ./GoSOTRAL.apk | cut -f1)
        echo "  - Nom: GoSOTRAL.apk"
        echo "  - Taille: $size"
        echo "  - Chemin: $(pwd)/GoSOTRAL.apk"

        echo ""
        success "APK prêt pour l'installation!"
        echo ""
        info "Pour installer sur un appareil connecté:"
        echo "  adb install -r GoSOTRAL.apk"
        echo ""
        info "Pour transférer via USB:"
        echo "  Copiez le fichier GoSOTRAL.apk sur votre appareil"
    else
        info "L'APK GoSOTRAL.apk existe déjà et est à jour"
        echo "  Chemin: $(pwd)/GoSOTRAL.apk"
    fi
else
    # Plusieurs APK trouvés, demander à l'utilisateur
    echo ""
    read -p "Choisissez un APK à copier (1-${#APK_FILES[@]}), ou 0 pour annuler: " choice

    if [ "$choice" -eq 0 ]; then
        info "Opération annulée"
        exit 0
    elif [ "$choice" -ge 1 ] && [ "$choice" -le ${#APK_FILES[@]} ]; then
        apk="${APK_FILES[$((choice-1))]}"
        info "Copie de l'APK sélectionné..."
        cp "$apk" ./GoSOTRAL.apk
        success "APK copié: ./GoSOTRAL.apk"

        echo ""
        info "Informations sur l'APK:"
        size=$(du -h ./GoSOTRAL.apk | cut -f1)
        echo "  - Nom: GoSOTRAL.apk"
        echo "  - Taille: $size"
        echo "  - Chemin: $(pwd)/GoSOTRAL.apk"

        echo ""
        success "APK prêt pour l'installation!"
        echo ""
        info "Pour installer sur un appareil connecté:"
        echo "  adb install -r GoSOTRAL.apk"
    else
        error "Choix invalide"
        exit 1
    fi
fi

echo ""

# Vérifier si un appareil Android est connecté
if command -v adb &> /dev/null; then
    if adb devices | grep -q "device$"; then
        echo ""
        warning "Un appareil Android est connecté!"
        read -p "Voulez-vous installer l'APK maintenant? (o/n): " install_now

        if [ "$install_now" = "o" ] || [ "$install_now" = "O" ]; then
            info "Installation en cours..."
            if adb install -r ./GoSOTRAL.apk; then
                success "Application installée avec succès!"

                read -p "Voulez-vous lancer l'application? (o/n): " launch_now
                if [ "$launch_now" = "o" ] || [ "$launch_now" = "O" ]; then
                    adb shell am start -n com.matchamekevin.gosotral/.MainActivity
                    success "Application lancée!"
                fi
            else
                error "Échec de l'installation"
                exit 1
            fi
        fi
    fi
fi

echo ""
info "Script terminé!"
