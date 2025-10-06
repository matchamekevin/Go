# 🔄 MIGRATION DES SERVICES FRONT - GUIDE

## ✅ Nouveaux fichiers créés

Les nouveaux services basés sur les APIs backend réelles ont été créés :

### Services principaux
- ✅ `src/services/api.client.ts` - Client API complet avec toutes les routes backend
- ✅ `src/services/authService.new.ts` - Service d'authentification
- ✅ `src/services/ticketService.new.ts` - Service de gestion des tickets
- ✅ `src/services/paymentService.new.ts` - Service de paiement
- ✅ `src/services/sotralService.new.ts` - Service SOTRAL (transport)
- ✅ `src/services/index.new.ts` - Export centralisé

## 📋 Étapes de migration

### Étape 1: Sauvegarder les anciens fichiers (fait automatiquement)

```bash
cd /home/connect/kev/Go/front
# Les anciens fichiers seront renommés avec .old
```

### Étape 2: Activer les nouveaux services

```bash
# Remplacer les anciens fichiers par les nouveaux
mv src/services/authService.ts src/services/authService.old.ts
mv src/services/authService.new.ts src/services/authService.ts

mv src/services/ticketService.ts src/services/ticketService.old.ts
mv src/services/ticketService.new.ts src/services/ticketService.ts

mv src/services/paymentService.ts src/services/paymentService.old.ts
mv src/services/paymentService.new.ts src/services/paymentService.ts

mv src/services/sotralService.ts src/services/sotralService.old.ts  
mv src/services/sotralService.new.ts src/services/sotralService.ts

mv src/services/index.ts src/services/index.old.ts
mv src/services/index.new.ts src/services/index.ts
```

### Étape 3: Mettre à jour les imports si nécessaire

Les nouveaux services utilisent les mêmes noms d'export, donc la plupart des imports fonctionneront sans modification.

#### Avant (ancien):
```typescript
import { AuthService } from '../services/authService';
import { apiClient } from '../services/apiClient';
```

#### Après (nouveau - normalement identique):
```typescript
import { AuthService } from '../services/authService';
import apiClient from '../services/api.client';
```

## 🔑 Changements clés

### 1. Client API (`api.client.ts`)

**Nouveau:** Toutes les méthodes correspondent exactement aux endpoints backend:

```typescript
// ✅ Authentification
await apiClient.register({ name, email, password });
await apiClient.login({ email, password });
await apiClient.verifyEmail(email, otp);
await apiClient.getCurrentUser();

// ✅ Tickets
await apiClient.getMyTickets({ status: 'active' });
await apiClient.getTicketById(ticketId);
await apiClient.activateTicket(ticketId);

// ✅ Paiements
await apiClient.initiatePayment({
  ticket_type: 'single',
  payment_method: 'tmoney',
  phone_number: '+228XXXXXXXX'
});
await apiClient.checkPaymentStatus(paymentId);

// ✅ SOTRAL
await apiClient.getSotralLines();
await apiClient.getSotralStops({ latitude, longitude, radius });
await apiClient.calculateRoute(fromStopId, toStopId);
```

### 2. Service d'authentification

**Nouveau:** Support complet email/phone avec normalisation Togo:

```typescript
// Connexion email
await authService.login({ email, password });

// Connexion téléphone (auto-normalisé pour Togo)
await authService.loginWithPhone('90123456', password); // +22890123456

// Vérification OTP
await authService.verifyEmail(email, otp);

// Réinitialisation mot de passe
await authService.forgotPassword(email);
await authService.resetPassword(email, otp, newPassword);
```

### 3. Service des tickets

**Nouveau:** Gestion complète du cycle de vie des tickets:

```typescript
// Récupérer mes tickets
const tickets = await ticketService.getMyTickets({ status: 'active' });

// Activer un ticket
const result = await ticketService.activateTicket(ticketId);

// Statistiques
const stats = await ticketService.getTicketStats();
// { total: 10, active: 3, used: 5, expired: 2 }
```

### 4. Service de paiement

**Nouveau:** Intégration TMoney/Flooz avec polling automatique:

```typescript
// Initier un paiement
const result = await paymentService.initiatePayment({
  ticket_type: 'single',
  payment_method: 'tmoney',
  phone_number: '+22890123456',
  quantity: 1
});

// Polling automatique du statut
const payment = await paymentService.pollPaymentStatus(
  result.payment_id,
  (status) => console.log('Status:', status)
);

// Historique
const payments = await paymentService.getPaymentHistory();
```

### 5. Service SOTRAL

**Nouveau:** Toutes les fonctionnalités de transport:

```typescript
// Lignes de bus
const lines = await sotralService.getAllLines();
const lineDetails = await sotralService.getLineById(1);

// Arrêts
const stops = await sotralService.getAllStops();
const nearbyStops = await sotralService.getNearbyStops(lat, lng, 1000);

// Itinéraires
const route = await sotralService.calculateRoute(fromStopId, toStopId);

// Temps réel
const vehicles = await sotralService.getRealtimeVehicles(lineId);

// Favoris
await sotralService.addFavoriteStop(stopId, 'Mon arrêt');
const favorites = await sotralService.getFavoriteStops();
```

## 🎯 Endpoints Backend utilisés

### Authentication (`/api/auth`)
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/verify-email` - Vérification OTP
- `POST /auth/resend-otp` - Renvoyer OTP
- `POST /auth/forgot-password` - Mot de passe oublié
- `POST /auth/reset-password` - Réinitialiser mot de passe
- `GET /auth/me` - Utilisateur connecté

### Tickets (`/api/tickets`)
- `GET /tickets` - Mes tickets
- `GET /tickets/:id` - Détails ticket
- `POST /tickets/:id/activate` - Activer ticket
- `GET /tickets/stats` - Statistiques

### Payments (`/api/payments`)
- `POST /payments/initiate` - Initier paiement
- `GET /payments/status/:id` - Statut paiement
- `GET /payments/history` - Historique

### SOTRAL (`/api/sotral`)
- `GET /sotral/lines` - Toutes les lignes
- `GET /sotral/lines/:id` - Détails ligne
- `GET /sotral/stops` - Tous les arrêts
- `GET /sotral/stops/:id` - Détails arrêt
- `GET /sotral/route` - Calculer itinéraire
- `GET /sotral/schedules/:lineId` - Horaires
- `GET /sotral/realtime/:lineId` - Temps réel
- `POST /sotral/favorite` - Ajouter favori
- `GET /sotral/favorites` - Mes favoris
- `DELETE /sotral/favorite/:id` - Supprimer favori

## ⚡ Configuration

### URL de l'API

Configurée automatiquement selon l'environnement:

```typescript
// Development
const API_BASE_URL = 'http://192.168.1.78:5000/api';

// Production
const API_BASE_URL = 'https://api.gosotral.tg/api';
```

### Token JWT

Géré automatiquement par le client API:
- Sauvegarde dans AsyncStorage
- Ajouté automatiquement aux headers
- Déconnexion auto si 401

## 🔍 Tests

Pour tester la nouvelle intégration:

```bash
# Démarrer le backend
cd /home/connect/kev/Go/back
npm run dev

# Démarrer le front
cd /home/connect/kev/Go/front
npm start
```

## 📝 Notes importantes

1. **Pas de modification du backend** - Tous les services utilisent les endpoints existants
2. **Compatibilité** - Les anciens noms d'export sont maintenus
3. **Types TypeScript** - Tous les types correspondent aux réponses backend
4. **Gestion d'erreurs** - Uniformisée avec try/catch et messages clairs
5. **Styles** - Aucun changement aux composants UI

## 🚀 Prochaines étapes

1. ✅ Tester l'authentification (login/register)
2. ✅ Tester l'achat de tickets
3. ✅ Tester la recherche SOTRAL
4. ✅ Vérifier le paiement mobile
5. ✅ Tester les favoris

---

**Date de migration:** 6 octobre 2025  
**Version:** 2.0.0 - Intégration Backend Complète
