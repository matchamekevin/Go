# 🚀 Commandes Rapides - Application Go

## 📱 Compilation de l'APK

### Méthode recommandée (avec script)
```bash
./build-apk.sh
```

### Build local (gratuit, illimité)
```bash
eas build --platform android --profile preview --local
```

### Build sur serveurs Expo (nécessite quota)
```bash
eas build --platform android --profile preview
```

### Build production
```bash
eas build --platform android --profile production --local
```

---

## 🔍 Trouver et installer l'APK

### Trouver l'APK généré
```bash
./find-apk.sh
```

### Installer sur appareil connecté
```bash
adb install -r GoSOTRAL.apk
```

### Forcer la réinstallation
```bash
adb install -r -d GoSOTRAL.apk
```

---

## 🎨 Icônes

### Régénérer toutes les icônes
```bash
python3 scripts/icon-generator/generate_icons.py
```

### Vérifier les icônes existantes
```bash
ls -lh assets/images/*.png
```

---

## 🔧 Vérifications et diagnostics

### Vérifier la connexion Expo
```bash
eas whoami
```

### Se connecter à Expo
```bash
eas login
```

### Vérifier Android SDK
```bash
echo $ANDROID_HOME
```

### Vérifier Java
```bash
java -version
```

### Voir les builds précédents
```bash
eas build:list
```

---

## 📱 Tester sur appareil

### Lister les appareils connectés
```bash
adb devices
```

### Installer l'APK
```bash
adb install -r GoSOTRAL.apk
```

### Lancer l'application
```bash
adb shell am start -n com.matchamekevin.gosotral/.MainActivity
```

### Voir les logs en temps réel
```bash
adb logcat | grep GoSOTRAL
```

### Désinstaller l'application
```bash
adb uninstall com.matchamekevin.gosotral
```

---

## 📦 Informations sur l'APK

### Taille du fichier
```bash
du -h GoSOTRAL.apk
```

### Informations détaillées
```bash
aapt dump badging GoSOTRAL.apk
```

### Hash MD5 de l'APK
```bash
md5sum GoSOTRAL.apk
```

---

## 🛠️ Développement

### Démarrer le serveur Expo
```bash
npm run dev
# ou
expo start --port 8082
```

### Lancer sur Android (émulateur/appareil)
```bash
npm run android
```

### Installer les dépendances
```bash
npm install
```

### Installer avec Yarn
```bash
yarn install
```

---

## 📋 Maintenance

### Nettoyer le cache
```bash
expo start -c
```

### Nettoyer node_modules et réinstaller
```bash
rm -rf node_modules
npm install
```

### Mettre à jour EAS CLI
```bash
npm install -g eas-cli
```

### Mettre à jour les dépendances Expo
```bash
npx expo install --fix
```

---

## 🌐 URLs utiles

### Dashboard Expo (voir les builds)
```
https://expo.dev/accounts/matchamekevin/builds
```

### Projet sur Expo
```
https://expo.dev/accounts/matchamekevin/projects/gosotral
```

### Paramètres de facturation
```
https://expo.dev/accounts/matchamekevin/settings/billing
```

---

## ⚡ Raccourcis super rapides

### Tout en une commande : Icônes + Build + Trouver APK
```bash
python3 scripts/icon-generator/generate_icons.py && \
eas build --platform android --profile preview --local && \
./find-apk.sh
```

### Build + Install sur appareil
```bash
eas build --platform android --profile preview --local && \
./find-apk.sh && \
adb install -r GoSOTRAL.apk
```

---

## 🆘 Dépannage rapide

### Problème de quota builds
```bash
# Utiliser le build local au lieu des serveurs
eas build --local
```

### Yarn non trouvé
```bash
npm install -g yarn
```

### ANDROID_HOME non défini
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Nettoyer complètement
```bash
rm -rf node_modules
rm -rf .expo
npm install
```

### Forcer la réinstallation d'une APK qui refuse
```bash
adb uninstall com.matchamekevin.gosotral
adb install GoSOTRAL.apk
```

---

## 📝 Notes importantes

- **Build local** : Gratuit et illimité, mais nécessite Android SDK
- **Build Expo** : Limité par le quota mensuel (plan gratuit)
- **APK vs AAB** : APK pour installation directe, AAB pour Google Play Store
- **Version** : Le versionCode s'auto-incrémente en mode production

---

**Dernière mise à jour :** 2025
**Pour plus d'infos :** Voir BUILD_APK_GUIDE.md et RESUME.md