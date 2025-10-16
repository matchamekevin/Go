# Guide de Compilation APK pour l'Application Go

Ce guide vous explique comment compiler votre application Go en APK avec Expo EAS Build.

## 📱 Icônes de l'Application

### Icônes générées

Les icônes suivantes ont été créées automatiquement avec un design "Go" professionnel :

- **icon.png** (1024x1024) - Icône principale de l'application
- **adaptive-icon.png** (1024x1024) - Icône adaptative pour Android
- **splash-icon.png** (1242x2436) - Écran de démarrage
- **favicon.png** (48x48) - Icône pour le web

### Design des icônes

- Fond bleu moderne (#007AFF - style iOS)
- Texte "Go" en blanc, centré
- Police en gras pour une meilleure visibilité
- Compatible avec tous les appareils Android

### Régénérer les icônes

Si vous souhaitez régénérer les icônes :

```bash
python3 scripts/icon-generator/generate_icons.py
```

## 🏗️ Compilation de l'APK

### Prérequis

1. **Node.js** et **npm** installés
2. **EAS CLI** installé globalement :
   ```bash
   npm install -g eas-cli
   ```
3. **Yarn** installé (pour le build local) :
   ```bash
   npm install -g yarn
   ```
4. Compte Expo connecté :
   ```bash
   eas login
   ```

### Méthode 1 : Build avec le script automatisé (Recommandé)

Le script `build-apk.sh` automatise tout le processus :

```bash
./build-apk.sh
```

Le script vous proposera deux options :
1. **Build local** - Compile sur votre machine (gratuit, nécessite Android SDK)
2. **Build sur serveurs Expo** - Compile sur les serveurs Expo (nécessite quota ou plan payant)

### Méthode 2 : Build manuel

#### Option A : Build local (gratuit)

```bash
eas build --platform android --profile preview --local
```

**Avantages :**
- ✅ Gratuit et illimité
- ✅ Plus rapide si vous avez une bonne machine
- ✅ Pas de limite de quota

**Prérequis :**
- Android SDK installé
- Variable d'environnement `ANDROID_HOME` configurée
- Au moins 8 GB de RAM disponible

#### Option B : Build sur serveurs Expo

```bash
eas build --platform android --profile preview
```

**Avantages :**
- ✅ Pas besoin d'Android SDK
- ✅ Build dans le cloud
- ✅ Peut être lancé depuis n'importe quelle machine

**Inconvénients :**
- ❌ Limité par le quota mensuel (plan gratuit)
- ❌ Peut prendre 15-20 minutes

### Méthode 3 : Build en production

Pour une version de production avec auto-incrémentation du numéro de version :

```bash
eas build --platform android --profile production
```

## 📦 Profils de Build Disponibles

Le fichier `eas.json` définit 3 profils :

### 1. Development
```json
"development": {
  "developmentClient": true,
  "distribution": "internal"
}
```
- Pour le développement avec Expo Dev Client
- Distribution interne uniquement

### 2. Preview (Recommandé pour les tests)
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- Génère un fichier APK
- Distribution interne
- Idéal pour les tests

### 3. Production
```json
"production": {
  "autoIncrement": true,
  "android": {
    "buildType": "apk"
  }
}
```
- Version finale
- Auto-incrémentation du `versionCode`
- APK pour distribution

## 📲 Installation de l'APK

### Sur un appareil Android réel

1. **Activer les sources inconnues :**
   - Paramètres → Sécurité → Sources inconnues (activer)
   - Ou : Paramètres → Applications → Accès spécial → Installer des applications inconnues

2. **Transférer l'APK :**
   - Via USB : copier le fichier APK sur l'appareil
   - Via email/cloud : envoyer l'APK et le télécharger sur l'appareil
   - Via ADB : `adb install -r GoSOTRAL.apk`

3. **Installer :**
   - Ouvrir le fichier APK depuis le gestionnaire de fichiers
   - Suivre les instructions d'installation

### Via ADB (Android Debug Bridge)

Si vous avez ADB installé :

```bash
# Installer l'APK
adb install -r GoSOTRAL.apk

# Ou forcer la réinstallation
adb install -r -d GoSOTRAL.apk
```

## 🔧 Dépannage

### Erreur : "This account has used its Android builds"

**Problème :** Vous avez atteint la limite de builds gratuits du mois.

**Solutions :**
1. Utiliser le build local : `eas build --local`
2. Attendre la réinitialisation du quota (indiqué dans le message d'erreur)
3. Upgrader vers un plan payant

### Erreur : "yarn: command not found"

**Solution :**
```bash
npm install -g yarn
```

### Erreur : "ANDROID_HOME not set"

**Solution :**
```bash
# Trouver votre Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Ajouter à ~/.bashrc ou ~/.zshrc pour rendre permanent
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools' >> ~/.bashrc
```

### Build local échoue

**Vérifications :**
1. Android SDK installé avec les bonnes versions
2. Java 17+ installé : `java -version`
3. Assez d'espace disque (au moins 10 GB)
4. Assez de RAM (au moins 8 GB)

## 📊 Informations de Build

### Configuration actuelle

- **Nom de l'app :** Go
- **Package :** com.matchamekevin.gosotral
- **Version :** 1.0.0
- **SDK Expo :** 54.0.0
- **Target SDK Android :** 34
- **Compile SDK Android :** 34

### Permissions Android

L'application demande les permissions suivantes :
- `INTERNET` - Pour les appels réseau
- `CAMERA` - Pour scanner les QR codes
- `READ_EXTERNAL_STORAGE` - Pour lire les fichiers
- `WRITE_EXTERNAL_STORAGE` - Pour sauvegarder les fichiers

## 🚀 Après la Compilation

### Vérifier l'APK

```bash
# Taille du fichier
du -h GoSOTRAL.apk

# Informations sur l'APK
aapt dump badging GoSOTRAL.apk
```

### Tester l'installation

```bash
# Installer sur un appareil connecté
adb install -r GoSOTRAL.apk

# Lancer l'application
adb shell am start -n com.matchamekevin.gosotral/.MainActivity

# Voir les logs
adb logcat | grep GoSOTRAL
```

## 📝 Notes Importantes

1. **Type de build :** L'APK généré est de type APK (pas AAB). Pour publier sur Google Play Store, vous devrez utiliser le format AAB.

2. **Signature :** L'application est automatiquement signée avec les credentials stockés sur Expo.

3. **Version :** Le `versionCode` est auto-incrémenté en mode production.

4. **Distribution :** Les profils `preview` et `development` sont configurés pour une distribution interne uniquement.

## 🔗 Ressources Utiles

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Configuration app.json](https://docs.expo.dev/versions/latest/config/app/)
- [Android Build Configuration](https://docs.expo.dev/build-reference/android-builds/)
- [EAS CLI Reference](https://docs.expo.dev/eas/cli/)

## 💡 Conseils

1. **Premier build :** Le premier build local peut prendre 20-30 minutes car il doit télécharger toutes les dépendances.

2. **Builds suivants :** Les builds suivants seront plus rapides grâce au cache.

3. **Espace disque :** Assurez-vous d'avoir au moins 10 GB d'espace libre pour le build local.

4. **Tests :** Testez toujours sur un appareil réel avant la distribution finale.

5. **Logs :** En cas de problème, consultez les logs complets dans le terminal.

---

**Créé le :** 2025
**Dernière mise à jour :** Aujourd'hui
**Auteur :** Assistant AI