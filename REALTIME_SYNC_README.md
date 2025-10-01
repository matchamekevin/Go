# 🔄 Système de Synchronisation Temps Réel SOTRAL

## ✅ Implémentation Terminée

Le système de synchronisation automatique entre l'application mobile et l'interface web admin a été restauré et amélioré.

### Backend (Express.js)
- **Service temps réel** : `back/src/services/realtime.service.ts`
  - Server-Sent Events (SSE) pour pousser les mises à jour
  - Gestion des connexions clients
  - Diffusion d'événements à tous les clients connectés

- **Routes temps réel** : `back/src/routes/realtime.routes.ts`
  - `GET /realtime/events` - Connexion SSE
  - `POST /realtime/test-broadcast` - Test de diffusion
  - `GET /realtime/clients-count` - Nombre de clients connectés

- **Contrôleur SOTRAL mis à jour** : `back/src/features/admin/admin.sotral.controller.ts`
  - Réactivation des appels `realtimeService.broadcast()` pour :
    - Création/modification/suppression de lignes
    - Création de types de tickets
    - Suppression de tickets

### Interface Admin (React)
- **Hook temps réel** : `admin/src/hooks/useRealtime.ts`
  - Connexion automatique SSE
  - Gestion des reconnexions
  - Callbacks d'événements

- **Hook SOTRAL spécialisé** : `admin/src/hooks/useSotralRealtime.ts`
  - Événements spécifiques aux entités SOTRAL
  - Callbacks typés pour chaque type d'événement

- **Composant de statut** : `admin/src/components/RealtimeStatus.tsx`
  - Indicateur de connexion temps réel
  - Historique des événements récents
  - Bouton de reconnexion manuelle

### Application Mobile (React Native)
- **Service temps réel** : `front/src/services/realtime.service.ts`
  - Client SSE adapté pour React Native
  - Gestion des callbacks d'événements
  - Reconexion automatique

- **Hooks React Native** : `front/src/hooks/`
  - `useRealtime.ts` : Hook de base pour la connexion SSE
  - `useSotralRealtime.ts` : Hook spécialisé pour les événements SOTRAL

- **Écrans intégrés** :
  - `MyTicketsScreen.tsx` : Synchronisation des tickets supprimés
  - `ProductsScreen.tsx` : Synchronisation des lignes/routes modifiées

## 🚀 Comment Tester

### 1. Démarrer le Backend
```bash
cd back
npm run dev
```

### 2. Configurer l'App Mobile
```bash
# Configurer l'adresse IP réseau pour la synchronisation
./configure-mobile-realtime.sh
```

### 3. Tester les Routes Temps Réel
```bash
./test-realtime-sync.sh      # Test général
./test-mobile-realtime.sh    # Test mobile spécifique
```

### 4. Intégrer dans l'Interface Admin
Ajouter le composant `RealtimeStatus` dans `SotralManagementPage.tsx` :

```tsx
import { RealtimeStatus } from '../components/RealtimeStatus';

// Dans le JSX :
<RealtimeStatus baseUrl="" />  // Utilise l'URL relative
```

### 5. Tester la Synchronisation Complète
1. Ouvrir l'interface admin dans un navigateur
2. Lancer l'app mobile sur votre téléphone
3. Vérifier les indicateurs "Synchronisation active" (point vert)
4. Modifier une ligne SOTRAL dans l'admin
5. Constater la mise à jour automatique dans l'app mobile

## 📡 Événements Temps Réel

Le système diffuse automatiquement ces événements :

- `line_created` - Nouvelle ligne créée
- `line_updated` - Ligne modifiée ou statut changé
- `line_deleted` - Ligne supprimée
- `ticket_type_created` - Nouveau type de ticket
- `ticket_deleted` - Ticket supprimé

## 🔧 Configuration

### Variables d'Environnement
Aucune configuration supplémentaire requise. Le système utilise les routes existantes.

### CORS
Les routes temps réel supportent CORS pour les connexions cross-origin.

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifier les erreurs TypeScript : `npm run build`
- Vérifier les dépendances : `npm install`

### Pas de connexion SSE
- Vérifier que le serveur fonctionne : `curl http://localhost:3000/health`
- Vérifier les logs du navigateur (Console > Network > EventSource)

### Événements non reçus
- Vérifier la connexion dans le composant `RealtimeStatus`
- Vérifier les logs du backend pour les appels broadcast
- Tester manuellement : `curl -X POST http://localhost:3000/realtime/test-broadcast -d '{"eventType":"test"}' -H "Content-Type: application/json"`

## 🎯 Prochaines Étapes

1. **Intégration complète** : Ajouter `RealtimeStatus` dans toutes les pages admin pertinentes
2. **Application mobile** : Intégrer le service temps réel dans les écrans de tickets et lignes
3. **Notifications push** : Ajouter des notifications toast pour les événements importants
4. **Historique persistant** : Sauvegarder l'historique des événements en base de données

---

**✅ Synchronisation temps réel restaurée avec succès !**