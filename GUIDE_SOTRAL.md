# 🚌 Guide du Système SOTRAL - Transport de Lomé

## Vue d'ensemble
Le système SOTRAL est une solution complète de gestion des transports publics pour la ville de Lomé au Togo. Il comprend :
- 22 lignes de bus avec tarification par zones (100-300 FCFA)
- Système de tickets QR avec validation numérique
- Interface d'administration complète
- Application mobile pour les usagers
- Application scanner pour la validation

## 🗄️ Base de données

### Tables principales
- **sotral_lines** : 22 lignes réelles de SOTRAL Lomé
- **sotral_stops** : Arrêts de bus avec géolocalisation
- **sotral_ticket_types** : Types de tickets (adulte, étudiant, etc.)
- **sotral_pricing_zones** : Zones tarifaires (100, 200, 300 FCFA)
- **sotral_tickets** : Tickets achetés avec QR codes
- **sotral_validations** : Historique des validations

### Initialisation
```bash
cd /home/connect/kev/Go/back
# Exécuter le script SQL de création
psql -d votre_db -f src/schema/create_sotral_system.sql
```

## 🖥️ Backend API

### Démarrage
```bash
cd /home/connect/kev/Go/back
npm run dev
```

### Endpoints principaux

#### Public (pour frontend mobile)
- `GET /sotral/health` - Status du service
- `GET /sotral/lines` - Liste des lignes
- `GET /sotral/lines/:id` - Détails d'une ligne
- `GET /sotral/lines/:id/stops` - Arrêts d'une ligne
- `GET /sotral/ticket-types` - Types de tickets
- `GET /sotral/pricing-zones` - Zones de tarification
- `GET /sotral/calculate-price` - Calculer le prix d'un ticket
- `POST /sotral/purchase` - Acheter un ticket
- `GET /sotral/users/:id/tickets` - Tickets d'un utilisateur

#### Scanner (pour validation)
- `POST /sotral/validate` - Valider un ticket QR

#### Admin (pour gestion)
- `GET /admin/sotral/stats` - Statistiques globales
- `GET /admin/sotral/lines` - Gestion des lignes
- `GET /admin/sotral/tickets` - Gestion des tickets

## 🎛️ Interface Admin

### Démarrage
```bash
cd /home/connect/kev/Go/admin
npm run dev
```

### Fonctionnalités
1. **Tableau de bord SOTRAL** 📊
   - Statistiques des ventes
   - Revenus par ligne
   - Utilisateurs actifs
   - Distribution des types de tickets

2. **Gestion des lignes** 🚌
   - Vue d'ensemble des 22 lignes
   - Détails des arrêts par ligne
   - Statut actif/inactif

3. **Gestion des tickets** 🎫
   - Liste paginée des tickets
   - Filtrage par statut/utilisateur
   - Détails des transactions

### Accès
- URL : `http://localhost:3000/sotral`
- Navigation : Section "Transport" > "SOTRAL"

## 📱 Application Mobile (Frontend)

### Service API
Fichier : `/home/connect/kev/Go/front/services/sotral-service.ts`

### Fonctionnalités
```typescript
import { SotralMobileService } from './services/sotral-service';

// Récupérer les lignes
const lines = await SotralMobileService.getAllLines();

// Calculer le prix
const price = await SotralMobileService.calculatePrice({
  ticket_type_id: 1,
  stop_from_id: 10,
  stop_to_id: 25,
  is_student: false
});

// Acheter un ticket
const ticket = await SotralMobileService.purchaseTicket({
  ticket_type_id: 1,
  line_id: 1,
  payment_method: 'mobile_money',
  payment_phone: '+22890123456'
});
```

## 📷 Application Scanner

### Service de validation
Fichier : `/home/connect/kev/Go/scan/src/services/sotral-scanner-service.ts`

### Configuration
```typescript
import { SotralScannerService } from './services/sotral-scanner-service';

// Initialiser le scanner
SotralScannerService.initializeScanner({
  scanner_id: 'SCANNER_001',
  line_id: 1,
  location: { latitude: 6.1319, longitude: 1.2228 }
});

// Valider un ticket
const result = await SotralScannerService.validateTicketQR(qrCode);
```

## 💰 Système de tarification

### Zones tarifaires
- **Zone 1** : 100 FCFA (centre-ville)
- **Zone 2** : 200 FCFA (périphérie proche)
- **Zone 3** : 300 FCFA (grandes distances)

### Remises
- **Étudiants** : 30% de réduction sur tous les trajets
- **Tickets multiples** : Types avec plusieurs voyages

## 🧪 Tests

### Test de l'API
```bash
cd /home/connect/kev/Go
./test-sotral-api.sh
```

### Test manuel
1. Démarrer le backend : `cd back && npm run dev`
2. Démarrer l'admin : `cd admin && npm run dev`
3. Aller sur : `http://localhost:3000/sotral`

## 📋 Données réelles

### Lignes SOTRAL incluses
1. **Ligne 1** : Kodjoviakopé - Aflao Gakli (Zone 3, 300 FCFA)
2. **Ligne 2** : Bè - Hanoukopé (Zone 2, 200 FCFA)
3. **Ligne 3** : Tokoin - Agoè (Zone 2, 200 FCFA)
4. **Ligne 4** : Adidogomé - Centre-ville (Zone 2, 200 FCFA)
5. **Ligne 5** : Nyékonakpoè - Assivito (Zone 3, 300 FCFA)
... et 17 autres lignes avec données réelles

### Types de tickets
- **Ticket Simple Adulte** : Prix selon zone
- **Ticket Simple Étudiant** : 30% de réduction
- **Carte Journée** : Voyages illimités 24h
- **Carte Semaine** : Voyages illimités 7 jours

## 🔧 Configuration

### Variables d'environnement
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
1. Compiler : `npm run build`
2. Exécuter : `npm start`

### Frontend admin
1. Build : `npm run build`
2. Servir : `npm run preview`

## 📞 Support

### Logs
- Backend : Console du serveur
- Admin : DevTools du navigateur
- Mobile : Console React Native

### Debugging
- Health check : `GET /sotral/health`
- Test endpoints : `./test-sotral-api.sh`
- Vérifier la base de données : Tables `sotral_*`

---

**🎯 Le système SOTRAL est maintenant prêt à transformer les transports publics de Lomé !**