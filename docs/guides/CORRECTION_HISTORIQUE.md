# 🔧 Correction du problème d'historique des billets

## 📋 Résumé du problème

L'historique des billets ne récupérait pas les paiements effectués par le compte utilisateur.

## 🔍 Causes identifiées

### 1. Mauvaise structure de données
- Le service `UserTicketService` utilisait l'ancien format `Ticket` au lieu de `UnifiedSotralTicket`
- Les champs recherchés étaient incorrects :
  - ❌ `route_start_point`, `route_end_point`, `product_name`
  - ✅ `line_name`, `ticket_type_name`, `price_paid_fcfa`

### 2. Filtre trop restrictif
- L'historique filtrait uniquement `status === 'used' || status === 'expired'`
- Les tickets récemment achetés avec `status === 'active'` n'apparaissaient pas

### 3. Endpoint manquant
- L'endpoint `/sotral/assign-ticket` n'était pas activé (serveur pas redémarré)

## ✅ Solutions appliquées

### 1. Correction du service `UserTicketService.ts`

#### a) Mise à jour des imports
```typescript
// Avant
import type { ApiResponse, Ticket } from '../types/api';

// Après
import type { ApiResponse } from '../types/api';
import type { UnifiedSotralTicket } from './sotralUnifiedService';
```

#### b) Correction de `getMyTickets()`
- Retourne maintenant `UnifiedSotralTicket[]`
- Ajout de logs détaillés pour le debug

#### c) Correction de `getTicketHistory()`
```typescript
// Avant - Filtre restrictif
.filter(ticket => ticket.status === 'used' || ticket.status === 'expired')

// Après - Tous les tickets achetés
.filter(ticket => ticket.purchased_at) // Affiche TOUS les tickets payés
```

#### d) Correction de `transformToUserTicket()`
```typescript
// Utilisation des bons champs SOTRAL
const route = ticket.line_name || `Ligne ${ticket.line_id}`;
const type = ticket.ticket_type_name || 'Ticket SOTRAL';
const price = `${ticket.price_paid_fcfa} FCFA`;
const qrCode = ticket.qr_code;
```

#### e) Correction de `transformToUserTicketHistory()`
- Calcul intelligent du statut basé sur `trips_remaining` et `expires_at`
- Utilisation de `purchased_at` pour la date (date de paiement)
- Format correct des données SOTRAL

### 2. Ajout de logs de debug dans `history.tsx`

```typescript
// Logs détaillés pour tracer l'exécution
console.log('[History] 🔍 Début du chargement...');
console.log('[History] ✅ Données reçues:', {
  count: historyData.length,
  tickets: historyData
});
```

#### Bouton de vérification d'authentification
- Permet de vérifier rapidement si l'utilisateur est connecté
- Affiche le token et l'email de l'utilisateur

### 3. Redémarrage du backend
- Backend redémarré pour activer tous les endpoints SOTRAL
- Endpoint `/sotral/my-tickets` maintenant disponible
- Endpoint `/sotral/assign-ticket` maintenant disponible

## 🧪 Tests et vérification

### Script de test créé : `test-history-endpoint.sh`

```bash
./test-history-endpoint.sh <AUTH_TOKEN>
```

Ce script vérifie :
1. ✅ L'authentification de l'utilisateur
2. ✅ La récupération des tickets via `/sotral/my-tickets`
3. ✅ Le nombre de tickets retournés
4. ✅ Les détails de chaque ticket

### Pour obtenir le token d'authentification :

1. Ouvrez l'application mobile
2. Allez dans l'onglet **Historique**
3. Cliquez sur **"🔍 Vérifier Auth"**
4. Regardez les logs console pour copier le token
5. Exécutez : `./test-history-endpoint.sh <TOKEN>`

## 📊 Structure des données attendues

### Ticket SOTRAL (`UnifiedSotralTicket`)
```typescript
{
  id: number;
  ticket_code: string;
  qr_code: string;
  user_id?: number;              // ← Important pour l'historique !
  ticket_type_id: number;
  line_id?: number;
  price_paid_fcfa: number;       // ← Prix payé
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchased_at: string;          // ← Date de paiement
  expires_at?: string;
  trips_remaining: number;
  payment_method?: string;
  payment_reference?: string;
  // Champs joints
  line_name?: string;            // ← Nom de la ligne
  ticket_type_name?: string;     // ← Type de ticket
}
```

### Affichage dans l'historique
```typescript
{
  id: string;
  route: string;                 // line_name ou "Ligne X"
  type: string;                  // ticket_type_name
  price: string;                 // price_paid_fcfa + " FCFA"
  date: string;                  // Date formatée de purchased_at
  time: string;                  // Heure formatée de purchased_at
  status: 'used' | 'expired';    // Calculé intelligemment
}
```

## 🔍 Diagnostic en cas de problème

### Si l'historique est vide :

1. **Vérifier l'authentification**
   - Cliquer sur "Vérifier Auth" dans l'app
   - S'assurer qu'un token et un email sont affichés

2. **Vérifier les logs**
   ```
   [History] 🔍 Début du chargement de l'historique...
   [UserTicketService] Récupération des tickets utilisateur...
   [UserTicketService] Réponse API reçue: { success: true, dataLength: X }
   [History] ✅ Données reçues: { count: X, tickets: [...] }
   ```

3. **Vérifier la base de données**
   ```sql
   SELECT * FROM sotral_tickets 
   WHERE user_id = <USER_ID>
   ORDER BY purchased_at DESC;
   ```

4. **Vérifier que le paiement a bien attribué le ticket**
   - Le ticket doit avoir `user_id` non null
   - Le ticket doit avoir `purchased_at` non null
   - Le ticket doit avoir `payment_method` et `payment_reference`

### Si l'API retourne une erreur 401 :
- Token expiré ou invalide
- Utilisateur non authentifié
- Vérifier dans AsyncStorage que le token existe

### Si l'API retourne une erreur 500 :
- Erreur dans le backend
- Vérifier les logs du serveur backend
- Vérifier la connexion à la base de données

## 📁 Fichiers modifiés

1. **Backend**
   - `/back/src/features/sotral/sotral.controller.ts` - Endpoints déjà existants
   - `/back/src/features/sotral/sotral.repository.ts` - Méthodes déjà existantes
   - `/back/src/features/sotral/sotral.routes.ts` - Routes déjà définies

2. **Frontend**
   - ✅ `/front/src/services/userTicketService.ts` - **CORRIGÉ**
   - ✅ `/front/app/(tabs)/history.tsx` - **LOGS AJOUTÉS**
   - ✅ `/front/app/ticket-generated.tsx` - Déjà corrigé (attribution du ticket)

3. **Tests**
   - ✅ `/test-history-endpoint.sh` - **NOUVEAU**

## 🎯 Résultat attendu

L'historique devrait maintenant afficher :
- ✅ **Tous les tickets achetés** (avec `purchased_at`)
- ✅ Nom de la ligne (ex: "Ligne 3")
- ✅ Type de ticket (ex: "Ticket Standard")
- ✅ Prix payé (ex: "250 FCFA")
- ✅ Date et heure d'achat
- ✅ Statut correct (Utilisé/Expiré)

## 🚀 Prochaines étapes

1. **Tester le flux complet**
   - Acheter un ticket via l'app
   - Vérifier qu'il apparaît immédiatement dans l'historique
   - Rafraîchir pour confirmer la persistance

2. **Supprimer le bouton debug** une fois que tout fonctionne

3. **Ajouter plus d'informations** si nécessaire :
   - Code du ticket
   - QR code
   - Nombre de trajets restants
   - Date d'expiration

---

**Date de correction** : 2 octobre 2025
**Status** : ✅ Corrections appliquées - En attente de tests
