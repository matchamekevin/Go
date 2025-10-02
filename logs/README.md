# 📁 Logs

Ce dossier contient tous les fichiers de logs du projet.

## 📂 Structure

```text
logs/
├── server.log           # Logs du serveur backend
├── server_output.log    # Sortie complète du serveur
└── *.log               # Autres logs applicatifs
```

## 📋 Description des Logs

### `server.log`

- **Emplacement**: `logs/server.log`
- **Source**: Serveur backend principal
- **Contenu**: Erreurs, avertissements, informations de démarrage
- **Rotation**: Automatique via Docker/logs système

### `server_output.log`

- **Emplacement**: `logs/server_output.log`
- **Source**: Sortie complète du processus serveur
- **Contenu**: Toute la sortie console du serveur
- **Utilisation**: Debugging détaillé

## 🔍 Consultation des Logs

### Depuis Docker (recommandé)

```bash
# Logs du conteneur API
cd back && docker compose logs -f api

# Logs de la base de données
cd back && docker compose logs -f db
```

### Depuis les fichiers

```bash
# Afficher les derniers logs
tail -f logs/server.log

# Rechercher une erreur spécifique
grep "ERROR" logs/server.log

# Compter les occurrences
grep -c "ticket purchased" logs/server.log
```

## 🧹 Maintenance des Logs

### Rotation automatique

Les logs sont automatiquement rotatés par Docker pour éviter la saturation du disque.

### Nettoyage manuel

```bash
# Vider les logs (attention : données perdues)
truncate -s 0 logs/*.log

# Archiver les anciens logs
tar -czf logs/archive_$(date +%Y%m%d).tar.gz logs/*.log
```

## 🚨 Monitoring

### Alertes importantes à surveiller

- `ERROR` : Erreurs critiques
- `WARN` : Avertissements
- `ticket_validated` : Validations de tickets
- `realtime connection` : Connexions temps réel

### Commandes de monitoring

```bash
# Surveiller en temps réel
tail -f logs/server.log | grep -E "(ERROR|ticket_validated)"

# Compter les événements par heure
grep "ticket_validated" logs/server.log | cut -d' ' -f1 | uniq -c
```
