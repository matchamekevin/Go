# Documentation du projet GoSOTRAL Backend

## Présentation

Ce projet est le backend de l'application GoSOTRAL, développé en Node.js avec TypeScript et Express. Il fournit une API REST connectée à une base de données PostgreSQL et gère l'authentification, la gestion des utilisateurs, et d'autres fonctionnalités métier. Le projet est conteneurisé avec Docker et prêt à être déployé en production.

---

## 🚀 Démarrage Rapide (Backend + Frontend)

### 1. Backend (API + Base de données)
```bash
# Aller dans le dossier backend
cd /home/connect/kev/Go/back

# Démarrer tous les services Docker
docker compose up -d --build

# Initialiser la base de données
for sql_file in src/schema/*.sql; do 
  echo "Exécution de $(basename $sql_file)..."
  docker exec -i back_db_1 psql -U gosotral_user -d gosotral_db < "$sql_file"
done

# Vérifier que tout fonctionne
curl -i http://localhost:7000/health
```

### 2. Frontend (React Native)
```bash
# Aller dans le dossier frontend
cd /home/connect/kev/Go/front

# Installer les dépendances (si pas encore fait)
npm install

# Démarrer l'app Android
npm run android

# OU démarrer l'app iOS
npm run ios

# OU démarrer pour le web
npm run web
```

### 3. Accès depuis l'App
Une fois les deux services démarrés :
- L'app détecte automatiquement le backend local (192.168.1.184:7000)
- Utilise le **Dev Menu** > **Configuration Réseau** pour gérer les endpoints
- L'app s'adapte automatiquement aux changements de réseau

---

## 💰 Solutions Gratuites pour Accès Global

### ☁️ Déploiements Cloud GRATUITS

#### 1. Railway.app (Recommandé ⭐)
```bash
cd /home/connect/kev/Go/back
./deploy.sh railway
```
**✅ Gratuit :** 512MB RAM, 500h/mois, base PostgreSQL incluse  
**⏱️ Temps :** 5 minutes  
**🌐 Résultat :** URL fixe type `https://ton-app.up.railway.app`

#### 2. Render.com
```bash
cd /home/connect/kev/Go/back
./deploy.sh render
```
**✅ Gratuit :** 512MB RAM, 750h/mois, SSL automatique  
**⏱️ Temps :** 10 minutes  
**🌐 Résultat :** URL fixe type `https://ton-app.onrender.com`

#### Déploiement sur Render (manuel)

1. Aller sur https://render.com et se connecter avec ton compte GitHub.
2. Cliquer `New` → `Web Service`.
3. Connecter le repository `matchamekevin/Go` et choisir la branche `dev2`.
4. Choisir `Environment: Docker` et renseigner le chemin du Dockerfile : `back/Dockerfile`.
5. En `Build Command` mettre : `npm ci && npm run build`.
6. En `Start Command` mettre : `npm start`.
7. Ajouter les variables d'environnement nécessaires dans la section `Environment` (ne pas commit les secrets) :
  - DATABASE_URL ou DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME
  - JWT_SECRET
  - SMTP credentials si nécessaire
8. (Optionnel) Créer un managed Postgres sur Render et lier la base au service.
9. Déployer et vérifier les logs dans l'onglet `Logs`.

Tu peux aussi utiliser le fichier `back/render.yaml` inclus pour pré-remplir la configuration lors de la création du service via l'UI.

> ⚠️ Attention Render (Docker): Ne pas combiner `Root Directory = back` ET `dockerfilePath = back/Dockerfile`.
> Choisis UNE des deux stratégies:
>  1. Root Directory vide (racine du repo) + dockerfilePath = back/Dockerfile
>  2. Root Directory = back + dockerfilePath = Dockerfile
> Sinon Render cherchera `back/back/Dockerfile` et plantera (erreur « could not find /opt/render/project/src/back/back »).


#### 3. Tunnels de Développement

**ngrok (URL temporaire)**
```bash
# Configuration une seule fois
ngrok config add-authtoken TON_TOKEN_GRATUIT

# À chaque session de dev
cd /home/connect/kev/Go/back
ngrok http 7000
```
**✅ Gratuit :** 1 tunnel simultané  
**❌ Limite :** URL change à chaque redémarrage  
**🌐 Résultat :** URL type `https://abc123.ngrok.io`

**Cloudflare Tunnel**
```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:7000
```
**✅ Gratuit :** Tunnels illimités  
**⏱️ Temps :** Instantané

### 📱 Configuration dans l'App
Après déploiement :
1. Lance l'app React Native
2. Va dans **Dev Menu** > **Configuration Réseau**
3. Ajoute l'URL obtenue (Railway, Render, ou ngrok)
4. L'app basculera automatiquement sur cette URL

---

## 📋 Commandes de Gestion

### Backend Docker
```bash
# Démarrer
cd /home/connect/kev/Go/back
docker compose up -d --build

# Voir les logs
docker compose logs -f api
docker compose logs -f db

# Arrêter
docker compose down

# Nettoyer complètement
docker compose down -v --remove-orphans
```

### Frontend React Native
```bash
cd /home/connect/kev/Go/front

# Android
npm run android

# iOS  
npm run ios

# Web
npm run web

# Nettoyer le cache
npx expo start --clear
```

### Base de Données
```bash
# Initialiser les tables
cd /home/connect/kev/Go/back
for sql_file in src/schema/*.sql; do 
  docker exec -i back_db_1 psql -U gosotral_user -d gosotral_db < "$sql_file"
done

# Accéder à la console PostgreSQL
docker exec -it back_db_1 psql -U gosotral_user -d gosotral_db

# Backup
docker exec back_db_1 pg_dump -U gosotral_user gosotral_db > backup.sql
```

---entation du projet GoSOTRAL Backend

## Présentation

Ce projet est le backend de l’application GoSOTRAL, développé en Node.js avec TypeScript et Express. Il fournit une API REST connectée à une base de données PostgreSQL et gère l’authentification, la gestion des utilisateurs, et d’autres fonctionnalités métier. Le projet est conteneurisé avec Docker et prêt à être déployé en production.

---

## 🔍 Tests & Vérifications

### Vérifier que le Backend fonctionne
```bash
# Health check
curl -i http://localhost:7000/health

# Test base de données
curl -i http://localhost:7000/test-db

# Test inscription
curl -X POST http://localhost:7000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
```

### Vérifier que l'App se connecte
1. Lance l'app React Native
2. Va dans **Dev Menu** > **Test Connectivité Réseau**
3. Tu dois voir le backend détecté et accessible

### Déboguer les problèmes réseau
```bash
# Vérifier l'IP de la machine
hostname -I

# Tester depuis l'extérieur
curl -i http://192.168.1.184:7000/health

# Voir les logs du backend
docker compose logs -f api
```

---

## 💡 Workflow Recommandé

### Développement Local
1. **Backend** : `docker compose up -d --build` (une seule fois)
2. **Frontend** : `npm run android` (à chaque session)
3. **Tests** : Utilise le Dev Menu dans l'app

### Déploiement pour Accès Global
1. **Choisis une solution** : Railway (recommandé) ou Render
2. **Déploie** : `./deploy.sh railway`
3. **Configure l'app** : Ajoute l'URL dans Configuration Réseau
4. **Teste** : Accès depuis n'importe quel réseau WiFi/4G

### Production
1. **Déploie sur un service cloud** (Railway/Render)
2. **Configure un domaine personnalisé** (optionnel)
3. **Met en place le monitoring** (logs, uptime)

---

## 🎯 Coûts des Solutions

| Solution | Gratuit | Payant | URL Fixe | Base de Données |
|----------|---------|--------|----------|-----------------|
| **Railway** | ✅ 500h/mois | 5$/mois illimité | ✅ | ✅ PostgreSQL incluse |
| **Render** | ✅ 750h/mois | 7$/mois illimité | ✅ | ✅ PostgreSQL incluse |
| **ngrok** | ✅ 1 tunnel | 8$/mois tunnels illimités | ❌ Temporaire | ❌ |
| **Cloudflare** | ✅ Illimité | - | ❌ Temporaire | ❌ |
| **DigitalOcean** | ❌ | 5$/mois | ✅ Avec domaine | Configuration manuelle |

**💰 Recommandation** : Railway gratuit pour commencer, puis Railway payant (5$/mois) quand tu dépasses les limites.

---

```
back/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.exemple
├── .env
└── src/
    ├── app.ts
    ├── server.ts
    ├── enviroment/
    │   └── env.config.ts
    ├── shared/
    │   ├── database/
    │   │   └── client.ts
    │   ├── midddleawers/
    │   └── utils/
    ├── schema/
    ├── types/
    └── (feature)/
        ├── auth/
        └── users/
```

---


## Commandes Docker Compose pour démarrer le backend

### Démarrer tous les services (API + base de données)
```bash
cd /home/connect/kev/Go/back
docker compose up -d --build
```

### Vérifier que tout fonctionne
```bash
docker compose ps
docker compose logs --tail 50 api
curl -i http://localhost:7000/health
```

### Arrêter tous les services
```bash
docker compose down
```

---

## Installation et lancement

### Prérequis
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (ou utiliser le service Docker inclus)

### Variables d’environnement
Copiez `.env.exemple` en `.env` et renseignez les valeurs nécessaires :
- Variables JWT
- Accès base de données
- Paramètres SMTP

### Lancement en développement
```bash
npm install
npm run dev
```

### Lancement avec Docker
```bash
docker compose up -d --build --force-recreate --remove-orphans

bash -lc "cd /home/kev/Go/back && docker-compose -p gosotral ps && echo '--- HEALTH ---' && curl -sS http://localhost:7000/health || true"
```
L’API sera disponible sur `http://localhost:7000`.

> Astuce (Ubuntu): si la commande ci-dessus échoue avec une erreur `ContainerConfig`, vous utilisez probablement docker-compose v1. Installez Docker Compose V2 (plugin) et relancez:
> 
> ```bash
> sudo apt remove -y docker-compose
> sudo apt update && sudo apt install -y docker-compose-plugin
> docker compose version
> docker compose down -v --remove-orphans || true
> docker compose up -d --build --force-recreate --remove-orphans
> ```

---

## Scripts npm
- `npm run dev` : Démarre le serveur en mode développement avec hot reload (nodemon).
- `npm run build` : Compile le code TypeScript dans `dist/`.
- `npm start` : Lance le serveur à partir du code compilé.

---

## Fonctionnement principal

### Entrée de l’application
- `src/server.ts` : Point d’entrée, démarre le serveur Express sur le port défini dans `.env`.
- `src/app.ts` : Initialise Express, configure le JSON parser, et expose quelques routes de test et de santé (`/test-db`, `/yafoy`, `/health`).

### Base de données
- `src/shared/database/client.ts` : Initialise un pool PostgreSQL avec les paramètres de `enviroment/env.config.ts`.
- Les variables de connexion sont lues depuis `.env`.

### Configuration
- `src/enviroment/env.config.ts` : Charge et valide toutes les variables d’environnement nécessaires (port, JWT, DB, SMTP, etc).

### Docker
- `Dockerfile` : Image Node.js, installation des dépendances, build TypeScript, expose le port 7000, lance le serveur en mode dev.
- `docker-compose.yml` : Définit deux services :
  - `api` (backend Node.js)
  - `db` (PostgreSQL, persistance via volume)

---

## Exemple de routes disponibles
- `GET /test-db` : Teste la connexion à la base de données.
- `GET /yafoy` : Retourne un simple résultat de test.
- `GET /health` : Vérifie la santé du backend et de la base de données.

### Automatisation & scripts utiles
Dans le dossier `back/` :

- `init-db.sh` : initialise la base (exécute tous les fichiers `.sql` de `src/schema/`).
  ```bash
  bash init-db.sh
  ```
- `check-routes.sh` : liste les routes exposées (nécessite l'API en marche).
  ```bash
  bash check-routes.sh
  ```
- `test-auth.sh` : teste rapidement l'inscription via `/auth/register` et `/register`.
  ```bash
  bash test-auth.sh
  ```

Workflow rapide après un `docker compose up` :
```bash
docker compose up -d --build
bash init-db.sh
bash check-routes.sh | grep register || true
bash test-auth.sh
```
Si `/register` renvoie 404, reconstruire l'image :
```bash
docker compose up -d --build --force-recreate --remove-orphans api
```

---

## Dépendances principales
- express
- pg
- dotenv
- typescript
- nodemon (dev)
- ts-node (dev)

---

## Bonnes pratiques & sécurité
- Ne jamais commiter le fichier `.env` avec des secrets réels.
- Les variables sensibles sont validées au démarrage (voir `env.config.ts`).
- Utiliser le service PostgreSQL Docker pour un environnement isolé.

---

## Pour aller plus loin
- Ajouter des routes dans `src/(feature)/` pour l’authentification et la gestion des utilisateurs.
- Ajouter des middlewares dans `src/shared/midddleawers/`.
- Ajouter des schémas de validation dans `src/schema/`.
- Ajouter des utilitaires dans `src/shared/utils/`.
- Définir des types globaux dans `src/types/`.

---

## Auteur
- [matchamekevin](https://github.com/matchamekevin)
Force redeploy: 2025-01-27T12:05:00Z

## Licence
ISC
