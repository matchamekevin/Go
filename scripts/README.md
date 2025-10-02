# 📁 Scripts

Ce dossier contient tous les scripts d'automatisation organisés par catégorie.

## 📂 Structure

```text
scripts/
├── deploy/          # Scripts de déploiement et configuration
├── test/           # Scripts de test et validation
└── utils/          # Scripts utilitaires et d'administration
```

## 🚀 Scripts de Déploiement (`deploy/`)

| Script | Description |
|--------|-------------|
| `configure-mobile-realtime.sh` | Configuration temps réel mobile |
| `configure-network.sh` | Configuration réseau automatique |
| `deploy-realtime.sh` | Déploiement avec synchronisation temps réel |
| `setup-ngrok.sh` | Configuration ngrok pour accès public |
| `deploy-render.sh` | Déploiement sur Render |
| `deploy-render-auto.sh` | Déploiement automatique Render |
| `sync-from-render.sh` | Synchronisation depuis Render |
| `deploy-alternative.sh` | Déploiements alternatifs |
| `deploy.sh` | Script de déploiement principal |
| `deploy-railway.sh` | Déploiement sur Railway |

## 🧪 Scripts de Test (`test/`)

| Script | Description |
|--------|-------------|
| `test-auto-refresh.sh` | Test actualisation automatique |
| `test-dashboard-fixes.sh` | Test corrections dashboard |
| `test-live-sync.sh` | Test synchronisation temps réel |
| `test-mobile-realtime.sh` | Test temps réel mobile |
| `test-ngrok-sync.sh` | Test synchronisation ngrok |
| `test-realtime-sync.sh` | Test synchronisation complète |
| `test_admin_endpoints.sh` | Test endpoints admin |
| `test_mobile_api_calls.sh` | Test appels API mobile |
| `test_mobile_tickets.sh` | Test tickets mobile |
| `test_search_and_tickets.sh` | Test recherche et tickets |
| `test-server.js` | Test serveur JavaScript |
| `test-tickets-endpoints.sh` | Test endpoints tickets |
| `test-endpoints.sh` | Test endpoints généraux |
| `test-tickets-direct.sh` | Test tickets direct |
| `test-auth.sh` | Test authentification |

## 🔧 Scripts Utilitaires (`utils/`)

| Script | Description |
|--------|-------------|
| `check_mobile_status.sh` | Vérification statut mobile |
| `monitor-clients.sh` | Monitoring clients connectés |
| `reconfigure-ip.sh` | Reconfiguration IP automatique |
| `init-db.sh` | Initialisation base de données |
| `init-sotral.sh` | Initialisation données SOTRAL |
| `init-sotral-manual.sh` | Initialisation manuelle SOTRAL |
| `create-payments-table.sh` | Création table paiements |
| `insert-stops.sh` | Insertion arrêts |
| `check-routes.sh` | Vérification routes |
| `diagnose-sotral.sh` | Diagnostic SOTRAL |

## 🚀 Utilisation

Tous les scripts sont exécutables. Rendez-les exécutables si nécessaire :

```bash
chmod +x scripts/*/*.sh
```

Puis exécutez-les depuis la racine du projet :

```bash
# Exemple : configuration ngrok
./scripts/deploy/setup-ngrok.sh

# Exemple : test synchronisation
./scripts/test/test-realtime-sync.sh
```
