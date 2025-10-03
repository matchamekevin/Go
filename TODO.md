# Plan de Refactorisation pour les Codebases Admin et Back

## Refactorisation Admin

- [x] Décomposer SotralManagementPage.tsx en composants plus petits (LineTable, LineModal, StatsCards, ErrorDisplay)
- [x] Extraire les appels API dans des hooks personnalisés (useSotralLines, useSotralStops, useSotralStats)
- [x] Corriger les problèmes de props des composants et supprimer le code modal complexe
- [x] Simplifier le modal d'édition pour utiliser des inputs texte au lieu de dropdowns
- [x] Nettoyer les erreurs TypeScript (imports inutilisés, variables, interfaces)
- [x] Corriger le problème de suspension des lignes (utilise maintenant toggle-status au lieu de delete)
- [x] Corriger les problèmes de modification/création de lignes (interface mise à jour)
- [ ] Améliorer la gestion d'erreurs avec un contexte d'erreur centralisé ou hook
- [ ] Ajouter des interfaces TypeScript pour une meilleure sécurité de type
- [ ] Implémenter les états de chargement et les mises à jour optimistes

## Refactorisation Back

- [ ] Ajouter un middleware pour l'authentification, la validation et la gestion d'erreurs
- [ ] Organiser les routes en groupes logiques (ex: auth, admin, public)
- [ ] Ajouter la journalisation et la surveillance pour les endpoints API
- [ ] Optimiser les requêtes base de données avec des index et la pagination
- [ ] Assurer des formats de réponse cohérents entre les endpoints

## Améliorations Générales

- [ ] Ajouter des tests unitaires pour les composants clés et endpoints API
- [ ] Améliorer la documentation pour les APIs et composants
- [ ] Assurer la cohérence entre les APIs admin et back

## Corrections Apportées

### Problèmes Résolus

- [x] **Problème de suspension des lignes** : L'interface utilisait `DELETE` au lieu de `toggle-status`, ce qui causait la désactivation permanente des lignes au lieu de les suspendre temporairement
- [x] **Incohérence terminologique** : Les messages et boutons ont été mis à jour pour utiliser "désactiver" au lieu de "supprimer" pour refléter le comportement réel
- [x] **Interface utilisateur confuse** : Les utilisateurs pensaient qu'ils supprimaient définitivement les lignes alors qu'elles étaient seulement désactivées

### Changements Implémentés

- [x] Modification de la fonction `deleteLine` pour afficher des messages cohérents avec la désactivation
- [x] Mise à jour des modals pour utiliser la terminologie correcte ("désactiver" au lieu de "supprimer")
- [x] Correction des boutons d'action pour refléter l'action réelle effectuée
- [x] Amélioration de l'expérience utilisateur avec des messages plus clairs

## Étapes de Suivi

- [ ] Exécuter les tests pour s'assurer que la fonctionnalité est préservée
- [ ] Déployer et tester en environnement de développement
- [ ] Recueillir les commentaires pour d'autres itérations
