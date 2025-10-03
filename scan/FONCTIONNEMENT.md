# 📱 GoSOTRAL Scan - Guide de Fonctionnement

## 🎯 Objectif

L'application **GoSOTRAL Scan** permet aux contrôleurs et validateurs SOTRAL de :

1. **Scanner les QR codes** des tickets des passagers
2. **Valider en temps réel** via l'API backend
3. **Afficher le résultat** : ticket valide ✅ ou invalide ❌

---

## 🔐 Authentification Requise

### Connexion Obligatoire

Pour utiliser l'app scan, l'utilisateur DOIT :

- Avoir un compte avec le rôle `validator` ou `admin`
- Se connecter pour obtenir un **token JWT**
- Le token est stocké dans AsyncStorage et envoyé automatiquement avec chaque requête

### Rôles Autorisés

| Rôle | Permission | Description |
|------|------------|-------------|
| `validator` | ✅ Validation tickets | Contrôleur SOTRAL |
| `admin` | ✅ Validation tickets | Administrateur système |
| `user` | ❌ Non autorisé | Passager normal |

---

## 🔄 Workflow de Validation

### 1️⃣ Scanner le QR Code

```
Passager montre son ticket QR
     ↓
Camera scan le QR code
     ↓
Données extraites: { ticket_code: "XXXXXXXX" }
```

### 2️⃣ Envoi au Backend

**Endpoint** : `POST /tickets/validate`

**Headers** :

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body** :

```json
{
  "ticket_code": "XXXXXXXX"
}
```

### 3️⃣ Vérifications Backend

Le backend vérifie :

1. ✅ Token JWT valide
2. ✅ Rôle = `validator` ou `admin`
3. ✅ Ticket existe dans la base de données
4. ✅ Statut du ticket = `unused` (non utilisé)
5. ✅ Ticket non expiré

### 3️⃣ Vérifications Backend

Le backend vérifie :

1. ✅ Token JWT valide
2. ✅ Rôle = `validator` ou `admin`
3. ✅ Ticket existe dans la base de données
4. ✅ Statut du ticket = `unused` (non utilisé)
5. ✅ Ticket non expiré

### 4️⃣ Réponse API

#### ✅ Ticket Valide

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "XXXXXXXX",
    "status": "used",
    "product_name": "Ticket Journée",
    "user_email": "client@example.com",
    "purchased_at": "2025-10-02T10:30:00Z",
    "used_at": "2025-10-02T14:45:00Z"
  },
  "message": "Ticket validé avec succès"
}
```

**Affichage App** :

```
✅ TICKET VALIDE

🎫 Code: XXXXXXXX
📦 Produit: Ticket Journée
👤 Client: client@example.com
💰 Prix: 200 FCFA
📅 Achat: 02/10/2025 10:30

[Scanner Suivant] [Retour]
```

#### ❌ Ticket Invalide

##### Cas 1 : Ticket déjà utilisé

```json
{
  "success": false,
  "error": "Ticket déjà utilisé",
  "ticket_status": "used"
}
```

##### Cas 2 : Ticket expiré

```json
{
  "success": false,
  "error": "Ticket déjà expiré",
  "ticket_status": "expired"
}
```

##### Cas 3 : Ticket introuvable

```json
{
  "success": false,
  "error": "Ticket non trouvé"
}
```

##### Cas 4 : Non autorisé

```json
{
  "success": false,
  "error": "Non autorisé à valider des tickets"
}
```

**Affichage App** :

```
❌ TICKET INVALIDE

Ce ticket ne peut pas être utilisé.
Raison: Ticket déjà utilisé

[Scanner Autre] [Retour]
```

---

## 🗄️ Base de Données

### Connexion PostgreSQL

```bash
PGPASSWORD=Ps33lqNo85kEjLVgosFFxcWsCsnt3z3W \
psql -h dpg-d305h0mr433s73euqgfg-a.oregon-postgres.render.com \
     -U gosotral_user \
     -d gosotral_db
```

### Structure Tickets

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  product_code VARCHAR(50),
  route_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'unused',
  purchased_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB
);
```

### Requête de Validation

```sql
-- 1. Trouver le ticket
SELECT * FROM tickets WHERE code = $1;

-- 2. Vérifier le statut
-- Si status != 'unused' → ERREUR

-- 3. Marquer comme utilisé
UPDATE tickets 
SET status = 'used', 
    used_at = NOW()
WHERE code = $1
RETURNING *;
```

---

## 🔧 Configuration Technique

### URLs Backend

| Environnement | URL |
|---------------|-----|
| Production | `https://go-j2rr.onrender.com` |

### Routes API

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/tickets/validate` | POST | ✅ | Valider un ticket |
| `/tickets/stats` | GET | ✅ | Statistiques tickets |
| `/scan/history` | GET | ✅ | Historique scans |
| `/health` | GET | ❌ | Santé serveur |

### Configuration App

Fichier : `/scan/src/config/index.ts`

```typescript
export const API_BASE_URL = 'https://go-j2rr.onrender.com'
export const STORAGE_KEY_TOKEN = 'scan_token'
export const STORAGE_KEY_OPERATOR = 'scan_operator'
export const API_TIMEOUT = 15000
```

---

## 📱 Utilisation

### 1. Installation

```bash
# Avec Expo Go
1. Installer "Expo Go" sur Android/iOS
2. Scanner le QR code affiché dans le terminal
3. L'app se charge automatiquement

# Avec Development Build
npx expo run:android
npx expo run:ios
```

### 2. Connexion

**IMPORTANT** : L'utilisateur doit d'abord se connecter avec un compte `validator` ou `admin`.

```
📧 Email: validator@sotral.tg
🔒 Mot de passe: ********
```

Le token JWT est automatiquement stocké et utilisé pour toutes les requêtes.

### 3. Scanner un Ticket

1. Appuyer sur **"Scanner QR Code"**
2. Autoriser l'accès à la caméra
3. Placer le QR code dans le cadre
4. Attendre la validation (2-3 secondes)
5. Voir le résultat : ✅ Valide ou ❌ Invalide

### 4. Consulter l'Historique

- Appuyer sur **"Historique"**
- Voir tous les tickets scannés
- Filtrer par statut (valide/invalide)
- Rafraîchir avec pull-to-refresh

---

## 🐛 Dépannage

### Erreur: "Cannot read property 'keys' of undefined"

**Solution** : Cache Metro corrompu
```bash
cd /home/connect/kev/Go/scan
rm -rf node_modules/.cache .expo
npx expo start --clear --port 8083 --go
```

### Erreur: "Non autorisé à valider des tickets"

**Cause** : Token manquant ou rôle incorrect

**Solution** :

1. Vérifier que l'utilisateur est connecté
2. Vérifier le rôle de l'utilisateur (doit être `validator` ou `admin`)
3. Se reconnecter si le token a expiré

### Erreur: "Cannot POST /api/tickets/validate"

**Cause** : Route incorrecte

**Solution** : Utiliser `/tickets/validate` et non `/api/tickets/validate`

### Erreur: "Ticket non trouvé"

**Causes possibles** :

- Le QR code ne contient pas un code ticket valide
- Le ticket n'existe pas dans la base de données
- Le QR code est corrompu

---

## 📊 Logs de Debug

### Activer les logs

Les logs sont automatiquement activés en mode développement.

```typescript
export const DEBUG_MODE = __DEV__ || false
```

### Types de logs

```typescript
🔧 Initialisation ApiClient avec: https://go-j2rr.onrender.com
🔍 [SCAN API] Requête: POST /tickets/validate
📥 Réponse validation: { success: true, data: {...} }
✅ Ticket validé: { code: "XXXXXXXX", status: "used" }
❌ Erreur validation ticket: Error: Ticket déjà utilisé
```

---

## 🚀 Prochaines Fonctionnalités

- [ ] Mode hors ligne avec cache local
- [ ] Synchronisation des scans en différé
- [ ] Statistiques en temps réel
- [ ] Support NFC pour les cartes SOTRAL
- [ ] Scan par numéro de ticket manuel
- [ ] Export CSV de l'historique

---

## 👥 Support

Pour toute question ou problème :

- **Email** : <support@gosotral.tg>
- **Documentation** : `/home/connect/kev/Go/scan/README.md`
- **Logs** : Vérifier le terminal Expo

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2 octobre 2025
