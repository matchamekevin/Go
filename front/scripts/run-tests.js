#!/usr/bin/env node
// Simple runner pour exécuter les tests de services en environnement node
// Définit quelques globals pour éviter que le code front (react-native) ne casse en Node
if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = false;
}
if (!process.env.EXPO_PUBLIC_API_URL) {
  // éviter d'entrer dans des chemins dépendants de la plateforme
  process.env.EXPO_PUBLIC_API_URL = '';
}

(async () => {
  try {
    const { testFallbacks, runQuickTests } = require('../src/services/testRunner');
    console.log('Lancement des tests fallback...');
    const res = await testFallbacks();
    console.log('Résultat fallback:', res);
    console.log('Lancement des quick tests...');
    const res2 = await runQuickTests();
    console.log('Quick tests result:', res2);
  } catch (e) {
    console.error('Erreur lors de l\'exécution des tests:', e);
    process.exit(1);
  }
})();
