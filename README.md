# GoSOTRAL - Écosystème Complet

Système de billetterie électronique pour les transports en commun SOTRAL.

## 📁 **Structure Organisée du Projet**

```
├── 📖 docs/                    # Documentation centralisée
│   ├── guides/                # Guides utilisateur & technique
│   ├── deployment/            # Guides de déploiement
│   ├── api/                   # Documentation API
│   └── deployment-solutions.md
├── 🔧 scripts/                 # Scripts automatisation & tests
├── ⚙️ admin/                   # Interface administration Web
├── 🚀 back/                    # Backend Node.js/Express API
├── 📱 front/                   # App mobile utilisateur (React Native)
├── 📱 scan/                    # App mobile scanner QR
├── .gitignore
├── package.json                # Scripts projet
├── README.md                   # Cette documentation
└── TODO.md                     # Notes de développement
```

**✅ Projet réorganisé pour une meilleure maintenance !**

## 🚀 **Démarrage Ultra-Rapide**

### Backend + Frontend en 3 commandes
```bash
# 1. Backend (API + Base de données)
cd /home/connect/kev/Go/back && docker compose up -d --build

# 2. Initialiser la DB
for sql_file in src/schema/*.sql; do docker exec -i back_db_1 psql -U gosotral_user -d gosotral_db < "$sql_file"; done

# 3. Frontend (React Native)
cd /home/connect/kev/Go/front && npm run android
```

### ✅ Vérification rapide

```bash
# Backend OK ?
curl -i http://localhost:7000/health

# App mobile OK ?
# → Dev Menu automatique > Test Connectivité Réseau
```

---

## 🌐 **Accès depuis N'importe quel Réseau**

### Solutions GRATUITES pour accès global :

#### 🎯 Railway (Recommandé - 5 minutes)
```bash
cd /home/connect/kev/Go/back
./deploy.sh railway
# Résultat: https://ton-app.up.railway.app
```
**Gratuit**: 512MB RAM, 500h/mois, PostgreSQL incluse

#### 🎨 Render.com (Alternative)
```bash
cd /home/connect/kev/Go/back  
./deploy.sh render
# Résultat: https://ton-app.onrender.com
```
**Gratuit**: 512MB RAM, 750h/mois, SSL auto

#### 🔗 ngrok (Développement - Accès Public Immédiat)

```bash
# Installation unique
npm install -g ngrok
ngrok config add-authtoken TON_TOKEN_GRATUIT

# Configuration automatique
./setup-ngrok.sh
# Résultat: https://abc123.ngrok.io (public permanent)

# Test de la synchronisation
./test-ngrok-sync.sh
```

**Avantages**: Accès public immédiat, synchronisation partout, gratuit pour développement

### 📱 Configuration App

Après déploiement :

1. App mobile > **Dev Menu** > **Configuration Réseau**
2. Ajoute l'URL obtenue
3. L'app s'adapte automatiquement à ton réseau

---

## 🏗️ **Architecture Complète**

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BACKEND API   │◄──►│  FRONTEND USER  │    │   ADMIN WEB     │
│  (Node.js/TS)   │    │ (React Native)  │    │ (React/TS/Web)  │
│   Port: 7000    │    │  Expo/Mobile    │    │   Port: 3000    │
│                 │    │                 │    │                 │
│ • Auth JWT      │    │ • Achat tickets │    │ • Dashboard     │
│ • CRUD Tickets  │    │ • Gestion profil│    │ • Gestion users │
│ • QR Generation │    │ • Historique    │    │ • Analytics     │
│ • Validation    │    │ • Paiements     │    │ • Rapports      │
│ • Analytics     │    │                 │    │                 │
└─────────┬───────┘    └─────────────────┘    └─────────────────┘
          │                     ▲                       ▲
          │                     │                       │
          │            ┌─────────────────┐              │
          └────────────┤   SCAN MOBILE   ├──────────────┘
                       │ (React Native)  │
                       │                 │
                       │ • Scan QR codes │
                       │ • Validation    │
                       │ • Historique    │
                       │ • Mode offline  │
                       └─────────────────┘
```

---

## 📁 **Structure & Commandes**

### `/back` - API Backend ⭐

```bash
cd /home/connect/kev/Go/back
docker compose up -d --build    # Démarrer
docker compose logs -f api      # Voir les logs
curl http://localhost:7000/health # Tester
```

**Tech**: Node.js + TypeScript + Express + PostgreSQL

### `/front` - App Mobile Utilisateur ⭐

```bash
cd /home/connect/kev/Go/front
npm install && npm run android   # Android
npm run ios                      # iOS
npm run web                      # Navigateur
```

**Tech**: React Native + Expo + TypeScript

### `/admin` - Interface Web Admin

```bash
cd /home/connect/kev/Go/admin
npm install && npm run dev       # Port 3000
```

**Tech**: React + TypeScript + Vite + Tailwind

### `/scan` - App Mobile Scanner

```bash
cd /home/connect/kev/Go/scan
npm install && npm start
```

**Tech**: React Native + Expo (contrôleurs bus)

### `/GoSOTRAL_front` - Version Alternative User

**Tech**: React Native + Expo (version alternative de `/front`)

---

## 🔗 **URLs et Endpoints**

### Backend API (Port 7000)

- `GET /health` - Santé du système
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /tickets/products` - Produits tickets
- `POST /tickets/purchase` - Achat ticket
- `POST /tickets/validate` - Validation (scan)

### Configuration Réseau Automatique

- **Simulateur iOS**: `http://localhost:7000`
- **Android Emulator**: `http://10.0.2.2:7000`
- **Appareil physique**: `http://192.168.1.184:7000`
- **Déploiement cloud**: URL automatiquement détectée

---

## 👥 **Comptes de Test**

### Utilisateur Mobile

- Email: `test@example.com`
- Password: `test123`

### Admin Web

- Email: `admin@gosotral.com`
- Password: `admin123`

---

## ⚠️ **Dépannage Rapide**

### ❌ "Network Error" dans l'app

```bash
# 1. Vérifier le backend
curl http://localhost:7000/health

# 2. Vérifier l'IP machine
hostname -I

# 3. Dans l'app: Dev Menu > Test Connectivité Réseau
```

### ❌ Base de données vide

```bash
cd /home/connect/kev/Go/back
for sql_file in src/schema/*.sql; do 
  docker exec -i back_db_1 psql -U gosotral_user -d gosotral_db < "$sql_file"
done
```

### ❌ Cache Expo

```bash
cd /home/connect/kev/Go/front
npx expo start --clear
```

---

## 💰 **Coûts Solutions Cloud**

| Solution | Gratuit | Payant | URL Fixe | Setup |
|----------|---------|--------|----------|-------|
| **Railway** | ✅ 500h/mois | 5$/mois | ✅ | 5 min |
| **Render** | ✅ 750h/mois | 7$/mois | ✅ | 10 min |
| **ngrok** | ✅ 1 tunnel | 8$/mois | ❌ Temporaire | 1 min |

**💡 Recommandation**: Railway gratuit pour commencer → Railway payant quand tu dépasses

---

## ⚡ **Synchronisation Temps Réel Complète**

Toutes les actions se synchronisent automatiquement entre tous les appareils !

### 🎯 **Événements Synchronisés**

| Action | Événement | Impact |
|--------|-----------|---------|
| 🧾 Achat ticket | `ticket_purchased` | Mise à jour des listes de tickets |
| ✅ Validation ticket | `ticket_validated` | Statut mis à jour partout |
| 🗑️ Suppression ticket | `ticket_deleted` | Ticket disparaît de toutes les vues |
| 🚌 Création ligne | `line_created` | Nouvelles lignes disponibles |
| ✏️ Modification ligne | `line_updated` | Informations mises à jour |
| ❌ Suppression ligne | `line_deleted` | Ligne retirée partout |
| 🎫 Achat SOTRAL | `sotral_ticket_*` | Synchronisation complète SOTRAL |

### 🧪 **Test de la Synchronisation**

```bash
# Test automatique de tous les événements
./test-realtime-sync.sh

# Test avec ngrok (accès global)
./setup-ngrok.sh
./test-ngrok-sync.sh
```

### 📱 **Comment Ça Marche**

1. **Backend** : Diffuse les événements via Server-Sent Events (SSE)
2. **Mobile** : Reçoit et met à jour automatiquement les écrans
3. **Admin** : Reçoit et met à jour les tableaux de bord
4. **Temps réel** : Toutes les modifications sont instantanées

### 🎉 **Résultat**

- ✅ **Achetez un ticket** → Il apparaît immédiatement dans "Mes tickets"
- ✅ **Validez un ticket** → Le statut change partout
- ✅ **Modifiez une ligne** → Les produits se mettent à jour automatiquement
- ✅ **Supprimez un ticket** → Il disparaît de toutes les vues

---

## 📈 **Roadmap**

- ✅ **Backend complet** (Auth, Tickets, DB)
- ✅ **App mobile fonctionnelle** (achat, QR codes)
- ✅ **Configuration réseau intelligente**
- ✅ **Solutions déploiement cloud gratuites**
- 🔄 **Paiements mobile money**
- 🔄 **Mode offline scanner**
- 🔄 **Notifications push**

---

**Status**: ✅ Architecture fonctionnelle et testée  
**Accès Global**: ✅ Solutions gratuites implémentées  
**Synchronisation Temps Réel**: ✅ Toutes les actions se synchronisent automatiquement  
**Last Update**: 10 septembre 2025
