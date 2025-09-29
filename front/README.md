# GoSOTRAL Frontend

Application mobile React Native/Expo pour le système de billetterie GoSOTRAL.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Backend GoSOTRAL démarré (voir `/back/README.md`)
- Expo CLI (optionnel, inclus dans le projet)

### Installation et Lancement

```bash
# Installer les dépendances
cd /home/connect/kev/Go/front
npm install

# Démarrer l'application
npm run android    # Pour Android
npm run ios        # Pour iOS  
npm run web        # Pour le navigateur

# Ou démarrer Expo et choisir la plateforme
npm start
```

### Premier Test

1. Lance l'app sur ton appareil/simulateur
2. Tu arriveras sur le **Dev Menu** automatiquement
3. Teste **Configuration Réseau** pour vérifier la connexion backend
4. Utilise **Test Connectivité Réseau** en cas de problème

---

## 🌐 Configuration Réseau

L'app s'adapte automatiquement à ton environnement :

### Détection Automatique

- **Production** : `https://go-j2rr.onrender.com` (priorité)
- **Android Emulator** : `https://go-j2rr.onrender.com`
- **iOS Simulator** : `https://go-j2rr.onrender.com`
- **Appareil physique** : `https://go-j2rr.onrender.com`
- **Web** : `https://go-j2rr.onrender.com`

### Ajouter des Endpoints

Via **Dev Menu** > **Configuration Réseau** :

- URL de déploiement Railway : `https://ton-app.up.railway.app`
- URL de déploiement Render : `https://ton-app.onrender.com`
- Tunnel ngrok : `https://abc123.ngrok.io`

### En cas de problème réseau

1. **Dev Menu** > **Test Connectivité Réseau**
2. Vérifier que le backend est démarré : `curl http://192.168.1.184:7000/health`
3. **Configuration Réseau** > **Rafraîchir** pour forcer la redétection

---

## 🎯 Fonctionnalités

### 🎫 Billetterie

- **Consultation des billets** : Voir tous les produits de tickets disponibles
- **Gestion des trajets** : Filtrer les trajets par catégorie de prix (T100, T150, T200, T250, T300)
- **Mes tickets** : Visualiser ses tickets avec QR codes pour validation
- **Paiement mobile** : Support des paiements mobile money, carte et USSD

### 🔧 Outils de Développement

- **Dev Menu** : Interface de navigation pour développeurs
- **Test de connexion** : Diagnostic de la connexion API en temps réel
- **Configuration réseau** : Gestion des endpoints dynamiques
- **Tests backend** : Validation des services (auth, tickets, payments)

### 📱 Interface utilisateur

1. **Écran d'accueil** : Navigation principale et présentation des fonctionnalités
2. **Billets disponibles** : Liste des produits avec filtres par catégorie
3. **Mes tickets** : Gestion des tickets personnels avec QR codes
4. **Tests & diagnostics** : Outils de développement intégrés

---

## 🔧 Scripts Disponibles

```bash
# Développement
npm start          # Démarre Expo avec menu interactif
npm run android    # Lance sur Android (emulator/device)
npm run ios        # Lance sur iOS (simulator/device)  
npm run web        # Lance dans le navigateur

# Build
npm run build      # Build pour production web

# Maintenance
npx expo start --clear        # Nettoie le cache Expo
npx expo install --fix       # Répare les dépendances
```

---

## 📁 Structure du Projet

```text
front/
├── app/                     # Pages de l'application (Expo Router)
│   ├── _layout.tsx         # Layout principal
│   ├── index.tsx           # Page d'accueil (Dev Menu)
│   ├── login.tsx           # Page de connexion
│   ├── register.tsx        # Page d'inscription
│   ├── network-test.tsx    # Tests de connectivité
│   ├── network-config.tsx  # Configuration réseau
│   └── (tabs)/             # Interface principale avec onglets
├── src/
│   ├── components/         # Composants réutilisables
│   ├── services/          # API client et services
│   │   ├── apiClient.ts   # Client HTTP avec gestion réseau intelligente
│   │   ├── authService.ts # Service d'authentification
│   │   └── ...
│   ├── utils/             # Utilitaires
│   │   ├── network.ts     # Tests de connectivité
│   │   └── networkManager.ts # Gestion dynamique des endpoints
│   ├── types/             # Types TypeScript
│   └── config/            # Configuration de l'app
└── assets/                # Images, fonts, etc.
```

---

## 🌍 Déploiement & Distribution

### Développement

- L'app fonctionne directement avec le backend local
- Utilise Expo Go sur ton téléphone pour tester rapidement

### Test avec Backend Déployé

1. Déploie le backend (voir `/back/README.md`)
2. Ajoute l'URL dans **Configuration Réseau**
3. L'app basculera automatiquement sur le déploiement

### Production

```bash
# Build pour les stores
npx expo build:android
npx expo build:ios

# Ou utiliser EAS (Expo Application Services)
npm install -g @expo/eas-cli
eas build --platform all
```

---

## 🚨 Dépannage

### "Network Error" ou "Connection failed"

1. ✅ Vérifie que le backend est démarré : `docker compose ps` dans `/back/`
2. ✅ Teste l'endpoint : `curl http://192.168.1.184:7000/health`
3. ✅ **Dev Menu** > **Test Connectivité Réseau**
4. ✅ **Configuration Réseau** > **Rafraîchir**

### App ne se lance pas

```bash
# Nettoyer le cache
npx expo start --clear

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Réparer les dépendances Expo
npx expo install --fix
```

### Build échoue

```bash
# Vérifier la compatibilité Expo
npx expo doctor

# Mettre à jour Expo
npx expo upgrade
```

---

## 🔗 Liens Utiles

- **Backend README** : `/back/README.md`
- **Solutions Réseau** : `/SOLUTIONS_RESEAU.md`
- **Expo Documentation** : [https://docs.expo.dev/](https://docs.expo.dev/)
- **React Native** : [https://reactnative.dev/](https://reactnative.dev/)

---

## 👨‍💻 Développement

### Variables d'environnement

Les URLs d'API sont gérées automatiquement par le `NetworkManager`.
Pas besoin de fichier `.env` pour le développement.

### Hot Reload

Les modifications du code se reflètent automatiquement dans l'app grâce à Expo.

### Debugging

- **Logs** : Visibles dans la console Expo
- **React DevTools** : Disponible avec l'extension navigateur
- **Network Inspector** : Via **Dev Menu** > **Test Connectivité**

---

## 📄 Licence

ISC
