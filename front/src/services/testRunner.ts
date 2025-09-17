/**
 * Tests unitaires simples pour les services
 * Peut être exécuté dans l'app pour vérifier que tout fonctionne
 */

import { UserTicketService } from './userTicketService';
import { RouteService } from './routeService';
import { DEV_CONFIG, devLog } from '../config/devConfig';

export const runQuickTests = async () => {
  devLog('TestRunner', '🧪 Démarrage des tests de services...');
  
  const results = {
    userTicketService: { passed: 0, failed: 0 },
    routeService: { passed: 0, failed: 0 },
    total: { passed: 0, failed: 0 }
  };
  
  try {
    // Test 1: UserTicketService - Active Tickets
    devLog('TestRunner', 'Test 1: Récupération des tickets actifs');
    const activeTickets = await UserTicketService.getActiveTickets();
    
    if (Array.isArray(activeTickets) && activeTickets.length >= 0) {
      devLog('TestRunner', `✅ Test 1 réussi: ${activeTickets.length} tickets actifs`);
      results.userTicketService.passed++;
    } else {
      devLog('TestRunner', '❌ Test 1 échoué: Format de réponse invalide');
      results.userTicketService.failed++;
    }
    
    // Test 2: UserTicketService - History
    devLog('TestRunner', 'Test 2: Récupération de l\'historique');
    const historyTickets = await UserTicketService.getTicketHistory();
    
    if (Array.isArray(historyTickets) && historyTickets.length >= 0) {
      devLog('TestRunner', `✅ Test 2 réussi: ${historyTickets.length} tickets historiques`);
      results.userTicketService.passed++;
    } else {
      devLog('TestRunner', '❌ Test 2 échoué: Format de réponse invalide');
      results.userTicketService.failed++;
    }
    
    // Test 3: RouteService - Popular Routes
    devLog('TestRunner', 'Test 3: Récupération des trajets populaires');
    const popularRoutes = await RouteService.getPopularRoutes();
    
    if (Array.isArray(popularRoutes) && popularRoutes.length >= 0) {
      devLog('TestRunner', `✅ Test 3 réussi: ${popularRoutes.length} trajets populaires`);
      results.routeService.passed++;
    } else {
      devLog('TestRunner', '❌ Test 3 échoué: Format de réponse invalide');
      results.routeService.failed++;
    }
    
    // Test 4: Structure des données
    devLog('TestRunner', 'Test 4: Validation de la structure des données');
    const firstActiveTicket = activeTickets[0];
    const firstRoute = popularRoutes[0];
    
    const ticketValid = firstActiveTicket && 
                       typeof firstActiveTicket.id === 'string' &&
                       typeof firstActiveTicket.type === 'string' &&
                       typeof firstActiveTicket.route === 'string';
                       
    const routeValid = firstRoute &&
                      typeof firstRoute.id === 'string' &&
                      typeof firstRoute.from === 'string' &&
                      typeof firstRoute.to === 'string';
    
    if (ticketValid && routeValid) {
      devLog('TestRunner', '✅ Test 4 réussi: Structure des données valide');
      results.total.passed++;
    } else {
      devLog('TestRunner', '❌ Test 4 échoué: Structure des données invalide');
      results.total.failed++;
    }
    
  } catch (error) {
    devLog('TestRunner', '❌ Erreur lors des tests:', error);
    results.total.failed++;
  }
  
  // Résumé des tests
  const totalPassed = results.userTicketService.passed + results.routeService.passed + results.total.passed;
  const totalFailed = results.userTicketService.failed + results.routeService.failed + results.total.failed;
  
  devLog('TestRunner', `🏁 Tests terminés: ${totalPassed} réussis, ${totalFailed} échoués`);
  
  if (totalFailed === 0) {
    devLog('TestRunner', '🎉 Tous les tests ont réussi ! Les services fonctionnent correctement.');
  } else {
    devLog('TestRunner', '⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }
  
  return {
    success: totalFailed === 0,
    results,
    summary: { passed: totalPassed, failed: totalFailed }
  };
};

// Test spécifique pour les fallbacks
export const testFallbacks = async () => {
  devLog('FallbackTest', '🔄 Test des données de fallback...');
  
  // Activer temporairement le mode fallback
  const originalForceFallback = DEV_CONFIG.FORCE_FALLBACK;
  DEV_CONFIG.FORCE_FALLBACK = true;
  
  try {
    const activeTickets = await UserTicketService.getActiveTickets();
    const historyTickets = await UserTicketService.getTicketHistory();
    const popularRoutes = await RouteService.getPopularRoutes();
    
    devLog('FallbackTest', 'Résultats fallback:', {
      activeTickets: activeTickets.length,
      historyTickets: historyTickets.length,
      popularRoutes: popularRoutes.length
    });
    
    const success = activeTickets.length > 0 && historyTickets.length > 0 && popularRoutes.length > 0;
    
    if (success) {
      devLog('FallbackTest', '✅ Fallbacks fonctionnels !');
    } else {
      devLog('FallbackTest', '❌ Problème avec les fallbacks');
    }
    
    return { success, data: { activeTickets, historyTickets, popularRoutes } };
  } finally {
    // Restaurer la configuration originale
    DEV_CONFIG.FORCE_FALLBACK = originalForceFallback;
  }
};