# Documentation du projet GoSOTRAL Backend

## Présentation

Ce projet est le backend de l’application GoSOTRAL, développé en Node.js avec TypeScript et Express. Il fournit une API REST connectée à une base de données PostgreSQL et gère l’authentification, la gestion des utilisateurs, et d’autres fonctionnalités métier. Le projet est conteneurisé avec Docker et prêt à être déployé en production.

---

## Structure du projet

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

## Licence
ISC
