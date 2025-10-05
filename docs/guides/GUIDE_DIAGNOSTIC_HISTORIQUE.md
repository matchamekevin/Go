# 🚨 GUIDE DE DIAGNOSTIC - HISTORIQUE DES BILLETS

## 📱 Situation actuelle

**Problème** : L'historique des billets ne récupère toujours pas les paiements effectués par le compte.

## 🔍 ÉTAPE 1 : Diagnostic rapide dans l'application

### Ouvrez l'application mobile et suivez ces étapes :

1. **Allez dans l'onglet "Historique"**
   
2. **Cliquez sur le bouton "🔍 Vérifier Auth"**
   - Notez le token et l'email affichés
   - Si "Token: Non" → Vous devez vous reconnecter
   
3. **Regardez les logs dans la console**
   
   Logs attendus :
   ```
   [History] 🔍 Début du chargement de l'historique...
   [UserTicketService] Récupération des tickets utilisateur...
   [UserTicketService] Réponse API reçue: { success: true, dataLength: X, tickets: [...] }
   [History] ✅ Données reçues: { count: X, tickets: [...] }
   ```

4. **Analysez les résultats :**

   **CAS A** : `dataLength: 0`
   ```
   → L'API ne retourne aucun ticket
   → Passez à l'ÉTAPE 2 (diagnostic serveur)
   ```

   **CAS B** : `dataLength: X` mais `tickets: []` vides
   ```
   → L'API retourne des données mais la transformation échoue
   → Vérifiez les logs [UserTicketService]
   → Regardez le contenu complet dans les logs
   ```

   **CAS C** : `count: X` mais rien ne s'affiche
   ```
   → Les données sont là mais l'affichage échoue
   → Problème dans renderHistoryTicket()
   ```

## 🖥️ ÉTAPE 2 : Diagnostic du serveur

### Exécutez le script de diagnostic :

```bash
cd /home/connect/kev/Go
./diagnostic-history.sh
```

Ce script va :
1. ✅ Vérifier les tickets dans la base de données
2. ✅ Tester l'authentification
3. ✅ Tester l'endpoint `/sotral/my-tickets`
4. ✅ Analyser la structure des données retournées

### Pour exécuter le script, vous aurez besoin :

1. **User ID** : Appuyez sur Entrée pour utiliser 1, ou entrez l'ID affiché dans "Vérifier Auth"
2. **Token** : Copiez le token complet depuis les logs de l'app (après avoir cliqué sur "Vérifier Auth")

### Interprétation des résultats :

#### ✅ Résultat A : Tickets trouvés dans la BDD ET retournés par l'API
```
→ Le problème est dans le FRONTEND
→ Vérifiez userTicketService.ts
→ Vérifiez la transformation des données
```

#### ❌ Résultat B : Tickets dans la BDD mais PAS retournés par l'API
```
→ Problème dans sotral.repository.ts ou sotral.controller.ts
→ Vérifiez les logs du backend
→ Vérifiez que getUserTickets() fonctionne
```

#### ❌ Résultat C : AUCUN ticket dans la BDD
```
→ Les paiements n'attribuent pas le user_id au ticket
→ Testez le flux de paiement complet
→ Vérifiez que assignTicketToUser() fonctionne
```

## 🧪 ÉTAPE 3 : Test du flux complet

### 1. Créer un ticket de test dans l'admin

```bash
# Ouvrez l'interface admin
cd /home/connect/kev/Go/admin
npm run dev
# Ouvrez http://localhost:5173
```

Dans l'admin :
1. Allez dans "Gestion SOTRAL"
2. Cliquez sur "Générer des tickets"
3. Sélectionnez une ligne
4. Générez 1 ticket

### 2. Acheter le ticket via l'application mobile

1. Ouvrez l'app mobile
2. Allez dans "Recherche"
3. Sélectionnez la ligne du ticket créé
4. Choisissez "Quantité: 1"
5. Choisissez un moyen de paiement (Mixx ou Flooz)
6. Entrez votre numéro
7. Entrez le code de validation : `123456`
8. Validez

### 3. Vérifiez immédiatement

1. **Regardez les logs console** pendant le paiement :
   ```
   [TicketGenerated] Attribution du ticket existant à l'utilisateur...
   [TicketGenerated] ✅ Ticket attribué avec succès: XXXXX
   ```

2. **Allez dans l'onglet Historique**
3. **Tirez vers le bas pour rafraîchir**
4. **Le ticket devrait apparaître immédiatement**

## 🔧 ÉTAPE 4 : Corrections selon le diagnostic

### Si le problème est dans le FRONTEND :

#### Vérifiez `userTicketService.ts`

```typescript
// Vérifiez que la transformation utilise les bons champs
const route = ticket.line_name || `Ligne ${ticket.line_id}`;  // ✅
// PAS ticket.route_start_point ❌

const type = ticket.ticket_type_name || 'Ticket SOTRAL';  // ✅
// PAS this.getTicketTypeDisplay(ticket.product_name) ❌

const price = `${ticket.price_paid_fcfa} FCFA`;  // ✅
// PAS ticket.product_price ❌
```

#### Vérifiez le filtre dans `getTicketHistory()`

```typescript
// ✅ CORRECT - Tous les tickets achetés
.filter(ticket => ticket.purchased_at)

// ❌ INCORRECT - Seulement used/expired
.filter(ticket => ticket.status === 'used' || ticket.status === 'expired')
```

### Si le problème est dans le BACKEND :

#### Vérifiez `sotral.controller.ts`

```typescript
async getMyTickets(req: Request, res: Response) {
  const userId = (req as any).user?.id;  // ← Vérifiez que userId existe
  
  console.log('[getMyTickets] userId:', userId);  // Ajoutez ce log
  
  const tickets = await sotralRepository.getUserTickets(userId);
  
  console.log('[getMyTickets] tickets count:', tickets.length);  // Ajoutez ce log
}
```

#### Vérifiez `sotral.repository.ts`

```typescript
async getUserTickets(userId: number) {
  const query = `
    SELECT t.*, 
           l.name as line_name,
           tt.name as ticket_type_name
    FROM sotral_tickets t
    LEFT JOIN sotral_lines l ON t.line_id = l.id
    LEFT JOIN sotral_ticket_types tt ON t.ticket_type_id = tt.id
    WHERE t.user_id = $1  -- ← CRITIQUE : Vérifiez cette condition
    ORDER BY t.created_at DESC
  `;
}
```

### Si le problème est dans l'ATTRIBUTION :

#### Vérifiez que `assignTicketToUser()` attribue bien le user_id

```typescript
// Dans sotral.repository.ts
async assignGeneratedTicketToUser(ticketId, userId, paymentDetails) {
  const updateQuery = `
    UPDATE sotral_tickets 
    SET 
      user_id = $1,              -- ← user_id doit être défini
      payment_method = $2,
      payment_reference = $3,
      purchased_at = NOW()       -- ← purchased_at doit être défini
    WHERE id = $4
    RETURNING *
  `;
  
  await client.query(updateQuery, [userId, ...]);  // ← userId ne doit pas être null
}
```

## 📊 Vérification directe en base de données

### Connexion à la BDD

```bash
PGPASSWORD="Ps33lqNo85kEjLVgosFFxcWsCsnt3z3W" psql \
  -h dpg-d305h0mr433s73euqgfg-a.oregon-postgres.render.com \
  -p 5432 \
  -U gosotral_user \
  -d gosotral_db
```

### Requêtes de diagnostic

```sql
-- 1. Compter les tickets pour un utilisateur
SELECT COUNT(*) FROM sotral_tickets WHERE user_id = 1;

-- 2. Voir les tickets d'un utilisateur
SELECT 
  id, 
  ticket_code, 
  user_id, 
  line_id, 
  price_paid_fcfa, 
  status, 
  purchased_at,
  payment_method
FROM sotral_tickets 
WHERE user_id = 1 
ORDER BY purchased_at DESC 
LIMIT 10;

-- 3. Voir les tickets récemment créés (tous)
SELECT 
  id, 
  ticket_code, 
  user_id, 
  line_id, 
  price_paid_fcfa, 
  status, 
  purchased_at
FROM sotral_tickets 
ORDER BY created_at DESC 
LIMIT 20;

-- 4. Trouver les tickets sans user_id (tickets disponibles)
SELECT COUNT(*) FROM sotral_tickets WHERE user_id IS NULL;

-- 5. Vérifier qu'un ticket a bien été attribué après paiement
SELECT 
  id, 
  ticket_code, 
  user_id, 
  purchased_at,
  payment_method,
  payment_reference
FROM sotral_tickets 
WHERE payment_reference IS NOT NULL 
ORDER BY purchased_at DESC 
LIMIT 5;
```

## 🎯 Checklist de vérification

- [ ] Backend est redémarré (`npm run dev` dans `/back`)
- [ ] Utilisateur est authentifié (token valide)
- [ ] Endpoint `/sotral/my-tickets` retourne 200
- [ ] L'API retourne des données (`dataLength > 0`)
- [ ] Les tickets ont `user_id` non null dans la BDD
- [ ] Les tickets ont `purchased_at` non null dans la BDD
- [ ] Le service `userTicketService.ts` utilise `UnifiedSotralTicket`
- [ ] La transformation utilise les bons champs SOTRAL
- [ ] Le filtre utilise `ticket.purchased_at` et non `ticket.status`

## 📞 Support

Si après toutes ces vérifications le problème persiste, fournissez :

1. **Les logs complets** de l'application mobile
2. **Le résultat** du script `diagnostic-history.sh`
3. **Le résultat** des requêtes SQL ci-dessus
4. **Une capture d'écran** de l'app montrant "Vérifier Auth"

---

**Dernière mise à jour** : 2 octobre 2025
**Status** : En diagnostic
