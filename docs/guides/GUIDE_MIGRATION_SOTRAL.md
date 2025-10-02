# Guide de Migration - Code Réorganisé SOTRAL

## Vue d'ensemble de la nouvelle architecture

La nouvelle architecture SOTRAL suit une approche modulaire avec séparation claire des responsabilités :

```
src/
├── types/sotral/           # Types TypeScript centralisés
├── hooks/sotral/           # Hooks personnalisés pour la logique métier
├── components/sotral/      # Composants UI modulaires
├── services/              # Services API avec gestion d'erreur
├── pages/                # Pages principales utilisant la nouvelle architecture
└── modules/               # Barrel exports pour importation centralisée
```

## Architecture modulaire mise en place

### 1. Types centralisés (`types/sotral/`)
- **SotralLine, SotralTicket, SotralTicketType** : Interfaces principales
- **TicketFilters, AnalyticsData** : Types pour les états de l'application
- **API Request/Response types** : Types pour les requêtes et réponses
- **Component Props interfaces** : Types pour les props des composants

### 2. Hooks personnalisés (`hooks/sotral/`)
- **useSotralData** : Gestion des données de base (lignes, types de tickets)
- **useTicketFilters** : Gestion des filtres et pagination des tickets
- **useTicketGeneration** : Logique de génération de tickets
- **useAnalytics** : Gestion des données analytics
- **useTicketState** : État global avec useReducer pour optimisation

### 3. Composants modulaires (`components/sotral/`)
- **TicketTable** : Tableau des tickets avec actions
- **TicketGenerationForm** : Formulaire de génération de tickets
- **AnalyticsPanel** : Panneau d'affichage des statistiques
- **FilterPanel** : Panneau de filtres pour les tickets

### 4. Service API amélioré (`services/adminSotralService.ts`)
- Gestion centralisée des appels API
- Système de cache intégré
- Gestion d'erreur robuste
- Types de retour sécurisés

## Utilisation de la nouvelle architecture

### Import centralisé
```typescript
import {
  // Types
  SotralTicketWithDetails,
  TicketGenerationRequest,
  
  // Hooks  
  useTicketGeneration,
  useTicketFilters,
  
  // Composants
  TicketTable,
  TicketGenerationForm,
  
  // Service
  adminSotralService
} from '../modules/sotral';
```

### Exemple d'utilisation dans un composant
```typescript
import React from 'react';
import {
  useSotralData,
  useTicketFilters,
  TicketTable,
  FilterPanel
} from '../modules/sotral';

const MyTicketPage: React.FC = () => {
  const { lines, ticketTypes, isLoading } = useSotralData();
  const { 
    tickets, 
    filters, 
    updateFilters, 
    refreshTickets 
  } = useTicketFilters();

  return (
    <div>
      <FilterPanel
        lines={lines}
        ticketTypes={ticketTypes}
        filters={filters}
        onFiltersChange={updateFilters}
        onRefresh={refreshTickets}
      />
      <TicketTable
        tickets={tickets}
        loading={isLoading}
      />
    </div>
  );
};
```

## Avantages de la nouvelle architecture

### 1. **Séparation des responsabilités**
- Logique métier dans les hooks
- UI dans les composants
- Types centralisés
- API dans les services

### 2. **Réutilisabilité**
- Hooks réutilisables entre composants
- Composants modulaires
- Types partagés

### 3. **Performance optimisée**
- useReducer pour les états complexes
- Memoization des callbacks
- Chargement optimisé des données

### 4. **Maintenabilité**
- Code plus facile à tester
- Debugging simplifié
- Évolution modulaire

### 5. **Type Safety**
- TypeScript strict
- Interfaces complètes
- Props typées

## Migration depuis l'ancienne version

### Étapes recommandées :

1. **Remplacer les imports**
   ```typescript
   // Ancien
   import { adminSotralService } from '../services/api';
   
   // Nouveau
   import { adminSotralService } from '../modules/sotral';
   ```

2. **Utiliser les hooks personnalisés**
   ```typescript
   // Ancien : logique directe dans le composant
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(false);
   
   // Nouveau : hook personnalisé
   const { tickets, isLoading, refreshTickets } = useTicketFilters();
   ```

3. **Remplacer les composants monolithiques**
   ```typescript
   // Ancien : gros composant avec toute la logique
   const BigComponent = () => { /* 500+ lignes */ };
   
   // Nouveau : composants modulaires
   const MyPage = () => (
     <div>
       <FilterPanel {...filterProps} />
       <TicketTable {...tableProps} />
       <AnalyticsPanel {...analyticsProps} />
     </div>
   );
   ```

## Fichiers de la nouvelle architecture

### Fichiers créés :
- `types/sotral/index.ts` - Types centralisés
- `hooks/sotral/index.ts` - Barrel export des hooks
- `hooks/sotral/useSotralData.ts` - Hook pour données de base
- `hooks/sotral/useTicketFilters.ts` - Hook pour filtres
- `hooks/sotral/useTicketGeneration.ts` - Hook pour génération
- `hooks/sotral/useAnalytics.ts` - Hook pour analytics
- `hooks/sotral/useTicketState.ts` - Hook avec useReducer
- `components/sotral/index.ts` - Barrel export des composants
- `components/sotral/TicketTable.tsx` - Composant tableau
- `components/sotral/TicketGenerationForm.tsx` - Composant formulaire
- `components/sotral/AnalyticsPanel.tsx` - Composant analytics
- `components/sotral/FilterPanel.tsx` - Composant filtres
- `services/adminSotralService.ts` - Service API amélioré
- `pages/SotralTicketManagementPage.new.tsx` - Page réorganisée
- `modules/sotral.ts` - Export centralisé

### Fichier à migrer :
- `pages/SotralTicketManagementPage.tsx` - Remplacer par la nouvelle version

## Étapes suivantes

1. **Tester la nouvelle architecture** avec SotralTicketManagementPage.new.tsx
2. **Migrer progressivement** les autres pages vers la nouvelle architecture
3. **Optimiser les performances** avec les nouveaux hooks
4. **Ajouter des tests unitaires** pour chaque module
5. **Étendre l'architecture** à d'autres parties de l'application

La nouvelle architecture est maintenant prête à être utilisée ! Elle offre une base solide, maintenable et performante pour l'évolution future du système SOTRAL.