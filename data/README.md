# 📁 Data

Ce dossier contient toutes les données, backups et fichiers de configuration pour le projet.

## 📂 Structure

```text
data/
├── backups/         # Sauvegardes de base de données
├── config/          # Fichiers de configuration
└── samples/         # Exemples et données de test
```

## 💾 Sauvegardes (`backups/`)

| Fichier | Description | Date |
|---------|-------------|------|
| `render_backup_20250922_145354.sql` | Sauvegarde Render | 22/09/2025 |
| `render_backup_20250922_150205.sql` | Sauvegarde Render | 22/09/2025 |
| `render_backup_20250922_150350.sql` | Sauvegarde Render | 22/09/2025 |

## ⚙️ Configuration (`config/`)

| Fichier | Description |
|---------|-------------|
| `render.env.sample` | Exemple configuration Render |
| `render.yaml` | Configuration déploiement Render |

## 📄 Données Utiles (`samples/`)

| Fichier | Description |
|---------|-------------|
| `insert_users_from_render.sql` | Script insertion utilisateurs |
| `users_from_render_backup.txt` | Liste utilisateurs backup |

## 🔒 Sécurité

- Les fichiers de données sensibles ne doivent pas être committés
- Utilisez `.gitignore` pour exclure les données privées
- Les backups sont versionnés pour la traçabilité

## 📋 Utilisation

### Restaurer une sauvegarde

```bash
# Depuis le dossier back/
docker exec -i back_db_1 psql -U gosotral_user -d gosotral_db < ../data/backups/render_backup_20250922_145354.sql
```

### Configuration Render

```bash
# Copier le fichier d'exemple
cp data/config/render.env.sample .env

# Éditer avec vos valeurs
nano .env
```
