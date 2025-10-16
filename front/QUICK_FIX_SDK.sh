#!/bin/bash

# Script d'installation rapide du SDK Android minimal
# Installe uniquement ce qui est nécessaire pour compiler l'APK

set -e

echo "🚀 Installation rapide du SDK Android"
echo "======================================"
echo ""

# Créer le dossier SDK
SDK_DIR="$HOME/Android/Sdk"
mkdir -p "$SDK_DIR"
cd "$SDK_DIR"

echo "📥 Téléchargement des command-line tools..."
wget -q --show-progress https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdtools.zip

echo "📦 Extraction..."
unzip -q cmdtools.zip -d cmdline-tools
mv cmdline-tools/cmdline-tools cmdline-tools/latest
rm cmdtools.zip

echo "⚙️  Configuration des variables d'environnement..."
export ANDROID_HOME="$SDK_DIR"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

echo "📜 Acceptation des licences..."
yes | sdkmanager --licenses 2>&1 | grep -i "accept\|license" | head -5

echo "📱 Installation des composants Android..."
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

echo "✅ Configuration de ~/.bashrc..."
if ! grep -q "ANDROID_HOME.*Android/Sdk" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Android SDK (ajouté par QUICK_FIX_SDK.sh)" >> ~/.bashrc
    echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.bashrc
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
fi

echo ""
echo "════════════════════════════════════════"
echo "✅ Installation terminée avec succès!"
echo "════════════════════════════════════════"
echo ""
echo "Android SDK installé dans: $SDK_DIR"
echo ""
echo "Pour que les changements prennent effet:"
echo "  source ~/.bashrc"
echo ""
echo "Ensuite, compilez l'APK:"
echo "  cd /home/connect/kev/Go/front"
echo "  ./build-apk.sh"
echo ""

