# 📚 INDEX - Documentation Application Go

## 🚀 Démarrage rapide

**👉 Commencez ici:** [START_HERE.md](START_HERE.md)

---

## 📖 Documentation complète

### Guides principaux
- **[START_HERE.md](START_HERE.md)** - Guide de démarrage rapide (2 étapes)
- **[BUILD_APK_GUIDE.md](BUILD_APK_GUIDE.md)** - Guide complet de compilation (7KB)
- **[RESUME.md](RESUME.md)** - Résumé détaillé de tout ce qui a été fait (7KB)
- **[COMMANDES_RAPIDES.md](COMMANDES_RAPIDES.md)** - Aide-mémoire des commandes (4KB)

---

## 🛠️ Scripts disponibles

### Scripts de compilation
- **`./build-apk.sh`** - Script principal de compilation (menu interactif)
- **`./find-apk.sh`** - Trouver et installer l'APK après compilation
- **`./verifier-config.sh`** - Vérifier que l'environnement est prêt

### Scripts de génération
- **`python3 scripts/icon-generator/generate_icons.py`** - Générer/régénérer les icônes

---

## 📁 Fichiers créés

### Icônes (dans `assets/images/`)
- `icon.png` (1024x1024) - Icône principale
- `adaptive-icon.png` (1024x1024) - Icône adaptative Android
- `splash-icon.png` (1242x2436) - Écran de démarrage
- `favicon.png` (48x48) - Icône web

### Configuration
- `app.json` - Configuration Expo (mise à jour)
- `eas.json` - Configuration EAS Build (déjà présent)

---

## ⚡ Commandes essentielles

### Compiler l'APK
```bash
./build-apk.sh
```

### Vérifier la configuration
```bash
./verifier-config.sh
```

### Trouver l'APK après compilation
```bash
./find-apk.sh
```

### Installer sur appareil Android
```bash
adb install -r GoSOTRAL.apk
```

### Régénérer les icônes
```bash
python3 scripts/icon-generator/generate_icons.py
```

---

## 🎯 Ordre de lecture recommandé

1. **START_HERE.md** - Pour commencer tout de suite
2. **verifier-config.sh** - Pour vérifier que tout est OK
3. **BUILD_APK_GUIDE.md** - Pour comprendre en détail
4. **COMMANDES_RAPIDES.md** - Pour référence rapide

---

## 📱 Résultat final

Après compilation et installation, votre application s'affichera sur Android avec:
- **Nom:** Go
- **Icône:** Cercle bleu avec "Go" en blanc
- **Package:** com.matchamekevin.gosotral

---

## 🆘 Besoin d'aide?

- Consultez la section "Dépannage" de **BUILD_APK_GUIDE.md**
- Exécutez **`./verifier-config.sh`** pour diagnostiquer les problèmes

---

**Créé le:** 16 octobre 2024
**Version:** 1.0
