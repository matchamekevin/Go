// Script pour obtenir un token de test
const axios = require('axios');

async function getTestToken() {
  try {
    // D'abord, créer un utilisateur de test si nécessaire
    console.log('🔑 Tentative de connexion...');
    
    const loginResponse = await axios.post('https://go-j2rr.onrender.com/auth/login', {
      email: 'validator@test.com',
      password: 'test123'
    });
    
    console.log('✅ Token obtenu:', loginResponse.data);
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      
      // Tester la validation avec le token
      console.log('🎫 Test de validation avec token...');
      const validateResponse = await axios.post('https://go-j2rr.onrender.com/tickets/validate', {
        ticket_code: 'SOT28829249167317'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      
      console.log('📥 Réponse validation:', validateResponse.data);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

getTestToken();