# 🎯 GoSOTRAL Scan - Guide Rapide de Validation

## ⚡ Comment Ça Marche ?

### 📱 Flux d'Utilisation

```
1. Ouvrir l'app GoSOTRAL Scan
2. Appuyer sur "Scanner QR Code"
3. Pointer la caméra vers le QR code du ticket
4. L'app envoie le code au backend via https://go-j2rr.onrender.com
5. Le backend vérifie dans la base de données PostgreSQL
6. Résultat affiché : ✅ VALIDE ou ❌ INVALIDE
```

---

## 🔐 Configuration Backend

### Base de Données PostgreSQL

```bash
Host: dpg-d305h0mr433s73euqgfg-a.oregon-postgres.render.com
Database: gosotral_db
User: gosotral_user
Password: Ps33lqNo85kEjLVgosFFxcWsCsnt3z3W
```

### API Backend

```
URL: https://go-j2rr.onrender.com
```

### Routes Utilisées

| Route | Méthode | Description |
|-------|---------|-------------|
| `/tickets/validate` | POST | Valider un ticket QR |
| `/scan/history` | GET | Historique des scans |
| `/tickets/stats` | GET | Statistiques |

---

## 🎫 Validation de Ticket

### 1. Scanner le QR Code

Quand un passager présente son ticket QR :
- L'app ouvre la caméra
- Détecte automatiquement le QR code
- Extrait le `ticket_code`

### 2. Envoi au Backend

```javascript
POST /tickets/validate
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
Body: {
  "ticket_code": "ABC123XYZ"
}
```

### 3. Vérification Backend

Le backend effectue ces vérifications :

```sql
-- 1. Trouver le ticket
SELECT * FROM tickets WHERE code = 'ABC123XYZ';

-- 2. Vérifier le statut
-- Si status = 'unused' → OK, continuer
-- Si status = 'used' → ERREUR: Ticket déjà utilisé
-- Si status = 'expired' → ERREUR: Ticket expiré

-- 3. Marquer comme utilisé
UPDATE tickets 
SET status = 'used', used_at = NOW()
WHERE code = 'ABC123XYZ'
RETURNING *;
```

### 4. Réponse Affichée

#### ✅ Ticket Valide

```
✅ TICKET VALIDE

🎫 Code: ABC123XYZ
📦 Produit: Ticket Journée
👤 Client: john@example.com
💰 Prix: 200 FCFA
📅 Achat: 02/10/2025 10:30

[Scanner Suivant] [Retour]
```

#### ❌ Ticket Invalide

```
❌ TICKET INVALIDE

Raison: Ticket déjà utilisé
(ou: Ticket expiré / Ticket introuvable)

[Scanner Autre] [Retour]
```

---

## 📊 Structure Base de Données

### Table `tickets`

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  product_code VARCHAR(50) NOT NULL,
  route_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'unused',
  purchased_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_tickets_code ON tickets(code);
CREATE INDEX idx_tickets_status ON tickets(status);
```

### Statuts de Ticket

| Statut | Description | Action |
|--------|-------------|--------|
| `unused` | Non utilisé | ✅ Peut être validé |
| `used` | Déjà utilisé | ❌ Rejeté |
| `expired` | Expiré | ❌ Rejeté |
| `cancelled` | Annulé | ❌ Rejeté |

---

## 🚀 Démarrage Rapide

### 1. Lancer le Backend (si local)

```bash
cd /home/connect/kev/Go/back
npm run dev
```

### 2. Lancer l'App Scan

```bash
cd /home/connect/kev/Go/scan
npx expo start --clear --port 8083 --go
```

### 3. Ouvrir avec Expo Go

1. Installer **Expo Go** sur Android/iOS
2. Scanner le QR code du terminal
3. L'app se charge automatiquement

---

## 🔧 Configuration App

### Fichier: `src/config/index.ts`

```typescript
// URL du backend en production
export const API_BASE_URL = 'https://go-j2rr.onrender.com'

// Clés de stockage
export const STORAGE_KEY_TOKEN = 'scan_token'
export const STORAGE_KEY_OPERATOR = 'scan_operator'

// Paramètres
export const API_TIMEOUT = 15000 // 15 secondes
export const SCAN_INTERVAL = 1000 // 1 seconde entre scans
export const DEBUG_MODE = __DEV__ || false
```

---

## 🎨 Écrans de l'App

### 1. Écran d'Accueil (`/`)

- Bouton "Scanner QR Code"
- Bouton "Historique"
- Statistiques du jour (maquette)

### 2. Scanner (`/scanner`)

- Caméra en temps réel
- Cadre de scan
- Feedback haptique (vibrations)
- Validation instantanée

### 3. Historique (`/history`)

- Liste des tickets scannés
- Filtres par statut
- Pull-to-refresh
- Détails de chaque scan

---

## 🐛 Debug

### Voir les Logs

Les logs apparaissent automatiquement dans le terminal Expo :

```
🔧 Initialisation ApiClient avec: https://go-j2rr.onrender.com
🎫 Scan QR Code: ABC123XYZ
🔍 [SCAN API] Requête: POST /tickets/validate
📥 Réponse validation: { success: true, ... }
✅ Ticket validé: { code: "ABC123XYZ", status: "used" }
```

### Tester l'API Manuellement

```bash
# Test de validation
curl -X POST https://go-j2rr.onrender.com/tickets/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"ticket_code": "TEST_CODE"}'

# Test de santé
curl https://go-j2rr.onrender.com/health
```

---

## ⚠️ Important

### Authentification Requise

L'app nécessite :
- Un compte utilisateur avec rôle `validator` ou `admin`
- Token JWT valide
- Connexion internet active

### Permissions Nécessaires

- **Caméra** : Pour scanner les QR codes
- **Internet** : Pour communiquer avec l'API
- **Vibration** : Pour le feedback haptique (optionnel)

---

## 📝 Checklist de Test

- [ ] L'app démarre sans erreur
- [ ] La caméra s'ouvre correctement
- [ ] Un QR code est détecté
- [ ] La requête API est envoyée
- [ ] La réponse est affichée correctement
- [ ] Le ticket est marqué "used" dans la BD
- [ ] L'historique s'affiche
- [ ] Les statistiques se mettent à jour

---

## 🎯 Prochaines Étapes

1. **Connecter un compte validator**
2. **Générer un ticket de test**
3. **Scanner le QR code**
4. **Vérifier la validation**
5. **Consulter l'historique**

---

**Version**: 1.0.0  
**Backend**: https://go-j2rr.onrender.com  
**Base de données**: PostgreSQL sur Render  
**Dernière mise à jour**: 2 octobre 2025
