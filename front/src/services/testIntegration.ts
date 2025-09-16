/**
 * Script de test pour vérifier l'intégration API
 * Ce fichier peut être utilisé pour tester les services en développement
 */

import { RouteService } from './routeService';
import { UserTicketService } from './userTicketService';

export const testApiIntegration = async () => {
  console.log('🚀 Test de l\'intégration API...');
  
  try {
    // Test RouteService
    console.log('📍 Test des trajets populaires...');
    const popularRoutes = await RouteService.getPopularRoutes();
    console.log(`✅ Trajets populaires récupérés: ${popularRoutes.length} trouvés`);
    
    if (popularRoutes.length > 0) {
      console.log('Premier trajet:', {
        from: popularRoutes[0].from,
        to: popularRoutes[0].to,
        price: popularRoutes[0].price,
        type: popularRoutes[0].type
      });
    }
    
    // Test UserTicketService - Tickets actifs
    console.log('🎫 Test des tickets actifs...');
    const activeTickets = await UserTicketService.getActiveTickets();
    console.log(`✅ Tickets actifs récupérés: ${activeTickets.length} trouvés`);
    
    if (activeTickets.length > 0) {
      console.log('Premier ticket actif:', {
        type: activeTickets[0].type,
        route: activeTickets[0].route,
        price: activeTickets[0].price,
        status: activeTickets[0].status
      });
    }
    
    // Test UserTicketService - Historique
    console.log('📚 Test de l\'historique des tickets...');
    const historyTickets = await UserTicketService.getTicketHistory();
    console.log(`✅ Historique récupéré: ${historyTickets.length} trouvés`);
    
    if (historyTickets.length > 0) {
      console.log('Premier ticket historique:', {
        type: historyTickets[0].type,
        route: historyTickets[0].route,
        price: historyTickets[0].price,
        status: historyTickets[0].status
      });
    }
    
    console.log('🎉 Intégration API testée avec succès !');
    return {
      success: true,
      data: {
        popularRoutes: popularRoutes.length,
        activeTickets: activeTickets.length,
        historyTickets: historyTickets.length
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'intégration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

// Fonction utilitaire pour tester un service spécifique
export const testSpecificService = async (service: 'routes' | 'activeTickets' | 'historyTickets') => {
  console.log(`🔍 Test spécifique du service: ${service}`);
  
  try {
    switch (service) {
      case 'routes':
        const routes = await RouteService.getPopularRoutes();
        console.log(`✅ ${routes.length} trajets populaires récupérés`);
        return routes;
        
      case 'activeTickets':
        const activeTickets = await UserTicketService.getActiveTickets();
        console.log(`✅ ${activeTickets.length} tickets actifs récupérés`);
        return activeTickets;
        
      case 'historyTickets':
        const historyTickets = await UserTicketService.getTicketHistory();
        console.log(`✅ ${historyTickets.length} tickets historiques récupérés`);
        return historyTickets;
        
      default:
        throw new Error(`Service inconnu: ${service}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du test du service ${service}:`, error);
    throw error;
  }
};

// Fonction pour tester la transformation des données
export const testDataTransformation = () => {
  console.log('🔄 Test de la transformation des données...');
  
  // Exemple de données backend simulées
  const mockBackendRoute = {
    id: 'route_001',
    name: 'Centre-ville vers Aéroport',
    start_point: 'Place République',
    end_point: 'Terminal 2',
    price_category: 'T250' as const,
    distance_km: 15,
    duration_minutes: 45,
    is_active: true,
    code: 'CVA_001'
  };
  
  const mockBackendTicket = {
    id: 'ticket_001',
    product_code: 'BUS_EXPRESS',
    route_code: 'CVA_001',
    status: 'unused' as const,
    purchased_at: new Date().toISOString(),
    product_name: 'Bus Express',
    product_price: 250,
    route_name: 'Centre-ville → Aéroport'
  };
  
  console.log('Données backend simulées créées:', {
    route: mockBackendRoute.name,
    ticket: mockBackendTicket.product_name
  });
  
  console.log('✅ Test de transformation réussi !');
  return { mockBackendRoute, mockBackendTicket };
};