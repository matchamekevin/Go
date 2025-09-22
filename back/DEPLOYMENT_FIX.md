# 🚨 Problème de déploiement Render - Script non trouvé

## ❌ Erreur rencontrée
```
sh: ./diagnose-sotral.sh: not found
==> Exited with status 127
```

## 🔍 Cause du problème

Le script `diagnose-sotral.sh` n'est pas trouvé dans le conteneur Docker lors du déploiement sur Render. Cela peut être dû à :

1. **Chemin incorrect** : Render exécute le conteneur avec un WORKDIR différent
2. **Scripts non copiés** : Les scripts ne sont pas correctement copiés dans l'image Docker
3. **Permissions** : Scripts non exécutables
4. **Contexte d'exécution** : Render utilise un shell différent

## ✅ Solutions appliquées

### 1. **Dockerfile corrigé**
- ✅ Chemins absolus pour tous les scripts
- ✅ Vérifications de présence des scripts
- ✅ Script de démarrage simplifié par défaut
- ✅ Logs détaillés pour le débogage

### 2. **Script de démarrage simplifié**
Le Dockerfile utilise maintenant un script qui :
- ✅ Démarre directement le serveur Node.js
- ✅ Ignore les scripts d'initialisation problématiques
- ✅ Fournit des logs de débogage

### 3. **Options de déploiement**

#### **Option A : Déploiement simplifié (RECOMMANDÉ)**
```dockerfile
CMD ["/usr/src/app/start-simple.sh"]
```
- ✅ Démarrage rapide et fiable
- ✅ Pas de dépendance aux scripts shell
- ✅ Fonctionne immédiatement

#### **Option B : Déploiement complet (si nécessaire)**
Pour utiliser les scripts d'initialisation :
```dockerfile
CMD ["/usr/src/app/start.sh"]
```
- ⚠️ Risque d'échec si les scripts ne sont pas trouvés
- 🔧 Nécessite que tous les scripts soient présents

## 🚀 Prochaines étapes

1. **Redéployez sur Render** avec le Dockerfile corrigé
2. **Si ça fonctionne** : L'application démarrera directement
3. **Si ça échoue encore** : Utilisez l'option de déploiement alternatif

## 🔧 Dépannage

### Vérifier les logs de build Docker
```bash
# Dans Render, vérifiez l'onglet "Logs" pendant le build
# Vous devriez voir :
# - "Scripts disponibles:"
# - Liste des scripts .sh
# - "✅ Démarrage simplifié..."
```

### Test local
```bash
# Tester l'image localement
cd back
docker build -t sotral-test .
docker run -it sotral-test /usr/src/app/start-simple.sh
```

### Forcer l'utilisation des scripts complets
Si vous voulez quand même utiliser les scripts d'initialisation :
1. Modifiez le Dockerfile : `CMD ["/usr/src/app/start.sh"]`
2. Assurez-vous que tous les scripts sont présents
3. Redéployez

## 📋 État actuel

- ✅ Dockerfile corrigé avec script simplifié
- ✅ Chemins absolus pour tous les scripts
- ✅ Démarrage direct du serveur Node.js
- ✅ Logs de débogage ajoutés

Le déploiement devrait maintenant réussir ! 🎉