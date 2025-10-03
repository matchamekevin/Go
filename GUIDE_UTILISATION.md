# 🚀 Guide d'Utilisation - Système de Validation SOTRAL

## 📱 Application Mobile

### Démarrage

```bash
cd /home/connect/kev/Go/scan
npm start
```

### Navigation

- **Écran d'accueil** : Boutons "Scanner QR Code" et "Historique"
- **Scanner** : Pointer la caméra vers le QR code du ticket
- **Résultats** : Validation en temps réel avec feedback visuel
- **Historique** : Liste de toutes les validations effectuées

### Fonctionnalités

- ✅ **Scanner QR** automatique avec détection rapide
- ✅ **Validation en temps réel** via API backend
- ✅ **Historique complet** des validations
- ✅ **Gestion d'erreurs** avec messages explicites
- ✅ **Interface intuitive** avec thème SOTRAL vert

## 🔧 Backend API

### Endpoints Principaux

#### Validation de Tickets

```bash
POST /tickets/validate
Headers: Authorization: Bearer <token>
Body: {"ticket_code": "SOT..."}
```

#### Historique Validateur

```bash
GET /tickets/my-validation-history
Headers: Authorization: Bearer <token>
```

#### Historique Propriétaire

```bash
GET /tickets/my-ticket-validations
Headers: Authorization: Bearer <token>
```

#### Statistiques (Admin)

```bash
GET /tickets/validation-stats
Headers: Authorization: Bearer <token>
```

## 🗄️ Base de Données

### Tables Principales

- **`users`** : Comptes utilisateurs (validateurs, clients, admin)
- **`tickets`** : Tickets SOTRAL avec statuts
- **`validation_history`** : Historique complet des validations
- **`ticket_products`** : Types de tickets (T100, T150, etc.)

### Exemple de Données

```sql
-- Tickets de test disponibles
SELECT code, status, user_id FROM tickets 
WHERE status = 'unused' 
ORDER BY purchased_at DESC;

-- Historique des validations
SELECT ticket_code, validation_status, validator_name, validated_at 
FROM validation_history 
ORDER BY validated_at DESC;
```

## 🎯 Cas d'Usage

### 1. Validation Normale

```text
1. Validateur ouvre l'app
2. Appuie sur "Scanner QR Code"
3. Pointe la caméra vers le ticket
4. QR code détecté automatiquement
5. Validation envoyée à l'API
6. Résultat affiché (✅ VALIDE / ❌ INVALIDE)
7. Historique mis à jour
```

### 2. Consultation Historique

```text
1. Validateur ouvre l'app
2. Appuie sur "Historique (X)"
3. Liste des validations s'affiche
4. Détails de chaque validation visible
5. Bouton actualisation disponible
```

### 3. Gestion Erreurs

```text
- Ticket déjà utilisé → Message "Ticket déjà utilisé"
- Ticket inexistant → Message "Ticket non trouvé"
- Pas de réseau → Message "Pas de connexion"
- Token expiré → Message "Non autorisé"
```

## 🧪 Tests et Démonstration

### Tickets de Test Disponibles

```bash
# Tickets créés pour démonstration
SOT28829249167317    # ✅ Validé (statut: used)
SOT17594876421928092 # ✅ Validé (statut: used) 
SOT1759488359999     # ✅ Validé (statut: used)
```

### Script de Démonstration

```bash
# Exécuter la simulation complète
./demo-mobile-scan.sh

# Vérifier le statut du système
./test-validation-system.sh
```

### Tests Manuels Base de Données

```sql
-- Créer un nouveau ticket pour test
INSERT INTO tickets (id, user_id, product_code, code, status, purchased_at, purchase_method)
VALUES (gen_random_uuid(), 70, 'T100', 'SOT' || EXTRACT(epoch FROM NOW())::bigint,
        'unused', NOW(), 'test');

-- Valider manuellement
UPDATE tickets SET status = 'used', used_at = NOW() WHERE code = 'SOT...';

-- Ajouter à l'historique
INSERT INTO validation_history (ticket_id, ticket_code, validator_id, validation_status,
                               validator_name, notes)
VALUES ((SELECT id FROM tickets WHERE code = 'SOT...'), 'SOT...', 70, 'valid',
        'Test Manual', 'Test de validation manuelle');
```

## 🔐 Sécurité

### Authentification

- **JWT Tokens** requis pour toutes les API
- **Rôles utilisateurs** : `validator`, `admin`, `user`
- **Vérification des permissions** à chaque validation

### Données Sensibles

- **Mots de passe** hashés avec bcrypt
- **Tokens** avec expiration (7 jours)
- **Logs complets** de toutes les tentatives

## 📊 Monitoring

### Métriques Disponibles

- **Nombre total de validations**
- **Validations par validateur**
- **Taux de succès/échec**
- **Historique chronologique**

### Requêtes Utiles

```sql
-- Statistiques globales
SELECT 
  validation_status, 
  COUNT(*) as total,
  COUNT(DISTINCT validator_id) as unique_validators
FROM validation_history 
GROUP BY validation_status;

-- Top validateurs
SELECT 
  validator_name, 
  COUNT(*) as total_validations,
  COUNT(CASE WHEN validation_status = 'valid' THEN 1 END) as successful
FROM validation_history 
GROUP BY validator_name, validator_id
ORDER BY total_validations DESC;
```

## 🔧 Maintenance

### Logs d'Application

```bash
# Logs du backend
tail -f /path/to/backend/logs/server.log

# Logs de l'app mobile
npx expo logs --type android  # ou ios
```

### Sauvegarde Base de Données

```bash
# Export complet
pg_dump -h [host] -U [user] -d [database] > backup.sql

# Export table validation_history uniquement
pg_dump -h [host] -U [user] -d [database] -t validation_history > validation_backup.sql
```

## 🚀 Déploiement Production

### Prérequis

1. **Base de données PostgreSQL** configurée
2. **Backend Node.js** déployé (Render/Heroku)
3. **Application mobile** compilée (Expo Build)
4. **Certificats SSL** pour HTTPS

### Configuration

```javascript
// Config production dans App.js
const API_BASE_URL = 'https://votre-backend.herokuapp.com';
const JWT_TOKEN = 'obtenu_via_login_reel';
```

### Checklist Déploiement

- [ ] Base de données migrée
- [ ] Backend testé en production
- [ ] Tokens JWT configurés
- [ ] Application mobile testée
- [ ] Permissions caméra accordées
- [ ] Tests end-to-end validés

---

**🎯 Système Opérationnel** - Prêt pour validation terrain et déploiement client!
