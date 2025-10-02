# Système SOTRAL - Guide Complet

## 📋 Vue d'ensemble

Ce système de transport SOTRAL comprend les vraies lignes de transport urbain de Lomé avec leurs itinéraires, distances et tarifs officiels. Il permet de gérer 22 lignes de transport avec génération automatique de tickets et validation via QR codes.

## 🗺️ Lignes de Transport Implémentées

### Lignes Ordinaires (Tarifs Variables)
| Ligne | Itinéraire | Distance | Arrêts | Tarifs |
|-------|------------|----------|--------|--------|
| 1 | Zanguéra ↔ BIA (Centre-ville) | 19.4 km | 68 | 100-300 FCFA |
| 2 | Adétikopé ↔ REX (front de mer) | 24.5 km | 62 | 100-300 FCFA |
| 3 | Akato ↔ BIA | 19.2 km | 68 | 100-300 FCFA |
| 6 | Agoè-Assiyéyé ↔ BIA | 16.3 km | 60 | 100-200 FCFA |
| 7 | Kpogan ↔ BIA | 19.7 km | 58 | 100-200 FCFA |
| 8 | Djagblé ↔ REX | 18.9 km | 49 | 100-300 FCFA |
| 10 | Legbassito ↔ BIA | 24.2 km | 74 | 100-300 FCFA |
| 11 | Attiegouvi ↔ REX | 9.5 km | 43 | 100 FCFA |
| 12 | Entreprise de l'Union ↔ BIA | 15.3 km | 66 | 100-250 FCFA |

### Lignes Étudiantes (Tarif Unique 100 FCFA)
| Ligne | Itinéraire | Distance | Arrêts |
|-------|------------|----------|--------|
| 13 | Adétikopé ↔ Campus (Université) | 17.8 km | 51 |
| 14 | Legbassito ↔ Campus | 17.3 km | 38 |
| 15 | Zanguéra ↔ Campus | 13.2 km | 64 |
| 16 | Akato ↔ Campus | 18.0 km | 58 |
| 17 | Adjalolo ↔ Campus | 11.1 km | 40 |
| 18 | Adakpamé ↔ Campus | 13.0 km | 56 |
| 19 | Akodesséwa-Bè ↔ Campus | 13.0 km | 45 |
| 20 | Avépozo ↔ Campus | 18.0 km | 71 |
| 21 | Entreprise de l'Union ↔ Campus | 11.0 km | 45 |
| 22 | Djagblé ↔ Campus | 16.4 km | 41 |

## 💰 Système Tarifaire

### Lignes Ordinaires (calcul automatique par distance)
- **Zone 1** (≤ 5 km) : 100 FCFA
- **Zone 2** (≤ 10 km) : 150 FCFA  
- **Zone 3** (≤ 15 km) : 200 FCFA
- **Zone 4** (≤ 20 km) : 250 FCFA
- **Zone 5** (> 20 km) : 300 FCFA

### Lignes Étudiantes
- **Tarif unique** : 100 FCFA (toutes distances)

### Types de Tickets
1. **Ticket Simple** : 1 voyage, valide 2h
2. **Ticket Étudiant** : 1 voyage, valide 2h, 100 FCFA
3. **Carnet Étudiant** : 10 voyages, valide 1 semaine
4. **Abonnement Étudiant** : Illimité, valide 1 an

## 🚀 Installation et Configuration

### 1. Initialiser la Base de Données

```bash
cd back/
./init-sotral.sh
```

Ce script va :
- Créer toutes les tables SOTRAL
- Insérer les 22 lignes avec leurs données réelles
- Créer les arrêts principaux
- Configurer les zones tarifaires
- Installer les fonctions de calcul automatique

### 2. Démarrer le Backend

```bash
cd back/
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:7000`

### 3. Démarrer l'Interface Admin

```bash
cd admin/
npm install
npm run dev
```

L'interface admin est accessible sur `http://localhost:3000`

### 4. Démarrer l'App Mobile

```bash
cd front/
npm install
npx expo start
```

### 5. App Scanner (optionnel)

```bash
cd scan/
npm install
npx expo start
```

## 🎛️ Interface Admin SOTRAL

Accédez à l'interface admin via : `http://localhost:3000/sotral`

### Fonctionnalités disponibles :

#### 📊 Dashboard
- Statistiques en temps réel
- Nombre de lignes actives
- Tickets générés
- Revenus par ligne

#### 🚌 Gestion des Lignes
- Visualiser toutes les lignes
- Activer/désactiver des lignes
- Modifier les informations
- Voir les statistiques par ligne

#### 🎫 Génération de Tickets
- **Génération individuelle** : Pour une ligne spécifique
- **Génération en masse** : Pour toutes les lignes actives
- Configuration de la validité
- Types de tickets personnalisables

#### 📈 Rapports et Analytics
- Revenus par ligne
- Utilisation des tickets
- Statistiques temporelles
- Export des données

## 📱 Utilisation Frontend Mobile

### Service SOTRAL

```typescript
import SotralMobileService from './services/sotral-service';

// Authentification
SotralMobileService.setAuthToken(userToken);

// Récupérer les lignes
const lines = await SotralMobileService.getAllLines();

// Calculer un prix
const pricing = await SotralMobileService.calculatePrice({
  lineId: 1,
  stopFromId: 1,
  stopToId: 5,
  isStudent: false
});

// Acheter un ticket
const ticket = await SotralMobileService.purchaseTicket({
  ticket_type_code: 'SIMPLE',
  line_id: 1,
  payment_method: 'mobile_money',
  payment_details: {
    phone: '+22890123456',
    operator: 'Moov'
  }
});

// Récupérer mes tickets
const myTickets = await SotralMobileService.getMyTickets();
```

## 🔍 App Scanner

### Service Scanner

```typescript
import SotralScannerService from './services/sotral-scanner-service';

// Initialiser le scanner
SotralScannerService.initializeScanner({
  scanner_id: 'SCANNER_001',
  line_id: 1,
  stop_id: 2,
  location: { latitude: 6.1319, longitude: 1.2228 }
});

// Valider un ticket
const result = await SotralScannerService.validateTicketQR(qrCode);

if (result.success) {
  console.log('✅ Ticket valide:', result.ticket);
} else {
  console.log('❌ Validation échouée:', result.message);
}
```

## 🛠️ API Endpoints

### Endpoints Publics (Frontend/Mobile)

#### Lignes et Arrêts
```
GET    /sotral/lines                    # Toutes les lignes
GET    /sotral/lines/:id                # Une ligne spécifique
GET    /sotral/lines/category/:id       # Lignes par catégorie
GET    /sotral/lines/:id/stops          # Arrêts d'une ligne
GET    /sotral/stops                    # Tous les arrêts
GET    /sotral/ticket-types             # Types de tickets
```

#### Tarification et Achat
```
POST   /sotral/calculate-price          # Calculer un prix
POST   /sotral/purchase                 # Acheter un ticket
GET    /sotral/my-tickets               # Mes tickets
```

#### Validation (Scanner)
```
POST   /sotral/validate-ticket          # Valider un ticket
GET    /sotral/ticket/:code             # Détails d'un ticket
```

### Endpoints Admin

#### Gestion des Lignes
```
GET    /admin/sotral/lines              # Toutes les lignes (admin)
POST   /admin/sotral/lines              # Créer une ligne
PUT    /admin/sotral/lines/:id          # Modifier une ligne
DELETE /admin/sotral/lines/:id          # Supprimer une ligne
POST   /admin/sotral/lines/:id/toggle-status  # Activer/désactiver
```

#### Génération de Tickets
```
POST   /admin/sotral/generate-tickets         # Générer pour une ligne
POST   /admin/sotral/bulk-generate-tickets    # Génération en masse
```

#### Analytics
```
GET    /admin/sotral/dashboard-stats    # Stats dashboard
GET    /admin/sotral/tickets            # Tous les tickets (avec filtres)
```

## 🔧 Configuration

### Variables d'Environnement

#### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/go_transport
JWT_SECRET=your_jwt_secret_here
API_PORT=7000
```

#### Frontend Mobile
```typescript
// Dans services/sotral-service.ts
const API_BASE_URL = 'http://localhost:7000'; // ou votre URL de production
```

#### Admin Interface
```typescript
// Dans services/apiClient.ts
const API_BASE_URL = 'http://localhost:7000'; // ou votre URL de production
```

## 🧪 Tests et Validation

### 1. Tester la Base de Données
```bash
cd back/
npm run test-db
```

### 2. Tester les Endpoints
```bash
# Health check
curl http://localhost:7000/sotral/health

# Récupérer les lignes
curl http://localhost:7000/sotral/lines

# Calculer un prix
curl -X POST http://localhost:7000/sotral/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"lineId": 1, "isStudent": false}'
```

### 3. Interface Admin
1. Accéder à `http://localhost:3000/sotral`
2. Vérifier que les 22 lignes sont affichées
3. Tester la génération de tickets
4. Vérifier les statistiques

## 📊 Monitoring et Logs

### Logs Backend
- Toutes les validations de tickets sont loggées
- Erreurs de paiement tracées
- Performance des endpoints monitorée

### Analytics Admin
- Revenus par ligne en temps réel
- Taux d'utilisation des tickets
- Lignes les plus populaires
- Tendances temporelles

## 🚨 Dépannage

### Problèmes Courants

#### Base de données ne se connecte pas
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Vérifier les credentials
psql -h localhost -U postgres -d go_transport
```

#### Erreurs d'endpoints
```bash
# Vérifier les routes
curl http://localhost:7000/debug-routes
```

#### QR codes invalides
- Vérifier le format des codes générés
- S'assurer que les tickets ne sont pas expirés
- Vérifier la connexion scanner ↔ backend

### Logs Utiles
```bash
# Backend logs
cd back/
npm run dev | grep SOTRAL

# Admin logs
cd admin/
npm run dev

# Check database
cd back/
./scripts/test-db.sh
```

## 📈 Évolutions Futures

### Fonctionnalités Prévues
1. **Géolocalisation** : Validation par position GPS
2. **Paiements mobiles** : Intégration Moov/Togocel
3. **Planning temps réel** : Horaires dynamiques
4. **Multi-langues** : Français/Ewé/Anglais
5. **Analytics avancés** : Prédictions de demande

### API Futures
```
POST   /sotral/schedule/real-time       # Horaires en temps réel
POST   /sotral/payment/mobile-money     # Paiement mobile
GET    /sotral/analytics/predictions    # Prédictions IA
POST   /sotral/notifications/push       # Notifications push
```

## 👥 Support

Pour toute question ou problème :
1. Vérifier les logs backend/frontend
2. Consulter la documentation API
3. Tester avec les endpoints de debug
4. Vérifier la configuration de la base de données

---

**Status** : ✅ Production Ready  
**Version** : 1.0.0  
**Dernière mise à jour** : Septembre 2025