# 🚌 Guide du Système SOTRAL - Transport de Lomé

## Vue d'ensemble

Le système SOTRAL est une solution complète de gestion des transports publics pour la ville de Lomé (Togo). Il comprend :

- 22 lignes de bus avec tarification par zones (100–300 FCFA)
- Tickets QR pour validation numérique
- Interface d'administration (web)
- Application mobile pour les usagers
- Application scanner pour la validation sur le terrain

## 🗄️ Base de données

### Tables principales

- `sotral_lines` — lignes de bus
- `sotral_stops` — arrêts et géolocalisation
- `sotral_ticket_types` — types de tickets (adulte, étudiant...)
- `sotral_pricing_zones` — zones tarifaires
- `sotral_tickets` — tickets achetés (QR)
- `sotral_validations` — historique des validations

### Initialisation

Exécuter le script SQL de création :

```bash
cd /home/connect/kev/Go/back
psql -d votre_db -f src/schema/create_sotral_system.sql
```

## 🖥️ Backend API

### Démarrage (backend API)

```bash
cd /home/connect/kev/Go/back
npm run dev
```

### Endpoints principaux

#### Public (frontend mobile)

- `GET /sotral/health` — état du service
- `GET /sotral/lines` — liste des lignes
- `GET /sotral/lines/:id` — détails d'une ligne
- `GET /sotral/lines/:id/stops` — arrêts d'une ligne
- `GET /sotral/ticket-types` — types de tickets
- `GET /sotral/pricing-zones` — zones tarifaires
- `GET /sotral/calculate-price` — calculer le prix
- `POST /sotral/purchase` — acheter un ticket
- `GET /sotral/users/:id/tickets` — tickets d'un utilisateur

#### Scanner (validation)

- `POST /sotral/validate` — valider un ticket QR

#### Admin (gestion)

- `GET /admin/sotral/stats` — statistiques
- `GET /admin/sotral/lines` — gestion des lignes
- `GET /admin/sotral/tickets` — gestion des tickets

## 🎛️ Interface Admin

### Démarrage (admin)

```bash
cd /home/connect/kev/Go/admin
npm run dev
```

### Fonctionnalités principales

1. Tableau de bord — ventes, revenus, utilisateurs actifs
2. Gestion des lignes — arrêts, statut actif
3. Gestion des tickets — liste, filtres, détails

### Accès

- URL : `http://localhost:3000/sotral`
- Navigation : Transport > SOTRAL

## 📱 Application Mobile (frontend)

Fichier clé : `front/services/sotral-service.ts`

Exemple d'utilisation :

```typescript
import { SotralMobileService } from './services/sotral-service';

const lines = await SotralMobileService.getAllLines();

const price = await SotralMobileService.calculatePrice({
  ticket_type_id: 1,
  stop_from_id: 10,
  stop_to_id: 25,
  is_student: false
});

const ticket = await SotralMobileService.purchaseTicket({
  ticket_type_id: 1,
  line_id: 1,
  payment_method: 'mobile_money',
  payment_phone: '+22890123456'
});
```

## 📷 Application Scanner

Fichier clé : `scan/src/services/sotral-scanner-service.ts`

```typescript
import { SotralScannerService } from './services/sotral-scanner-service';

SotralScannerService.initializeScanner({
  scanner_id: 'SCANNER_001',
  line_id: 1,
  location: { latitude: 6.1319, longitude: 1.2228 }
});

const result = await SotralScannerService.validateTicketQR(qrCode);
```

## 💰 Système de tarification

### Zones tarifaires

- Zone 1 : 100 FCFA
- Zone 2 : 200 FCFA
- Zone 3 : 300 FCFA

### Remises

- Étudiants : 30% de réduction
- Tickets multiples : tarifs groupés

## 🧪 Tests

### Test API

```bash
cd /home/connect/kev/Go
./test-sotral-api.sh
```

### Test manuel rapide

1. Démarrer le backend : `cd back && npm run dev`
2. Démarrer l'admin : `cd admin && npm run dev`
3. Ouvrir : `http://localhost:3000/sotral`

## 📋 Données réelles (exemples)

1. Ligne 1 — Kodjoviakopé - Aflao Gakli (Zone 3, 300 FCFA)
2. Ligne 2 — Bè - Hanoukopé (Zone 2, 200 FCFA)
3. Ligne 3 — Tokoin - Agoè (Zone 2, 200 FCFA)
...

## 🔧 Configuration

### Variables d'environnement (exemple)

```bash
# Backend
PORT=7000
DATABASE_URL=postgresql://user:pass@localhost:5432/db_name

# Frontend mobile
EXPO_PUBLIC_API_URL=http://localhost:7000

# Admin
VITE_API_BASE_URL=http://localhost:7000
```

## 🚀 Déploiement

### Backend

1. `npm run build`
2. `npm start`

### Frontend admin

1. `npm run build`
2. `npm run preview`

## 📞 Support & Debugging

- Logs Backend : console serveur
- Logs Admin : DevTools navigateur
- Logs Mobile : console React Native

- Health check : `GET /sotral/health`
- Test endpoints : `./test-sotral-api.sh`

---

🎯 Le système SOTRAL est prêt.
