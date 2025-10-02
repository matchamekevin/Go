# Synchronisation Base de Données Locale avec Render

## Problème

Votre base de données locale contient des données de développement, mais vous voulez synchroniser avec les données de production sur Render.

## Solution

Utilisez le script `sync-from-render.sh` pour automatiser la synchronisation.

## Étapes

### 1. Obtenir l'URL de connexion Render

1. Allez sur votre dashboard Render : <https://dashboard.render.com/d/dpg-d305h0mr433s73euqgfg-a>
2. Cliquez sur votre base de données PostgreSQL
3. Allez dans l'onglet **"Connection"**
4. Copiez l'**"External Database URL"** (elle ressemble à ça : `postgresql://user:password@host:port/database`)

### 2. Exécuter la synchronisation

```bash
cd back
./sync-from-render.sh 'VOTRE_URL_RENDER_ICI'
```

**Exemple :**

```bash
./sync-from-render.sh 'postgresql://gosotral_user:mon_mot_de_passe@ep-cool-darkness-123456.us-east-1.aws.neon.tech:5432/gosotral_db'
```

### 3. Que fait le script ?

Le script va automatiquement :

- ✅ Créer un dump de votre base Render
- ✅ Arrêter vos conteneurs locaux
- ✅ Supprimer les données locales existantes
- ✅ Redémarrer les conteneurs
- ✅ Restaurer le dump Render
- ✅ Vérifier que tout fonctionne

### 4. Vérifier la synchronisation

Après la synchronisation, vérifiez que vos données sont là :

```bash
# Nombre de lignes SOTRAL
docker exec -it go-db-1 psql -U gosotral_user -d gosotral_db -c "SELECT COUNT(*) FROM sotral_lines;"

# Lister les lignes
docker exec -it go-db-1 psql -U gosotral_user -d gosotral_db -c "SELECT line_number, name FROM sotral_lines ORDER BY line_number;"
```

## Dépannage

### Erreur "pg_dump: server version mismatch"

- Assurez-vous que votre version locale de PostgreSQL est compatible avec Render
- Vérifiez que vous utilisez la bonne URL

### Erreur "Connection refused"

- Vérifiez que l'URL Render est correcte
- Assurez-vous que la base Render accepte les connexions externes

### Erreur lors de la restauration

- Le dump peut contenir des données incompatibles
- Vérifiez les logs : `docker compose logs db`

## Sécurité

- ⚠️ Ne partagez jamais l'URL de votre base Render
- Le script crée un fichier de sauvegarde local que vous pouvez supprimer après
- Les données sensibles (mots de passe) sont dans l'URL - manipulez avec précaution

## Fichiers créés

- `render_backup_AAAAMMJJ_HHMMSS.sql` : Sauvegarde de vos données Render
- Gardez ce fichier en sécurité au cas où vous auriez besoin de restaurer
