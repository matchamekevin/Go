# 📱 GoSOTRAL Scan - Application de Contrôle

Application mobile React Native / Expo pour scanner et valider les tickets QR Code des passagers SOTRAL.

## 🚀 Technologies

- **React Native** avec **Expo SDK 54**
- **TypeScript** pour la sécurité des types
- **Expo Router** pour la navigation
- **Expo Camera** pour le scan QR Code
- **AsyncStorage** pour le stockage local
- **Axios** pour les appels API

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer l'application en développement
npx expo start --port 8083

# Build Android
npx expo run:android

# Build iOS
npx expo run:ios
```

## 🔧 Configuration

### API Backend

L'application se connecte au backend GoSOTRAL en production :

```typescript
// src/config/index.ts
export const API_BASE_URL = 'https://go-j2rr.onrender.com'
```

### Routes de l'API utilisées

- `POST /api/tickets/validate` - Validation d'un ticket par code QR
- `GET /api/scan/stats` - Statistiques des scans
- `GET /api/scan/history` - Historique des scans
- `GET /health` - Vérification santé du serveur

## 📱 Fonctionnalités

### 🏠 Écran d'accueil (`/`)
- Vue d'ensemble de l'application
- Accès rapide au scanner
- Statistiques du jour (maquette)
- Navigation vers l'historique

### 📷 Scanner QR (`/scanner`)
- Scan de codes QR en temps réel
- Feedback haptique (vibrations)
- Validation immédiate des tickets
- Affichage détaillé des informations du ticket
- Gestion des erreurs réseau

### 📊 Historique (`/history`)
- Liste des tickets scannés
- Filtrage par statut (valide, invalide, déjà utilisé, expiré)
- Rafraîchissement manuel
- Statistiques globales

## 🎯 Statuts de validation

| Statut | Description | Couleur |
|--------|-------------|---------|
| `valid` | Ticket valide et utilisable | 🟢 Vert |
| `invalid` | Ticket invalide | 🔴 Rouge |
| `already_used` | Ticket déjà utilisé | 🟡 Jaune |
| `expired` | Ticket expiré | 🔴 Rouge |
| `not_found` | Ticket introuvable | 🔴 Rouge |

## 🔐 Authentification

L'application utilise un système de token JWT stocké dans AsyncStorage :

```typescript
// Stockage du token
await apiClient.setToken(token)

// Récupération du token
const token = await apiClient.getToken()

// Suppression du token
await apiClient.removeToken()
```

## 🐛 Debugging

L'application intègre des logs détaillés en mode développement :

```typescript
// Activer le debug
export const Config = {
  debug: __DEV__ || false,
  // ...
}
```

Logs disponibles :
- 🔍 Requêtes API
- ✅ Réponses API réussies
- ❌ Erreurs API
- 🎫 Validation de tickets
- 🔗 État de connexion

## 📝 Structure du projet

```
scan/
├── App.js                    # Point d'entrée
├── app/                      # Routes Expo Router
│   ├── _layout.tsx          # Layout principal
│   ├── index.tsx            # Écran d'accueil
│   ├── scanner.tsx          # Scanner QR
│   └── history.tsx          # Historique
├── src/
│   ├── config/
│   │   └── index.ts         # Configuration API
│   ├── services/
│   │   ├── apiClient.ts     # Client HTTP Axios
│   │   └── scanService.ts   # Service de scan
│   └── types/
│       └── api.ts           # Types TypeScript
├── assets/                   # Images et icônes
└── package.json
```

## 🔄 Workflow de scan

1. **Ouverture du scanner** → Demande permission caméra
2. **Scan du QR Code** → Détection automatique
3. **Envoi à l'API** → `POST /api/tickets/validate`
4. **Feedback utilisateur** → Vibration + Alerte
5. **Sauvegarde locale** → Historique AsyncStorage

## ⚠️ Gestion des erreurs

L'application gère plusieurs types d'erreurs :

- **Erreurs réseau** → Message "Vérifiez votre connexion"
- **Erreurs 400** → Code QR invalide
- **Erreurs 401** → Session expirée
- **Erreurs 404** → Ticket introuvable
- **Erreurs 500** → Erreur serveur

## 📱 Compatibilité

- **Android** : API 21+ (Android 5.0+)
- **iOS** : iOS 13+
- **Expo Go** : Supporté
- **Development Build** : Recommandé

## 🚀 Déploiement

### Build de production

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

### Variables d'environnement

```env
API_BASE_URL=https://go-j2rr.onrender.com
```

## 👥 Contributeurs

Développé pour **SOTRAL** - Système de transport en commun

## 📄 Licence

Propriétaire - © 2024-2025 GoSOTRAL

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2 octobre 2025
