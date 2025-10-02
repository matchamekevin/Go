// Script de test pour le service unifié SOTRAL
const { getApiClient } = require('./src/services/apiClient');

async function testUnifiedService() {
  console.log('🧪 Test du service unifié SOTRAL...\n');

  try {
    // Test de l'endpoint des lignes
    console.log('📍 Test des lignes SOTRAL...');
    const linesResponse = await getApiClient().get('/sotral/lines');
    console.log(`✅ ${linesResponse.data?.length || 0} lignes récupérées`);

    if (linesResponse.data?.length > 0) {
      const line = linesResponse.data[0];
      console.log('📋 Exemple de ligne:', {
        id: line.id,
        name: line.name,
        route_from: line.route_from,
        route_to: line.route_to,
        category: line.category?.name
      });
    }

    // Test de l'endpoint des tickets générés
    console.log('\n🎫 Test des tickets générés...');
    const ticketsResponse = await getApiClient().get('/sotral/generated-tickets');
    console.log(`✅ ${ticketsResponse.data?.length || 0} tickets récupérés`);

    if (ticketsResponse.data?.length > 0) {
      const ticket = ticketsResponse.data[0];
      console.log('🎫 Exemple de ticket:', {
        id: ticket.id,
        code: ticket.ticket_code,
        price: ticket.price_paid_fcfa,
        status: ticket.status,
        line_id: ticket.line_id
      });
    }

    // Test de l'endpoint des types de tickets
    console.log('\n🏷️ Test des types de tickets...');
    const typesResponse = await getApiClient().get('/sotral/ticket-types');
    console.log(`✅ ${typesResponse.data?.length || 0} types de tickets récupérés`);

    console.log('\n✅ Tous les tests réussis ! Le service unifié devrait fonctionner correctement.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
  }
}

testUnifiedService();