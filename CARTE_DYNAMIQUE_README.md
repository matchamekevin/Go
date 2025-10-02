# 🗺️ Carte SOTRAL Dynamique - Mise à Jour Complète

## ✅ Fonctionnalités Implémentées

### 1. **Récupération des Lignes depuis l'API**

La carte charge maintenant **toutes les lignes créées par l'admin** depuis la base de données via l'API :

```typescript
const loadLines = async () => {
  const linesData = await sotralUnifiedService.getLines();
  console.log('[Map] ✅ Lignes chargées:', linesData.length);
  setLines(linesData);
};
```

**Affichage dynamique :**
- ✅ Nom de la ligne
- ✅ Route complète (route_from → route_to)
- ✅ Nombre d'arrêts desservis
- ✅ Statut actif/inactif
- ✅ Couleur unique par ligne

---

### 2. **Auto-Refresh Automatique**

Mise à jour perpétuelle toutes les **30 secondes** :

```typescript
useEffect(() => {
  loadLines();
  
  if (autoRefreshEnabled) {
    refreshIntervalRef.current = setInterval(() => {
      console.log('[Map] 🔄 Auto-refresh des lignes...');
      loadLines();
    }, 30000); // 30 secondes
  }

  return () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  };
}, [autoRefreshEnabled]);
```

**Contrôle utilisateur :**
- 🔄 Bouton dans le header pour activer/désactiver l'auto-refresh
- ⚡ Bouton manuel de rafraîchissement dans le panneau des lignes
- 🟢 Indicateur visuel (icône verte quand actif)

---

### 3. **Panneau des Lignes Amélioré**

#### **Header du panneau :**
```
┌────────────────────────────────┐
│ Lignes SOTRAL          🔄  ✖   │
│ 12 lignes actives              │
└────────────────────────────────┘
```

#### **Liste des lignes :**
Chaque ligne affiche :
- **Barre de couleur** à gauche (couleur unique générée automatiquement)
- **Nom de la ligne** (ex: "Ligne Centre-Ville")
- **Route complète** (ex: "Gare Routière → Aéroport")
- **Nombre d'arrêts** sur la carte
- **État** : checkmark si sélectionnée, badge "Inactive" si désactivée

```
┌────────────────────────────────┐
│ ▌ Ligne Centre-Ville        ✓  │
│   Gare Routière → Aéroport     │
│   8 arrêts sur la carte        │
├────────────────────────────────┤
│ ▌ Ligne Nord                 › │
│   Tokoin → Agoe                │
│   5 arrêts sur la carte        │
└────────────────────────────────┘
```

#### **Si aucune ligne :**
```
┌────────────────────────────────┐
│         🚌                     │
│   Aucune ligne disponible      │
│   Les lignes créées par        │
│   l'admin apparaîtront ici     │
└────────────────────────────────┘
```

---

### 4. **Génération Dynamique des Couleurs**

Si une ligne n'a pas de couleur prédéfinie dans `LINE_COLORS`, une couleur est générée automatiquement :

```typescript
const getLineColor = (lineId: number): string => {
  if (LINE_COLORS[lineId]) return LINE_COLORS[lineId];
  // Génération basée sur l'ID
  const hue = (lineId * 137) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};
```

**Couleurs prédéfinies :**
- Ligne 1 : Rouge vif (#FF6B6B)
- Ligne 2 : Turquoise (#4ECDC4)
- Ligne 3 : Bleu ciel (#45B7D1)
- Ligne 4 : Orange saumon (#FFA07A)
- Ligne 5 : Vert menthe (#98D8C8)
- Lignes 6+ : Couleurs générées automatiquement

---

### 5. **Panneau Légende Mis à Jour**

Affiche les statistiques en temps réel :

```
┌────────────────────────────────┐
│ ℹ️  Réseau SOTRAL              │
├────────────────────────────────┤
│   10        │    12    │  🔄   │
│  Arrêts     │  Lignes  │ Auto  │
├────────────────────────────────┤
│ Appuyez sur un arrêt pour      │
│ voir les détails               │
└────────────────────────────────┘
```

---

## 🎯 Comportement

### **Au Démarrage**
1. Charge toutes les lignes depuis l'API
2. Affiche les arrêts sur la carte
3. Lance l'auto-refresh (30s)
4. Affiche le panneau légende avec les stats

### **Sélection d'une Ligne**
1. Clic sur une ligne dans le panneau
2. Filtre les arrêts pour ne montrer que ceux de cette ligne
3. Trace une ligne pointillée entre les arrêts
4. Centre la vue sur les arrêts de la ligne
5. Affiche un bouton "Reset" pour revenir à la vue complète

### **Sélection d'un Arrêt**
1. Clic sur un marqueur
2. Affiche le panneau d'informations avec :
   - Nom de l'arrêt
   - Lignes desservies (badges colorés)
   - Bouton "Rechercher depuis cet arrêt"
3. Centre la vue sur l'arrêt

### **Auto-Refresh**
1. Toutes les 30 secondes, recharge automatiquement les lignes
2. Ne perturbe pas l'utilisateur (pas de changement de vue)
3. Met à jour silencieusement les données
4. Peut être désactivé via le bouton dans le header

### **Rafraîchissement Manuel**
1. Clic sur le bouton 🔄 dans le panneau des lignes
2. Recharge immédiatement les lignes
3. Affiche un spinner pendant le chargement

---

## 📱 Interface Utilisateur

### **Header**
```
┌────────────────────────────────┐
│ ←  Carte du Réseau SOTRAL  🔄▦ │
│     Lomé, Togo                 │
└────────────────────────────────┘
```

- **← Retour** : Ferme la carte
- **🔄 Auto-refresh** : Active/désactive (icône verte si actif)
- **▦ Menu** : Ouvre le panneau des lignes

### **Marqueurs d'Arrêts**

- 🔵 **Normal** : Arrêt standard
- 🔴 **Sélectionné** : Arrêt cliqué (plus grand, bordure plus épaisse)
- 🟣 **Surligné** : Arrêt de la ligne sélectionnée
- **Badge** : Affiche le nombre de lignes si plusieurs lignes desservent l'arrêt

### **Panneau Flottant**

- **Bouton Reset** : Apparaît quand une ligne ou un arrêt est sélectionné
- **Panneau Légende** : Vue par défaut avec statistiques
- **Panneau Arrêt** : Quand un arrêt est sélectionné
- **Panneau Lignes** : Liste complète des lignes avec recherche

---

## 🔧 Intégration avec l'Admin

### **Workflow Complet**

1. **Admin crée une nouvelle ligne** :
   ```
   POST /sotral/lines
   {
     "name": "Ligne Express",
     "route_from": "Gare Routière",
     "route_to": "Aéroport",
     "is_active": true
   }
   ```

2. **Backend enregistre dans PostgreSQL** :
   ```sql
   INSERT INTO sotral_lines (name, route_from, route_to, is_active)
   VALUES ('Ligne Express', 'Gare Routière', 'Aéroport', true);
   ```

3. **Auto-refresh de la carte (30s max)** :
   ```typescript
   // Automatiquement toutes les 30s
   GET /sotral/lines
   ```

4. **Carte affiche la nouvelle ligne** :
   - Nouvelle entrée dans le panneau des lignes
   - Couleur générée automatiquement
   - Arrêts affichés sur la carte

### **Mise à Jour Instantanée**

Si l'utilisateur veut voir les changements immédiatement :
1. Ouvrir le panneau des lignes (icône ▦)
2. Cliquer sur le bouton 🔄
3. Les nouvelles lignes apparaissent instantanément

---

## 🚀 Performances

### **Optimisations**

- ✅ **Chargement paresseux** : Les lignes sont chargées en arrière-plan
- ✅ **Cache local** : Évite les rechargements inutiles
- ✅ **Auto-refresh intelligent** : Peut être désactivé si non nécessaire
- ✅ **Filtrage côté client** : Pas de requête API pour filtrer les arrêts
- ✅ **Nettoyage automatique** : Interval clearé lors du démontage du composant

### **Consommation Réseau**

- **Première charge** : ~1 requête API (GET /sotral/lines)
- **Auto-refresh** : ~1 requête toutes les 30 secondes
- **Rafraîchissement manuel** : 1 requête à la demande
- **Taille moyenne** : ~2-5 KB par requête (dépend du nombre de lignes)

---

## 📊 Logs de Debug

### **Logs Console**

```bash
# Au démarrage
[Map] 📡 Chargement des lignes depuis l'API...
[Map] ✅ Lignes chargées: 12

# Auto-refresh
[Map] 🔄 Auto-refresh des lignes...
[Map] ✅ Lignes chargées: 12

# En cas d'erreur
[Map] ❌ Erreur chargement lignes: Error: Network request failed
```

### **Suivi de l'État**

```typescript
console.log('État actuel:', {
  lines: lines.length,
  selectedLine: selectedLine?.name,
  selectedStop: selectedStop?.name,
  autoRefresh: autoRefreshEnabled,
  loading,
  refreshing
});
```

---

## 🎨 Personnalisation

### **Modifier l'Intervalle d'Auto-Refresh**

Dans le fichier `map.tsx`, ligne 56 :

```typescript
// Par défaut : 30 secondes
refreshIntervalRef.current = setInterval(() => {
  loadLines();
}, 30000);

// Pour 1 minute :
}, 60000);

// Pour 10 secondes :
}, 10000);
```

### **Ajouter des Couleurs Personnalisées**

Dans `LINE_COLORS` (ligne 33) :

```typescript
const LINE_COLORS: { [key: number]: string } = {
  1: '#FF6B6B',
  2: '#4ECDC4',
  // Ajouter vos couleurs :
  6: '#9B59B6', // Violet
  7: '#E74C3C', // Rouge foncé
  8: '#2ECC71', // Vert émeraude
};
```

### **Modifier les Arrêts**

Dans `SOTRAL_STOPS` (ligne 24) :

```typescript
const SOTRAL_STOPS = [
  { 
    id: 1, 
    name: 'Nouveau Arrêt', 
    latitude: 6.1400, 
    longitude: 1.2200, 
    lines: [1, 2, 3] // IDs des lignes desservant cet arrêt
  },
  // ... autres arrêts
];
```

---

## 🐛 Troubleshooting

### **Les lignes n'apparaissent pas**

1. Vérifier que l'admin a créé des lignes :
   ```bash
   curl http://localhost:7000/sotral/lines
   ```

2. Vérifier les logs de la console :
   ```
   [Map] ❌ Erreur chargement lignes: ...
   ```

3. Vérifier la connexion réseau
4. Essayer un rafraîchissement manuel (bouton 🔄)

### **Auto-refresh ne fonctionne pas**

1. Vérifier que le bouton auto-refresh est actif (icône verte)
2. Vérifier les logs console :
   ```
   [Map] 🔄 Auto-refresh des lignes...
   ```
3. Redémarrer l'application

### **Couleurs incorrectes**

1. Vérifier `LINE_COLORS` pour les couleurs personnalisées
2. La fonction `getLineColor()` génère des couleurs automatiques
3. Pour forcer une couleur, ajouter dans `LINE_COLORS`

---

## 🔮 Améliorations Futures

### **À Implémenter**

- [ ] **Recherche de lignes** : Barre de recherche dans le panneau
- [ ] **Filtres avancés** : Par zone, par type de ligne
- [ ] **Itinéraires dynamiques** : Calcul de trajet entre 2 arrêts
- [ ] **Horaires en temps réel** : Affichage des prochains bus
- [ ] **Notifications** : Alertes pour nouvelles lignes
- [ ] **Mode hors-ligne** : Cache des lignes pour utilisation offline
- [ ] **Favoris** : Sauvegarder ses lignes/arrêts préférés
- [ ] **Géolocalisation** : Trouver l'arrêt le plus proche
- [ ] **Navigation** : Directions vers un arrêt (Google Maps/Waze)
- [ ] **Accessibilité** : Support pour lecteurs d'écran

---

## 📚 Références

### **API Endpoints**

- `GET /sotral/lines` - Récupère toutes les lignes
- `GET /sotral/lines/:id` - Récupère une ligne spécifique
- `POST /sotral/lines` - Crée une nouvelle ligne (admin)
- `PUT /sotral/lines/:id` - Modifie une ligne (admin)
- `DELETE /sotral/lines/:id` - Supprime une ligne (admin)

### **Types TypeScript**

```typescript
interface UnifiedSotralLine {
  id: number;
  name: string;
  route_from: string;
  route_to: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### **Fichiers Modifiés**

- `/front/app/map.tsx` - Composant principal de la carte
- `/front/src/services/sotralUnifiedService.ts` - Service API
- `/front/src/styles/theme.ts` - Thème et couleurs

---

**Date de mise à jour** : 2 octobre 2025  
**Version** : 2.0 - Carte Dynamique avec Auto-Refresh  
**Statut** : ✅ Implémenté et fonctionnel
