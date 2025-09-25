# 🧪 Guide de Test - Inscription GoSOTRAL

## ✅ **Backend Mis à Jour**
- ✅ Validation élargie pour numéros togolais (70-79 et 90-99)
- ✅ Backend redémarré et fonctionnel
- ✅ App mobile lancée sur `exp://192.168.1.184:8082`

---

## 📱 **Test d'Inscription**

### 1. **Données de Test Valides**

#### **Compte Test #1**
- **Nom** : Kevin Gnati
- **Email** : kevin.test@example.com
- **Téléphone** : `70 12 34 56` (ou n'importe quel préfixe 70-79, 90-99)
- **Mot de passe** : test123

#### **Compte Test #2** 
- **Nom** : Test User
- **Email** : user.test@gosotral.com  
- **Téléphone** : `90 11 22 33`
- **Mot de passe** : password123

#### **Préfixes Valides Togolais**
- **Togocel** : 70, 71, 72, 73, 74, 75, 76, 77, 78, 79
- **Moov/YAS** : 90, 91, 92, 93, 94, 95, 96, 97, 98, 99

---

## 🎯 **Étapes de Test**

### 1. **Ouvrir l'App**
```bash
# L'app est déjà lancée, scanne le QR code avec ton téléphone
# Ou appuie sur 'w' pour ouvrir dans le navigateur
```

### 2. **Navigation**
- Tu arriveras sur le **Dev Menu**
- Sélectionne **"Test Inscription"** ou va dans l'interface principale

### 3. **Remplir le Formulaire**
- Utilise les données de test ci-dessus
- **Important** : Le format téléphone est `XX XX XX XX` (sans +228)
- Le frontend ajoute automatiquement le `+228`

### 4. **Vérification Attendue**
✅ **Succès** : "Inscription réussie. Vérifiez votre email..."
❌ **Échec** : Message d'erreur spécifique

---

## 🔧 **Si Problème Persiste**

### Test API Direct
```bash
# Test avec curl
curl -X POST http://192.168.1.184:7000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kevin Test",
    "email": "kevin.test@example.com", 
    "password": "test123",
    "phone": "+22870123456"
  }'
```

### Vérifier Logs Backend
```bash
cd /home/connect/kev/Go/back
docker compose logs -f api
```

---

## 📋 **Checklist**

- [ ] Backend accessible : `curl http://192.168.1.184:7000/health`
- [ ] App mobile ouverte sur téléphone
- [ ] Formulaire d'inscription testé
- [ ] Numéro avec préfixe valide (70-79 ou 90-99)
- [ ] Email unique pour chaque test

---

## 🎉 **Après Inscription Réussie**

L'app devrait :
1. Afficher un message de succès
2. Rediriger vers la vérification OTP
3. Dans les logs backend, tu verras l'OTP généré (pour les tests)

**Prêt pour le test ! 🚀**
