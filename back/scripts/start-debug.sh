# Script pour démarrer le serveur Node.js directement
# Assurez-vous que les dépendances sont installées et la base de données est accessible

# Se positionner dans le répertoire du projet
cd "$(dirname "$0")/.."

# Définir les variables d'environnement pour la connexion à la base de données
export DATABASE_URL="postgresql://gosotral_user:gosotral_pass@localhost:5433/gosotral_db"
export PORT=7000

# Démarrer le serveur en mode développement
echo "Démarrage du serveur sur le port $PORT..."
npx ts-node src/server-debug.ts
