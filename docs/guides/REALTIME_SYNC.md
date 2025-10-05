# Synchronisation Temps Réel SOTRAL

Le système SOTRAL intègre maintenant une synchronisation temps réel complète utilisant WebSockets (Socket.io) pour que toutes les mises à jour s'effectuent instantanément partout.

## 🚀 Fonctionnalités Temps Réel

### ✅ Événements Supportés
- **Lignes** : Création, modification, suppression, changement de statut
- **Tickets** : Création, modification, suppression
- **Types de tickets** : Création, modification, suppression
- **Arrêts** : Création, modification, suppression

### ✅ Clients Connectés
- **Interface Admin** : Reçoit toutes les mises à jour en temps réel
- **App Mobile** : Synchronisation automatique des données
- **Multi-utilisateurs** : Tous les clients voient les changements simultanément

## 🏗️ Architecture Technique

### Backend (Node.js/Express + Socket.io)
```
📁 back/src/services/realtime.service.ts
📁 back/src/features/admin/admin.sotral.controller.ts (modifié)
📁 back/schema/migrations/realtime_events.sql
```

### Frontend Admin (React/Vite + Socket.io-client)
```
📁 admin/src/services/realtime.service.ts
📁 admin/src/hooks/useRealtime.ts
📁 admin/src/hooks/useSotralLines.ts (modifié)
📁 admin/src/hooks/useSotralTickets.ts (modifié)
```

### App Mobile (React Native + Socket.io-client)
```
📁 scan/src/services/realtime.service.ts
```

## 🔧 Installation & Configuration

### 1. Dépendances Installées
```bash
# Backend
npm install socket.io @types/socket.io

# Admin
npm install socket.io-client

# Mobile
npm install socket.io-client
```

### 2. Migration Base de Données
La table `realtime_events` a été créée pour journaliser tous les événements :

```sql
CREATE TABLE realtime_events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
```

### 3. Démarrage du Système
```bash
# Script tout-en-un
./scripts/start-realtime-system.sh

# Ou manuellement :
# Terminal 1 - Backend
cd back && npm run dev

# Terminal 2 - Admin
cd admin && npm run dev
```

## 📡 Fonctionnement des WebSockets

### Connexion
- **Admin** : Se connecte automatiquement et rejoint la room `admin`
- **Mobile** : Se connecte automatiquement et rejoint la room `mobile`
- **Reconnexion automatique** : En cas de déconnexion, reconnection exponentielle

### Événements Émis
Chaque modification dans l'admin déclenche un événement WebSocket :

```typescript
// Exemple d'événement émis lors de la création d'une ligne
{
  type: 'line_created',
  data: { id: 123, name: 'Ligne 5', ... },
  timestamp: new Date(),
  userId: 'admin_user_id'
}
```

### Réception des Événements
Les hooks React écoutent automatiquement les événements et mettent à jour l'UI :

```typescript
// Dans useSotralLines.ts
useRealtimeLines((event) => {
  switch (event.type) {
    case 'line_created':
      setLines(prev => [...prev, event.data]);
      break;
    case 'line_updated':
      setLines(prev => prev.map(line =>
        line.id === event.data.id ? event.data : line
      ));
      break;
    // ...
  }
});
```

## 🧪 Test du Système

### 1. Ouvrir l'Admin
```
http://localhost:5173
```

### 2. Ouvrir les Outils de Développement
- Onglet **Console** : Voir les logs de connexion WebSocket
- Onglet **Network** : Voir les connexions WebSocket

### 3. Tester les Événements
1. **Créer une ligne** → Voir l'événement dans la console
2. **Modifier une ligne** → Voir la mise à jour instantanée
3. **Supprimer une ligne** → Voir la disparition immédiate

### 4. Ouvrir Plusieurs Onglets
- Ouvrir l'admin dans plusieurs onglets
- Modifier dans un onglet → Voir la mise à jour dans tous les autres

## 🔍 Debugging

### Logs Importants
```
🔌 WebSocket server initialized     # Backend prêt
🔌 Client connected: [socket_id]     # Client connecté
🚌 Realtime line event: {...}        # Événement reçu
```

### Outils de Debug
```javascript
// Dans la console du navigateur
// Vérifier la connexion
window.realtimeService?.connectionStats

// Tester un ping
window.realtimeService?.ping()

// Voir les listeners actifs
window.realtimeService?.eventListeners
```

### Commandes Utiles
```bash
# Vérifier les connexions WebSocket
curl http://localhost:7000/health

# Voir les statistiques de connexions (à implémenter)
curl http://localhost:7000/admin/realtime-stats
```

## 🚨 Dépannage

### Problèmes Courants

#### 1. Connexion WebSocket échoue
```
Erreur: WebSocket connection failed
```
**Solution** :
- Vérifier que le backend tourne sur le port 7000
- Vérifier les CORS dans `back/src/app.ts`
- Vérifier l'URL dans `admin/src/services/realtime.service.ts`

#### 2. Événements non reçus
```
Aucun événement dans la console
```
**Solution** :
- Vérifier que les contrôleurs émettent bien les événements
- Vérifier que les hooks sont bien importés
- Vérifier la room join (`join_admin`)

#### 3. Reconnexion infinie
```
🔌 Attempting reconnection...
```
**Solution** :
- Vérifier la stabilité du réseau
- Augmenter `maxReconnectAttempts` si nécessaire
- Vérifier les timeouts dans la config Socket.io

## 📈 Performance

### Optimisations Implémentées
- **Rooms Socket.io** : Clients reçoivent seulement les événements pertinents
- **Reconnexion intelligente** : Backoff exponentiel
- **Cache local** : Données persistées côté client
- **Événements typés** : TypeScript pour éviter les erreurs

### Métriques à Surveiller
- Nombre de connexions simultanées
- Fréquence des événements
- Taux de reconnexion
- Latence des WebSockets

## 🔮 Évolutions Futures

### Fonctionnalités à Ajouter
- [ ] Notifications push mobiles
- [ ] Historique des événements
- [ ] Synchronisation offline
- [ ] Métriques temps réel
- [ ] Rooms par utilisateur
- [ ] Compression des événements

### Améliorations Techniques
- [ ] Tests unitaires des WebSockets
- [ ] Monitoring des performances
- [ ] Load balancing des connexions
- [ ] Sécurité WebSocket (authentification)

---

🎯 **Résultat** : Toutes les modifications dans l'admin SOTRAL sont maintenant synchronisées en temps réel sur tous les clients connectés !