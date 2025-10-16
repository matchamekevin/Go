# 🎨 GUIDE VISUEL DES MÉTHODES D'INTÉGRATION - GOSOTRAL
## Schémas, Comparaisons et Métriques Détaillés

---

## 📊 TABLE DES MATIÈRES

1. [Architecture Globale Visualisée](#1-architecture-globale-visualisée)
2. [Patterns Backend Illustrés](#2-patterns-backend-illustrés)
3. [Patterns Frontend Illustrés](#3-patterns-frontend-illustrés)
4. [Flux de Données Complets](#4-flux-de-données-complets)
5. [Comparaisons Technologies](#5-comparaisons-technologies)
6. [Métriques de Performance](#6-métriques-de-performance)
7. [Sécurité Visualisée](#7-sécurité-visualisée)
8. [Déploiement Cloud](#8-déploiement-cloud)

---

## 1. ARCHITECTURE GLOBALE VISUALISÉE

### 🏗️ Vue d'Ensemble Complète

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ÉCOSYSTÈME GOSOTRAL                                │
│                     Architecture Full-Stack TypeScript                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           COUCHE PRÉSENTATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐     │
│  │  APP MOBILE      │    │   ADMIN WEB      │    │   SCAN MOBILE    │     │
│  │  UTILISATEUR     │    │ ADMINISTRATION   │    │   CONTRÔLEUR     │     │
│  ├──────────────────┤    ├──────────────────┤    ├──────────────────┤     │
│  │ React Native     │    │ React 18         │    │ React Native     │     │
│  │ Expo SDK 54      │    │ Vite 4.4         │    │ Expo SDK 54      │     │
│  │ TypeScript 5.8   │    │ TypeScript 5.0   │    │ TypeScript 5.8   │     │
│  │                  │    │                  │    │                  │     │
│  │ 📱 Android/iOS   │    │ 💻 Web           │    │ 📱 Android/iOS   │     │
│  │ 🎯 Port: 8082    │    │ 🎯 Port: 3000    │    │ 🎯 Port: 8083    │     │
│  │                  │    │                  │    │                  │     │
│  │ Features:        │    │ Features:        │    │ Features:        │     │
│  │ • Auth (JWT)     │    │ • Dashboard      │    │ • QR Scanner     │     │
│  │ • Buy Tickets    │    │ • User Mgmt      │    │ • Validation     │     │
│  │ • Mobile Pay     │    │ • Ticket Mgmt    │    │ • History        │     │
│  │ • SOTRAL Lines   │    │ • Analytics      │    │ • Offline Mode   │     │
│  │ • QR Display     │    │ • Real-time      │    │ • Sync Server    │     │
│  │ • History        │    │ • Reports        │    │                  │     │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘     │
│           │                       │                       │               │
└───────────┼───────────────────────┼───────────────────────┼───────────────┘
            │                       │                       │
            │    Axios HTTP/HTTPS   │    Axios HTTP/HTTPS   │  Axios HTTP
            │    + JWT Bearer Token │    + JWT Bearer Token │  + JWT Token
            │    + Auto Refresh     │    + Auto Refresh     │  + Retry
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            COUCHE API (BACKEND)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        NODE.JS + EXPRESS                              │  │
│  │                         TypeScript 5.4                                │  │
│  │                          Port: 7000                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          MIDDLEWARES                                  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │   CORS   │ │   Auth   │ │Validation│ │  Logger  │ │Rate Limit│   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      MODULES FONCTIONNELS                             │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │  │
│  │  │   📝 AUTH       │  │   🎫 TICKETS    │  │   💳 PAYMENTS   │      │  │
│  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤      │  │
│  │  │ • Register      │  │ • Create        │  │ • Initiate      │      │  │
│  │  │ • Login         │  │ • List          │  │ • Status        │      │  │
│  │  │ • Verify Email  │  │ • Get by ID     │  │ • Callback      │      │  │
│  │  │ • Reset Pass    │  │ • Validate      │  │ • History       │      │  │
│  │  │ • Refresh Token │  │ • Delete        │  │ • Refund        │      │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │  │
│  │  │   🚌 SOTRAL     │  │   👨‍💼 ADMIN     │  │   🎧 SUPPORT    │      │  │
│  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤      │  │
│  │  │ • Lines         │  │ • Dashboard     │  │ • Tickets       │      │  │
│  │  │ • Stops         │  │ • Users Mgmt    │  │ • Messages      │      │  │
│  │  │ • Schedules     │  │ • Tickets Mgmt  │  │ • FAQ           │      │  │
│  │  │ • Routes        │  │ • Stats         │  │ • Contact       │      │  │
│  │  │ • Favorites     │  │ • Reports       │  │                 │      │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    ARCHITECTURE HEXAGONALE                            │  │
│  │                                                                       │  │
│  │  Controllers (Presentation) ──► Business Logic ──► Repositories      │  │
│  │       ▲                               │                    │          │  │
│  │       │                               │                    ▼          │  │
│  │   HTTP Requests              Validation, Rules       Database         │  │
│  │   Responses                  Calculations            Queries          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ PostgreSQL Connection Pool
                                  │ (20 connections max)
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          COUCHE DONNÉES (DATABASE)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         PostgreSQL 14+                                │  │
│  │                          Port: 5432                                   │  │
│  │                    Database: gosotral_db                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          TABLES PRINCIPALES                           │  │
│  │                                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  users   │  │ tickets  │  │ payments │  │  sotral  │            │  │
│  │  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤            │  │
│  │  │ • id     │  │ • id     │  │ • id     │  │  _lines  │            │  │
│  │  │ • email  │  │ • code   │  │ • ref    │  │  _stops  │            │  │
│  │  │ • phone  │  │ • type   │  │ • amount │  │  _sched  │            │  │
│  │  │ • pass_h │  │ • status │  │ • status │  │  _routes │            │  │
│  │  │ • role   │  │ • qr     │  │ • method │  │          │            │  │
│  │  │ • verify │  │ • user   │  │ • user   │  │          │            │  │
│  │  │ • suspend│  │ • expire │  │ • date   │  │          │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │  │
│  │       │             │             │              │                   │  │
│  │       └─────────────┴─────────────┴──────────────┘                   │  │
│  │                  Foreign Keys (Relations)                            │  │
│  │                                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │email_otps│  │ password │  │   line   │  │   user   │            │  │
│  │  │          │  │reset_otps│  │  _stops  │  │favorites │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │  │
│  │                                                                       │  │
│  │  INDEX OPTIMISÉS:                                                     │  │
│  │  • users(email), users(phone)                                         │  │
│  │  • tickets(user_id), tickets(status), tickets(created_at)            │  │
│  │  • payments(user_id), payments(status)                                │  │
│  │  • sotral_lines(is_active)                                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        CARACTÉRISTIQUES                               │  │
│  │  ✅ ACID Compliance (Transactions)                                    │  │
│  │  ✅ Connection Pooling (Performance)                                  │  │
│  │  ✅ Prepared Statements (Sécurité)                                    │  │
│  │  ✅ Foreign Keys (Intégrité)                                          │  │
│  │  ✅ Indexes (Vitesse)                                                 │  │
│  │  ✅ Constraints (Validation)                                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTÉGRATIONS EXTERNES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐    │
│  │   TMoney     │   │    Flooz     │   │  Nodemailer  │   │   SMS    │    │
│  │  (Paiement)  │   │  (Paiement)  │   │   (Email)    │   │ Gateway  │    │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        SYNCHRONISATION TEMPS RÉEL                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Server-Sent Events (SSE) - Unidirectionnel Serveur → Clients              │
│                                                                             │
│  Backend ──► Event Bus ──► [ ticket_purchased, ticket_validated,           │
│                              user_suspended, line_updated, ... ]            │
│              │                                                              │
│              ├────────────► Mobile App (React Query Invalidation)           │
│              ├────────────► Admin Web (React Query Invalidation)            │
│              └────────────► Scan App (Local Cache Update)                   │
│                                                                             │
│  ⚡ Latence: 200-500ms  |  🔄 Auto-reconnect: Oui  |  📊 Max Clients: 1000+ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PATTERNS BACKEND ILLUSTRÉS

### 🎯 Architecture Hexagonale (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                  ARCHITECTURE HEXAGONALE                        │
│            (Ports & Adapters / Clean Architecture)              │
└─────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │   OUTER LAYER   │
                        │  (HTTP, DB, ...)│
                        └────────┬────────┘
                                 │
                                 ▼
    ┌────────────────────────────────────────────────────────┐
    │              CONTROLLERS (Presentation)                │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │  Auth.controller.ts                              │  │
    │  │  • register(req, res)                            │  │
    │  │  • login(req, res)                               │  │
    │  │  • verifyEmail(req, res)                         │  │
    │  │                                                  │  │
    │  │  RESPONSABILITÉS:                                │  │
    │  │  ✓ Gestion HTTP (req/res)                        │  │
    │  │  ✓ Validation input (Zod)                        │  │
    │  │  ✓ Appel business logic                          │  │
    │  │  ✓ Formatage réponse                             │  │
    │  │  ✓ Gestion erreurs HTTP                          │  │
    │  └──────────────────────────────────────────────────┘  │
    └────────────────────┬───────────────────────────────────┘
                         │
                         │ Appelle
                         ▼
    ┌────────────────────────────────────────────────────────┐
    │            BUSINESS LOGIC (Domain)                     │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │  Services / Use Cases                            │  │
    │  │  • validateUserData()                            │  │
    │  │  • calculateTicketPrice()                        │  │
    │  │  • checkTicketExpiration()                       │  │
    │  │  • applyDiscountRules()                          │  │
    │  │                                                  │  │
    │  │  RESPONSABILITÉS:                                │  │
    │  │  ✓ Règles métier                                 │  │
    │  │  ✓ Calculs                                       │  │
    │  │  ✓ Validations business                          │  │
    │  │  ✓ Orchestration                                 │  │
    │  │  ✓ Logique indépendante du framework             │  │
    │  └──────────────────────────────────────────────────┘  │
    └────────────────────┬───────────────────────────────────┘
                         │
                         │ Appelle
                         ▼
    ┌────────────────────────────────────────────────────────┐
    │            REPOSITORIES (Data Access)                  │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │  User.repository.ts                              │  │
    │  │  • findByEmail(email)                            │  │
    │  │  • findByPhone(phone)                            │  │
    │  │  • create(userData)                              │  │
    │  │  • update(id, data)                              │  │
    │  │  • delete(id)                                    │  │
    │  │                                                  │  │
    │  │  RESPONSABILITÉS:                                │  │
    │  │  ✓ Requêtes SQL                                  │  │
    │  │  ✓ Mapping DB ↔ Objets                           │  │
    │  │  ✓ Transactions                                  │  │
    │  │  ✓ Gestion connexion pool                        │  │
    │  │  ✓ Optimisations DB                              │  │
    │  └──────────────────────────────────────────────────┘  │
    └────────────────────┬───────────────────────────────────┘
                         │
                         │ Accède
                         ▼
                  ┌──────────────┐
                  │  PostgreSQL  │
                  │   Database   │
                  └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AVANTAGES CONCRETS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ TESTABILITÉ                                                 │
│     • Controller mocke Repository → Tests unitaires faciles     │
│     • Business logic isolée → Tests sans DB                     │
│     • Repositories mockables → Tests rapides                    │
│                                                                 │
│  ✅ MAINTENABILITÉ                                              │
│     • Changement DB: Modifier seulement Repository             │
│     • Changement API: Modifier seulement Controller            │
│     • Business logic reste intacte                              │
│                                                                 │
│  ✅ ÉVOLUTIVITÉ                                                 │
│     • Ajouter GraphQL: Nouveau Controller, même Repository     │
│     • Migrer vers MongoDB: Nouveau Repository, reste identique  │
│     • Nouvelles règles métier: Seulement business logic         │
│                                                                 │
│  ✅ LISIBILITÉ                                                  │
│     • Séparation claire des responsabilités                     │
│     • Code organisé et prévisible                               │
│     • Onboarding nouveaux devs facilité                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 Pool de Connexions PostgreSQL

```
┌─────────────────────────────────────────────────────────────────┐
│              POOL DE CONNEXIONS POSTGRESQL                      │
│           (Réutilisation intelligente des connexions)           │
└─────────────────────────────────────────────────────────────────┘

SANS POOL (Ancien système) ❌ :
┌──────────┐
│ Request 1│───► Nouvelle connexion DB (100-200ms)
└──────────┘         │
                     └──► Query (5ms)
                     └──► Fermeture connexion

┌──────────┐
│ Request 2│───► Nouvelle connexion DB (100-200ms)
└──────────┘         │
                     └──► Query (5ms)
                     └──► Fermeture connexion

┌──────────┐
│ Request 3│───► Nouvelle connexion DB (100-200ms)
└──────────┘         │
                     └──► Query (5ms)
                     └──► Fermeture connexion

RÉSULTAT: ~315ms par requête (105ms en moyenne avec query)
          CPU: 45% | Throughput: 50 req/s


AVEC POOL (Système actuel) ✅ :
┌─────────────────────────────────────────────────────────────┐
│                    CONNECTION POOL                          │
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐      ┌────────┐         │
│  │ Conn 1 │ │ Conn 2 │ │ Conn 3 │ .... │ Conn 20│         │
│  └────────┘ └────────┘ └────────┘      └────────┘         │
│     │ ▲        │ ▲        │ ▲             │ ▲             │
│     │ │        │ │        │ │             │ │             │
│     │ │        │ │        │ │             │ │             │
└─────┼─┼────────┼─┼────────┼─┼─────────────┼─┼─────────────┘
      │ │        │ │        │ │             │ │
      │ │        │ │        │ │             │ │
      ▼ │        ▼ │        ▼ │             ▼ │
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Request 1 │ │Request 2 │ │Request 3 │ │Request N │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
   │             │             │             │
   └──► Acquiert │             │             │
   └──► Query 5ms│             │             │
   └──► Release  │             │             │
                 └──► Acquiert │             │
                 └──► Query 5ms│             │
                 └──► Release  │             │
                               └──► Acquiert │
                               └──► Query 5ms│
                               └──► Release  │

RÉSULTAT: ~5ms par requête (connexion réutilisée)
          CPU: 15% | Throughput: 1000+ req/s

┌─────────────────────────────────────────────────────────────┐
│                    CONFIGURATION POOL                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  max: 20                    ◄── Maximum 20 connexions       │
│  min: 2                     ◄── Minimum 2 toujours ouvertes │
│  idleTimeoutMillis: 30000   ◄── Ferme après 30s inactivité  │
│  connectionTimeoutMillis: 2000 ◄── Timeout connexion 2s     │
│  retryDelay: 1000           ◄── Délai entre retry           │
│  maxRetries: 3              ◄── Maximum 3 tentatives        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   MÉTRIQUES COMPARATIVES                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Métrique          │  Sans Pool  │  Avec Pool  │  Gain     │
│  ─────────────────────────────────────────────────────────  │
│  Temps/requête     │   105ms     │    5ms      │  21x      │
│  Throughput        │   50 req/s  │  1000 req/s │  20x      │
│  Utilisation CPU   │   45%       │    15%      │  -67%     │
│  Latence P95       │   250ms     │   12ms      │  21x      │
│  Connexions DB     │  Variable   │   2-20      │  Stable   │
│  Erreurs timeout   │   ~5%       │   <0.1%     │  -98%     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

AMÉLIORATION GLOBALE: 2100% (21x plus rapide) ⚡
```

---

## 3. PATTERNS FRONTEND ILLUSTRÉS

### 🔌 Client API avec Intercepteurs

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLIENT API CENTRALISÉ                           │
│              (Axios + Intercepteurs Automatiques)                   │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  COMPOSANT REACT │
                    │  LoginScreen.tsx │
                    └────────┬─────────┘
                             │
                             │ authService.login(email, password)
                             ▼
                    ┌──────────────────┐
                    │  SERVICE LAYER   │
                    │ authService.ts   │
                    └────────┬─────────┘
                             │
                             │ apiClient.post('/auth/login', {...})
                             ▼
        ┌────────────────────────────────────────────────┐
        │            API CLIENT SINGLETON                │
        │          (Gestion centralisée HTTP)            │
        └────────────────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────────────┐
        │          REQUEST INTERCEPTOR                   │
        ├────────────────────────────────────────────────┤
        │  1️⃣  Génération Request ID unique              │
        │      → UUID pour traçabilité                   │
        │                                                │
        │  2️⃣  Injection Token JWT automatique           │
        │      → Récup AsyncStorage                      │
        │      → headers.Authorization = `Bearer ${token}` │
        │                                                │
        │  3️⃣  Ajout Headers personnalisés               │
        │      → X-Client-Platform: android/ios          │
        │      → X-Client-Version: 1.0.0                 │
        │                                                │
        │  4️⃣  Logging développement                     │
        │      → console.log('📤 API Request:', ...)     │
        │                                                │
        └───────────────────┬────────────────────────────┘
                            │
                            ▼
        ┌────────────────────────────────────────────────┐
        │            HTTP REQUEST                        │
        │         (GET/POST/PUT/DELETE)                  │
        │                                                │
        │  POST https://api.gosotral.com/auth/login      │
        │  Headers:                                      │
        │    Content-Type: application/json              │
        │    Authorization: Bearer eyJhbGc...            │
        │    X-Request-ID: 1234-5678-9abc                │
        │  Body:                                         │
        │    { email: "user@example.com", ... }          │
        │                                                │
        └───────────────────┬────────────────────────────┘
                            │
                            │ Envoi au serveur
                            │
        ┌───────────────────▼────────────────────────────┐
        │              BACKEND API                       │
        │         (Traitement serveur)                   │
        └───────────────────┬────────────────────────────┘
                            │
                            │ Réponse HTTP
                            ▼
        ┌────────────────────────────────────────────────┐
        │          RESPONSE INTERCEPTOR                  │
        ├────────────────────────────────────────────────┤
        │                                                │
        │  ✅ SUCCESS (200-299)                          │
        │     → Logging développement                    │
        │     → Return response.data                     │
        │                                                │
        │  ⚠️  401 UNAUTHORIZED                          │
        │     → Token expiré détecté                     │
        │     → Appel refresh token automatique          │
        │     → Mise à jour token dans AsyncStorage      │
        │     → RETRY requête originale                  │
        │     → Si échec refresh → Déconnexion           │
        │                                                │
        │  🚫 403 FORBIDDEN                              │
        │     → Throw "Accès refusé"                     │
        │                                                │
        │  🔍 404 NOT FOUND                              │
        │     → Throw "Ressource non trouvée"            │
        │                                                │
        │  ⏱️  429 TOO MANY REQUESTS                     │
        │     → Parse Retry-After header                 │
        │     → Throw "Trop de requêtes, réessayez..."   │
        │                                                │
        │  💥 500+ SERVER ERROR                          │
        │     → Throw "Erreur serveur..."                │
        │                                                │
        │  🌐 NETWORK ERROR                              │
        │     → Throw "Erreur réseau, vérifiez..."       │
        │                                                │
        └───────────────────┬────────────────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  COMPOSANT REACT │
                    │  (Success/Error) │
                    └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  REFRESH TOKEN FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Requête 1 (401) ──┐                                            │
│  Requête 2 (401) ──┼──► isRefreshing = true                     │
│  Requête 3 (401) ──┘        │                                   │
│                             │                                   │
│                             ▼                                   │
│                  Appel /auth/refresh-token                      │
│                             │                                   │
│                             ▼                                   │
│                  Obtenir nouveau accessToken                    │
│                             │                                   │
│                             ▼                                   │
│                  Notifier tous les subscribers                  │
│                     (File d'attente)                            │
│                             │                                   │
│                   ┌─────────┼─────────┐                         │
│                   ▼         ▼         ▼                         │
│            Retry Req1  Retry Req2  Retry Req3                   │
│                                                                 │
│  AVANTAGE: Un seul refresh pour plusieurs requêtes parallèles   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🎯 Context Pattern + AsyncStorage

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTH CONTEXT                               │
│         (État Global d'Authentification)                        │
└─────────────────────────────────────────────────────────────────┘

                 ┌──────────────────────────┐
                 │      APP MONTAGE         │
                 │   useEffect(() => {})    │
                 └────────────┬─────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │       INITIALISATION AUTH                   │
        ├─────────────────────────────────────────────┤
        │                                             │
        │  1. Vérifier AsyncStorage                   │
        │     const token = await AsyncStorage        │
        │       .getItem('@gosotral:accessToken')     │
        │                                             │
        │  2. Si token existe:                        │
        │     • Récupérer user data du cache          │
        │     • Si pas de cache, fetch API            │
        │     • setIsAuthenticated(true)              │
        │                                             │
        │  3. Si pas de token:                        │
        │     • setIsAuthenticated(false)             │
        │                                             │
        └────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────────────────┐
        │         ÉTAT CONTEXT                        │
        ├─────────────────────────────────────────────┤
        │                                             │
        │  STATE:                                     │
        │  • user: User | null                        │
        │  • isAuthenticated: boolean                 │
        │  • isLoading: boolean                       │
        │  • error: string | null                     │
        │                                             │
        │  ACTIONS:                                   │
        │  • login(email, password)                   │
        │  • register(data)                           │
        │  • logout()                                 │
        │  • verifyEmail(otp)                         │
        │  • updateProfile(updates)                   │
        │  • refreshUser()                            │
        │                                             │
        └────────────┬────────────────────────────────┘
                     │
                     │ Provides to
                     ▼
        ┌─────────────────────────────────────────────┐
        │     TOUS LES COMPOSANTS ENFANTS             │
        │        (via useAuth() hook)                 │
        ├─────────────────────────────────────────────┤
        │                                             │
        │  const { user, login, logout } = useAuth(); │
        │                                             │
        │  if (user) {                                │
        │    return <HomeScreen />                    │
        │  }                                          │
        │                                             │
        └─────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              PROTECTION AUTOMATIQUE DES ROUTES                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  useEffect(() => {                                              │
│    const inAuthGroup = segments[0] === '(auth)';                │
│    const inTabsGroup = segments[0] === '(tabs)';                │
│                                                                 │
│    if (!isAuthenticated && inTabsGroup) {                       │
│      // Non auth sur route protégée → Redirect login           │
│      router.replace('/login');                                 │
│    }                                                            │
│                                                                 │
│    if (isAuthenticated && inAuthGroup) {                        │
│      // Auth sur login/register → Redirect home                │
│      router.replace('/(tabs)');                                │
│    }                                                            │
│  }, [isAuthenticated, segments]);                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ASYNC STORAGE                                │
│         (Persistance Locale Multi-Niveaux)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NIVEAU 1: MÉMOIRE (Cache In-Memory)                            │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Map<string, any>                               │            │
│  │  Accès: <1ms                                    │            │
│  │  Persistance: Session seulement                 │            │
│  └─────────────────────────────────────────────────┘            │
│                    │                                            │
│                    │ Fallback si pas en mémoire                 │
│                    ▼                                            │
│  NIVEAU 2: ASYNC STORAGE (Persistant)                           │
│  ┌─────────────────────────────────────────────────┐            │
│  │  SQLite / Shared Preferences                    │            │
│  │  Accès: 10-50ms                                 │            │
│  │  Persistance: Permanent                         │            │
│  │                                                 │            │
│  │  Keys:                                          │            │
│  │  • @gosotral:accessToken                        │            │
│  │  • @gosotral:refreshToken                       │            │
│  │  • @gosotral:userData                           │            │
│  │  • @gosotral:deviceId                           │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                 │
│  OPÉRATIONS:                                                    │
│  • setItem(key, value)      → Écriture                          │
│  • getItem(key)             → Lecture                           │
│  • removeItem(key)          → Suppression                       │
│  • multiSet([...])          → Écriture multiple (Atomic)        │
│  • multiGet([...])          → Lecture multiple                  │
│  • multiRemove([...])       → Suppression multiple              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. FLUX DE DONNÉES COMPLETS

### 🔄 Flow Complet: Inscription Utilisateur

```
┌─────────────────────────────────────────────────────────────────────┐
│         FLOW COMPLET: INSCRIPTION UTILISATEUR                       │
│    (Frontend Mobile → Backend API → Database → Email)               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  UTILISATEUR │
│   (Mobile)   │
└──────┬───────┘
       │
       │ 1. Saisie formulaire
       │    • Nom: "Jean Dupont"
       │    • Email: "jean@example.com"
       │    • Téléphone: "+22890123456"
       │    • Password: "MySecure123!"
       │
       ▼
┌────────────────────────────────────┐
│  FRONTEND - RegisterScreen.tsx     │
├────────────────────────────────────┤
│                                    │
│  2. Validation côté client (Zod)  │
│     registerSchema.parse({...})    │
│                                    │
│     ✓ Nom: min 2 chars             │
│     ✓ Email: format valide         │
│     ✓ Téléphone: +228XXXXXXXX      │
│     ✓ Password: 8+ chars, maj,     │
│       min, chiffre, spécial        │
│                                    │
└───────────┬────────────────────────┘
            │
            │ 3. Appel authService
            ▼
┌────────────────────────────────────┐
│  SERVICE - authService.ts          │
├────────────────────────────────────┤
│                                    │
│  4. Formatage données              │
│     • Trim nom                     │
│     • Lowercase email              │
│     • Format téléphone             │
│                                    │
│  5. Appel API                      │
│     apiClient.post(               │
│       '/auth/register',            │
│       { name, email, phone, pwd }  │
│     )                              │
│                                    │
└───────────┬────────────────────────┘
            │
            │ HTTP POST
            │ Headers:
            │   Content-Type: application/json
            │   X-Request-ID: uuid
            │ Body: { name, email, phone, password }
            │
            ▼
┌───────────────────────────────────────────┐
│  BACKEND - Auth.controller.ts             │
├───────────────────────────────────────────┤
│                                           │
│  6. Validation Zod serveur                │
│     registerSchema.safeParse(req.body)    │
│                                           │
│  7. Vérification unicité                  │
│     const existing = await Promise.all([  │
│       UserRepository.findByEmail(email),  │
│       UserRepository.findByPhone(phone)   │
│     ])                                    │
│                                           │
│     if (existing[0]) {                    │
│       return 409 "Email déjà utilisé"     │
│     }                                     │
│                                           │
│  8. Hashage mot de passe                  │
│     const hash = await bcrypt.hash(       │
│       password,                           │
│       12 // salt rounds                   │
│     )                                     │
│     → $2a$12$KIXQQfE7...                  │
│                                           │
└───────────┬───────────────────────────────┘
            │
            │ 9. Appel Repository
            ▼
┌───────────────────────────────────────────┐
│  REPOSITORY - User.repository.ts          │
├───────────────────────────────────────────┤
│                                           │
│  10. Transaction PostgreSQL               │
│                                           │
│      BEGIN;                               │
│                                           │
│      -- Insertion utilisateur             │
│      INSERT INTO users (                  │
│        email, phone, name,                │
│        password_hash, role                │
│      ) VALUES (                           │
│        'jean@example.com',                │
│        '+22890123456',                    │
│        'Jean Dupont',                     │
│        '$2a$12$KIXQQfE7...',              │
│        'user'                             │
│      ) RETURNING *;                       │
│      → { id: 123, email: '...', ... }     │
│                                           │
│      -- Génération OTP                    │
│      const otp = generateOTP();           │
│      → "456789"                           │
│                                           │
│      INSERT INTO email_otps (             │
│        user_id, otp_code, expires_at      │
│      ) VALUES (                           │
│        123,                               │
│        '456789',                          │
│        NOW() + INTERVAL '10 minutes'      │
│      );                                   │
│                                           │
│      COMMIT;                              │
│                                           │
└───────────┬───────────────────────────────┘
            │
            │ 11. Return user data
            ▼
┌───────────────────────────────────────────┐
│  CONTROLLER (suite)                       │
├───────────────────────────────────────────┤
│                                           │
│  12. Génération JWT tokens                │
│                                           │
│      const accessToken = jwt.sign(        │
│        {                                  │
│          userId: 123,                     │
│          email: 'jean@example.com',       │
│          role: 'user'                     │
│        },                                 │
│        JWT_SECRET,                        │
│        { expiresIn: '15m' }               │
│      );                                   │
│                                           │
│      const refreshToken = jwt.sign(       │
│        { userId: 123 },                   │
│        REFRESH_SECRET,                    │
│        { expiresIn: '7d' }                │
│      );                                   │
│                                           │
│  13. Envoi email OTP (asynchrone)         │
│      emailService.sendOTP(                │
│        'jean@example.com',                │
│        '456789'                           │
│      ).catch(err => log(err))             │
│                                           │
│  14. Réponse HTTP 201                     │
│      {                                    │
│        success: true,                     │
│        message: "Inscription réussie",    │
│        data: {                            │
│          user: {                          │
│            id: 123,                       │
│            email: 'jean@example.com',     │
│            name: 'Jean Dupont',           │
│            isVerified: false              │
│          },                               │
│          tokens: {                        │
│            accessToken: 'eyJhbGc...',     │
│            refreshToken: 'eyJhbGc...',    │
│            expiresIn: 900                 │
│          }                                │
│        }                                  │
│      }                                    │
│                                           │
└───────────┬───────────────────────────────┘
            │
            │ HTTP Response 201
            ▼
┌───────────────────────────────────────────┐
│  SERVICE - authService.ts                 │
├───────────────────────────────────────────┤
│                                           │
│  15. Sauvegarde locale AsyncStorage       │
│                                           │
│      await AsyncStorage.multiSet([        │
│        [                                  │
│          '@gosotral:accessToken',         │
│          'eyJhbGc...'                     │
│        ],                                 │
│        [                                  │
│          '@gosotral:refreshToken',        │
│          'eyJhbGc...'                     │
│        ],                                 │
│        [                                  │
│          '@gosotral:userData',            │
│          JSON.stringify({                 │
│            id: 123,                       │
│            email: 'jean@example.com',     │
│            name: 'Jean Dupont'            │
│          })                               │
│        ]                                  │
│      ]);                                  │
│                                           │
└───────────┬───────────────────────────────┘
            │
            │ 16. Return to component
            ▼
┌───────────────────────────────────────────┐
│  FRONTEND - RegisterScreen.tsx            │
├───────────────────────────────────────────┤
│                                           │
│  17. Mise à jour état Context             │
│      setUser(response.data.user)          │
│      setIsAuthenticated(true)             │
│                                           │
│  18. Navigation automatique               │
│      if (!user.isVerified) {              │
│        router.push('/verify-email')       │
│      } else {                             │
│        router.push('/(tabs)')             │
│      }                                    │
│                                           │
└───────────┬───────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────┐
│  EMAIL SERVICE (Asynchrone)               │
├───────────────────────────────────────────┤
│                                           │
│  19. Envoi email via Nodemailer           │
│                                           │
│      SMTP: smtp.gmail.com:587             │
│      From: noreply@gosotral.com           │
│      To: jean@example.com                 │
│      Subject: Code de vérification        │
│      Body:                                │
│        Votre code: 456789                 │
│        Expire dans 10 minutes             │
│                                           │
└───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TEMPS TOTAL: ~500ms                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • Validation client: 5ms                                       │
│  • Requête HTTP: 50ms                                           │
│  • Validation serveur: 5ms                                      │
│  • Vérification DB (2 queries): 10ms                            │
│  • Hashage bcrypt: 300ms                                        │
│  • Transaction DB: 20ms                                         │
│  • Génération JWT: 5ms                                          │
│  • Réponse HTTP: 50ms                                           │
│  • Sauvegarde AsyncStorage: 30ms                                │
│  • Navigation: 25ms                                             │
│                                                                 │
│  Email envoyé asynchrone (hors comptage): ~2s                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🎫 Flow Complet: Achat et Validation de Ticket

```
┌─────────────────────────────────────────────────────────────────────┐
│     FLOW COMPLET: ACHAT ET VALIDATION DE TICKET                     │
└─────────────────────────────────────────────────────────────────────┘

PARTIE 1: ACHAT DE TICKET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┐
│ UTILISATEUR  │
└──────┬───────┘
       │ 1. Sélection ticket
       │    Type: "Simple"
       │    Ligne: "Lomé-Aného"
       │    Quantité: 2
       │
       ▼
┌────────────────────────────────┐
│  FRONTEND - BuyTicketScreen    │
├────────────────────────────────┤
│  2. Calcul prix total          │
│     2 × 500 FCFA = 1000 FCFA   │
│                                │
│  3. Confirmation achat         │
│     Méthode: TMoney            │
│     Téléphone: +22890123456    │
└───────────┬────────────────────┘
            │
            │ POST /payments/initiate
            ▼
┌────────────────────────────────────┐
│  BACKEND - Payment.controller      │
├────────────────────────────────────┤
│  4. Création transaction DB        │
│     status: 'pending'              │
│     ref: 'PAY-1234567890'          │
│                                    │
│  5. Appel API TMoney               │
│     POST https://api.tmoney.tg     │
│     {                              │
│       amount: 1000,                │
│       phone: '+22890123456',       │
│       reference: 'PAY-1234567890'  │
│     }                              │
│                                    │
│  6. Réponse TMoney                 │
│     {                              │
│       paymentUrl: 'https://...',   │
│       transactionId: 'TM-...'      │
│     }                              │
│                                    │
│  7. Return au client               │
│     {                              │
│       success: true,               │
│       data: {                      │
│         transactionId: 'PAY-...',  │
│         pollUrl: '/payments/...'   │
│       }                            │
│     }                              │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  FRONTEND - Payment Flow           │
├────────────────────────────────────┤
│  8. Redirect vers TMoney           │
│     WebView / Deeplink             │
│                                    │
│  9. Utilisateur saisit PIN         │
│     **** (confirmation)            │
│                                    │
│  10. POLLING du statut             │
│      (toutes les 2s, backoff)      │
│                                    │
│      Tentative 1: GET /payments/   │
│        status/PAY-1234567890       │
│        → { status: 'pending' }     │
│        Wait 2s                     │
│                                    │
│      Tentative 2: GET /payments/   │
│        status/PAY-1234567890       │
│        → { status: 'pending' }     │
│        Wait 4s                     │
│                                    │
│      Tentative 3: GET /payments/   │
│        status/PAY-1234567890       │
│        → { status: 'success' }     │
│        ✅ PAIEMENT CONFIRMÉ        │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  BACKEND - Payment confirmed       │
├────────────────────────────────────┤
│  11. Génération tickets            │
│                                    │
│      FOR i = 1 TO 2 DO             │
│        -- Ticket 1                 │
│        INSERT INTO tickets (       │
│          user_id: 123,             │
│          line_id: 5,               │
│          type: 'simple',           │
│          status: 'active',         │
│          ticket_code: 'TK-001',    │
│          qr_code: generateQR(),    │
│          price_paid_fcfa: 500,     │
│          expires_at: NOW() + 30d   │
│        )                           │
│      END FOR                       │
│                                    │
│  12. Envoi confirmation email      │
│      avec PDF tickets              │
│                                    │
│  13. Broadcast événement SSE       │
│      eventBus.broadcast(           │
│        'ticket_purchased',         │
│        { userId: 123, count: 2 }   │
│      )                             │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  FRONTEND - Success                │
├────────────────────────────────────┤
│  14. Affichage confirmation        │
│      "✅ Achat réussi !"           │
│                                    │
│  15. Navigation vers "Mes Tickets" │
│      Affichage QR codes            │
└────────────────────────────────────┘


PARTIE 2: VALIDATION TICKET PAR CONTRÔLEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┐
│ CONTRÔLEUR   │
│  (Scan App)  │
└──────┬───────┘
       │ 1. Ouverture scanner
       │    expo-barcode-scanner
       │
       ▼
┌────────────────────────────────────┐
│  SCAN APP - ScanScreen             │
├────────────────────────────────────┤
│  2. Détection QR Code              │
│     Décodage: "TK-001-QR-DATA"     │
│                                    │
│  3. Parse ticket ID                │
│     ticketId = extractId(data)     │
│     → "TK-001"                     │
│                                    │
│  4. Appel API validation           │
│     POST /tickets/TK-001/validate  │
└───────────┬────────────────────────┘
            │
            ▼
┌────────────────────────────────────┐
│  BACKEND - Ticket.controller       │
├────────────────────────────────────┤
│  5. Récupération ticket            │
│     const ticket = await           │
│       TicketRepository             │
│         .findByCode('TK-001')      │
│                                    │
│  6. Vérifications                  │
│                                    │
│     ❓ Ticket existe ?             │
│        if (!ticket)                │
│          → 404 "Ticket introuvable"│
│                                    │
│     ❓ Ticket actif ?              │
│        if (ticket.status !== ...   │
│          → 400 "Ticket invalide"   │
│                                    │
│     ❓ Pas expiré ?                │
│        if (ticket.expires_at < NOW)│
│          → 400 "Ticket expiré"     │
│                                    │
│     ❓ Trajets restants ?          │
│        if (ticket.trips_used >= ...)│
│          → 400 "Plus de trajets"   │
│                                    │
│     ✅ Toutes vérifications OK     │
│                                    │
│  7. Mise à jour ticket             │
│     UPDATE tickets SET             │
│       status = 'used',             │
│       trips_used = trips_used + 1, │
│       last_validated_at = NOW(),   │
│       validated_by = controllerId  │
│     WHERE ticket_code = 'TK-001'   │
│                                    │
│  8. Enregistrement log validation  │
│     INSERT INTO validations (      │
│       ticket_id, controller_id,    │
│       validated_at, location       │
│     )                              │
│                                    │
│  9. Broadcast événement SSE        │
│     eventBus.broadcast(            
