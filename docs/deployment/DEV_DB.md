Utiliser une base Postgres locale pour le développement
===============================================

Ce fichier explique comment démarrer rapidement une base Postgres locale et lancer le serveur backend pour reproduire les erreurs liées à la base (ex: ECONNREFUSED 127.0.0.1:5432).

1) Démarrer Postgres localement (expose sur le port 5433 pour éviter conflit si vous avez déjà Postgres local):

   docker compose -f docker-compose.local.yml up -d

2) Vérifier que la DB est prête:

   docker compose -f docker-compose.local.yml logs -f db

3) Lancer le backend en mode développement (depuis le dossier `back`):

   # installez les dépendances si nécessaire
   npm install

   # démarrer le backend (utilise .env par défaut, DB_HOST=db dans docker-compose original)
   npm run start

4) Appeler l'endpoint admin pour reproduire le 500 et voir les logs locaux:

   curl -v -H "Authorization: Bearer <ADMIN_JWT>" "http://localhost:7000/admin/tickets/tickets?page=1&limit=50"

Remarque: si vous souhaitez que le backend se connecte à la DB sur le port 5433 (mapping local), ajustez les variables d'environnement ou exportez DATABASE_URL avant de démarrer le backend:

   export DATABASE_URL=postgresql://gosotral_user:gosotral_pass@127.0.0.1:5433/gosotral_db

Puis relancer le serveur.
