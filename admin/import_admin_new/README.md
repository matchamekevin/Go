# 🚌 SOTRAL Admin Dashboard v2.0

Interface d'administration moderne pour le système de transport SOTRAL, complètement refactorisée avec une architecture logique et des fonctionnalités améliorées.

## 📋 **Vue d'ensemble**

Cette nouvelle interface admin permet de :
- ✅ **Gérer les lignes SOTRAL** (création, modification, activation/désactivation)
- ✅ **Générer des tickets en masse** pour les lignes
- ✅ **Visualiser et supprimer les tickets** existants
- ✅ **Consulter les statistiques** détaillées du système
- ✅ **Interface responsive** et moderne

## 🏗️ **Architecture technique**

### **Structure des dossiers**
```
src/
├── features/                    # Modules métier
│   ├── lines/                  # Gestion des lignes
│   │   ├── services/           # API calls pour les lignes
│   │   ├── hooks/              # React Query hooks
│   │   ├── components/         # Composants spécialisés
│   │   └── pages/              # Pages de gestion des lignes
│   ├── tickets/                # Gestion des tickets
│   │   ├── services/           # API calls pour les tickets
│   │   ├── hooks/              # React Query hooks
│   │   ├── components/         # Composants spécialisés
│   │   └── pages/              # Pages de gestion des tickets
│   └── analytics/              # Dashboard et statistiques
│       ├── services/           # API calls pour les stats
│       └── pages/              # Dashboard principal
└── shared/                     # Code partagé
    ├── components/             # Composants réutilisables
    ├── services/               # Client API centralisé
    ├── hooks/                  # Hooks utilitaires
    └── types/                  # Types TypeScript partagés
```

### **Technologies utilisées**
- ⚛️ **React 18** + **TypeScript**
- 🎨 **Tailwind CSS** pour le design
- 🔄 **React Query** pour la gestion d'état et cache
- 🛣️ **React Router** pour la navigation
- 📡 **Axios** pour les appels API
- 🎯 **React Hook Form** + **Zod** pour les formulaires
- 🔥 **React Hot Toast** pour les notifications
- 🎨 **Lucide React** pour les icônes

## 🚀 **Installation et développement**

### **Prérequis**
- Node.js 18+
- npm ou yarn
- Backend SOTRAL en fonctionnement (http://localhost:7000)

### **Installation**
```bash
# Cloner le projet
cd admin-new

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local

# Démarrer en mode développement
npm run dev
```

### **Variables d'environnement**
```env
VITE_API_BASE_URL=http://localhost:7000
```

## 🔧 **Configuration API**

L'admin se connecte au backend via les endpoints suivants :

### **Endpoints Lignes**
- `GET /api/admin/sotral/lines` - Récupérer toutes les lignes
- `POST /api/admin/sotral/lines` - Créer une nouvelle ligne
- `PUT /api/admin/sotral/lines/:id` - Modifier une ligne
- `DELETE /api/admin/sotral/lines/:id` - Supprimer une ligne
- `POST /api/admin/sotral/lines/:id/toggle-status` - Activer/désactiver

### **Endpoints Tickets**
- `GET /api/admin/sotral/tickets` - Lister les tickets (pagination + filtres)
- `DELETE /api/admin/sotral/tickets/:id` - Supprimer un ticket
- `GET /api/sotral/generated-tickets` - Tickets publics pour mobile
- `POST /api/admin/sotral/generate-tickets` - Générer des tickets pour une ligne
- `POST /api/admin/sotral/bulk-generate-tickets` - Génération en masse

### **Endpoints Analytics**
- `GET /api/admin/sotral/dashboard-stats` - Statistiques pour le dashboard

## 📱 **Fonctionnalités principales**

### **1. Dashboard analytique**
- 📊 Vue d'ensemble des ventes et revenus
- 📈 Statistiques en temps réel
- 🏆 Top des lignes les plus populaires
- 📋 Distribution des statuts de tickets
- ⚡ Actions rapides vers les autres modules

### **2. Gestion des lignes**
- ➕ Création de nouvelles lignes avec autocomplétion
- ✏️ Modification des lignes existantes
- 🔄 Activation/désactivation des lignes
- 🗑️ Suppression sécurisée
- 🔍 Recherche et filtres
- 📋 Vue liste avec informations complètes

### **3. Gestion des tickets**
- 📋 Liste paginée de tous les tickets
- 🔍 Filtres par statut, ligne, utilisateur, date
- 🗑️ Suppression individuelle ou en masse
- 👁️ Détails complets des tickets
- 📱 QR codes pour validation

### **4. Génération de tickets**
- 🎯 Génération pour une ligne spécifique
- 🚀 Génération en masse pour toutes les lignes
- ⚙️ Configuration de la quantité et durée de validité
- 📊 Rapport de génération détaillé
- 📱 Tickets automatiquement disponibles sur mobile

## 🎨 **Design et UX**

### **Principes de design**
- 🎨 **Design moderne** avec Tailwind CSS
- 📱 **Responsive** sur tous les écrans
- ♿ **Accessible** avec les bonnes pratiques
- ⚡ **Performances** optimisées avec React Query
- 🔄 **États de loading** et gestion d'erreurs
- ✨ **Animations** fluides et feedback utilisateur

### **Palette de couleurs**
- 🟢 **Primary**: Emerald (thème SOTRAL)
- 🔵 **Secondary**: Blue pour les actions
- 🟡 **Warning**: Yellow pour les alertes
- 🔴 **Error**: Red pour les erreurs
- ⚫ **Neutral**: Gray pour le texte et arrière-plans

## 🔄 **Flux de données**

### **Architecture React Query**
```
UI Component 
    ↕️
React Query Hook 
    ↕️
Service Layer 
    ↕️
API Client 
    ↕️
Backend SOTRAL
```

### **Gestion du cache**
- 📦 **Cache intelligent** avec React Query
- ⏰ **Invalidation automatique** après mutations
- 🔄 **Refetch en arrière-plan** pour données fraîches
- 💾 **Persistence** locale pour offline

## 🚨 **Gestion des erreurs**

### **Types d'erreurs gérées**
- 🔐 **401 Unauthorized**: Redirection vers login
- 🚫 **403 Forbidden**: Message d'accès refusé
- 🔍 **404 Not Found**: Ressource introuvable
- ⚠️ **400 Bad Request**: Validation côté serveur
- 🔧 **500 Server Error**: Erreur serveur
- 🌐 **Network Error**: Problème de connexion

### **Affichage des erreurs**
- 🎯 **Toasts** pour les erreurs temporaires
- 📋 **Alerts** pour les erreurs de validation
- 🔄 **Retry buttons** pour les erreurs réseau
- 📖 **Messages explicites** avec suggestions

## 🧪 **Tests et qualité**

### **Structure de tests**
```bash
# Tests unitaires des composants
npm run test

# Tests d'intégration E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### **Qualité du code**
- ✅ **TypeScript strict** pour la sécurité des types
- 🔍 **ESLint** pour les règles de code
- 🎨 **Prettier** pour le formatage
- 📏 **Husky** pour les pre-commit hooks

## 🚀 **Déploiement**

### **Build de production**
```bash
# Build optimisé
npm run build

# Preview du build
npm run preview
```

### **Variables de production**
```env
VITE_API_BASE_URL=https://go-j2rr.onrender.com
```

## 🔧 **Maintenance et évolutions**

### **Points d'attention**
1. 🔄 **Synchronisation** avec les changements backend
2. 📱 **Compatibilité mobile** pour les nouveaux composants
3. 🔐 **Sécurité** des appels API et validation
4. 📊 **Performance** du cache et requêtes
5. ♿ **Accessibilité** des nouveaux éléments UI

### **Améliorations futures**
- [ ] **Authentification** complète avec rôles
- [ ] **Exports** CSV/Excel des données
- [ ] **Notifications** en temps réel
- [ ] **Mode sombre** 
- [ ] **Graphiques avancés** avec recharts
- [ ] **PWA** pour installation mobile
- [ ] **Internationalisation** (i18n)

## 📞 **Support**

Pour toute question ou problème :
1. 📖 Consulter cette documentation
2. 🔍 Vérifier les logs du navigateur
3. 🔧 Tester les endpoints API manuellement
4. 📬 Contacter l'équipe de développement

---

**Version**: 2.0.0  
**Dernière mise à jour**: Septembre 2025  
**Compatibilité**: Backend SOTRAL v1.x+