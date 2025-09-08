# GoSOTRAL - Écosystème Complet

Système de billetterie électronique pour les transports en commun SOTRAL.

## 🏗️ **Architecture Complète**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BACKEND API   │◄──►│  FRONTEND USER  │    │   ADMIN WEB     │
│  (Node.js/TS)   │    │ (React Native)  │    │ (React/TS/Web)  │
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

## 📁 **Structure des Projets**

### `/back` - API Backend
- **Tech**: Node.js + TypeScript + Express + PostgreSQL
- **Port**: 7000
- **Base de données**: PostgreSQL (port 5433)
- **Features**: Auth, CRUD, QR, Analytics, Webhooks

### `/front` - Version Web Utilisateur
- **Tech**: React Native + Expo + TypeScript (version web)
- **Features**: Interface web pour utilisateurs finaux

### `/GoSOTRAL_front` - App Mobile Utilisateur
- **Tech**: React Native + Expo + TypeScript
- **Features**: Achat tickets, profil, historique, paiements
- **Note**: Version mobile native de l'interface utilisateur, complémentaire à `/front`

### `/admin` - Interface Web Admin
- **Tech**: React + TypeScript + Vite + Tailwind
- **Port**: 3000
- **Features**: Dashboard, gestion users/tickets, analytics

### `/scan` - App Mobile Scan
- **Tech**: React Native + Expo + TypeScript
- **Features**: Scanner QR, validation tickets, historique

## 🚀 **Installation Rapide**

### 1. Backend (Obligatoire)
```bash
cd /home/kev/Go/back
docker compose up -d
curl http://localhost:7000/health
```

### 2. App Mobile Utilisateur
```bash
cd /home/kev/Go/GoSOTRAL_front
npm install
npm start
```

### 3. Admin Web
```bash
cd /home/kev/Go/admin
npm install
npm run dev
```

### 4. App Scanner
```bash
cd /home/kev/Go/scan
npm install
npm start
```

## 🔗 **APIs et Communication**

### Endpoints Backend
- `GET /health` - Santé du système
- `POST /auth/login` - Login utilisateur
- `POST /auth/admin/login` - Login admin
- `GET /tickets/products` - Produits disponibles
- `POST /tickets/purchase` - Achat ticket
- `POST /tickets/validate` - Validation ticket (scan)
- `GET /tickets/stats` - Statistiques admin

### Configuration Réseau
- **Localhost**: `http://localhost:7000` (simulateur iOS/web)
- **Android Emulator**: `http://10.0.2.2:7000`
- **Appareil physique**: `http://192.168.1.106:7000`

## 👥 **Comptes de Test**

### Utilisateur Mobile
- Email: `test@local`
- Password: `password123`

### Admin Web
- Email: `admin@gosotral.com`
- Password: `admin123`

## 📱 **Fonctionnalités par App**

### GoSOTRAL_front (Utilisateurs)
- ✅ Inscription/Connexion
- ✅ Achat de tickets
- ✅ Gestion du profil
- ✅ Historique des achats
- ✅ Codes QR des tickets
- 🔄 Paiements mobile money

### Admin Web
- ✅ Dashboard avec stats
- ✅ Gestion des utilisateurs
- ✅ Gestion des tickets
- ✅ Analytics en temps réel
- ✅ Validation manuelle tickets
- 📊 Rapports d'activité

### Scan Mobile (Contrôleurs)
- ✅ Scanner QR codes
- ✅ Validation temps réel
- ✅ Historique des scans
- ✅ Mode hors ligne
- 🔊 Feedback audio/vibration

## 🛠️ **Développement**

### Test de l'architecture complète
```bash
./test-architecture.sh
```

### Variables d'environnement
```bash
# Backend (.env)
DATABASE_URL=postgresql://gosotral_user:gosotral_pass@localhost:5433/gosotral_db
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@gosotral.com
ADMIN_PASSWORD=admin123

# Admin (.env)
VITE_API_BASE_URL=http://localhost:7000
```

## 🔧 **Dépannage**

### Erreur "Network Error" dans les apps mobiles
1. Vérifiez que le backend tourne: `curl http://localhost:7000/health`
2. Pour Android emulator: utilisez `10.0.2.2:7000`
3. Pour appareil physique: utilisez l'IP LAN `192.168.1.106:7000`

### Erreur CORS
- CORS activé dans le backend pour le développement
- Headers configurés automatiquement

### Base de données vide
```bash
cd /home/kev/Go/back
docker compose exec -T db psql -U gosotral_user -d gosotral_db < src/schema/users.sql
```

## 📈 **Prochaines Étapes**

1. **Finaliser les paiements** mobile money
2. **Implémenter mode offline** pour le scanner
3. **Ajouter notifications push**
4. **Optimiser les performances**
5. **Tests automatisés**
6. **Déploiement production**

---

**Status**: ✅ Architecture fonctionnelle et testée
**Last Update**: 8 septembre 2025
