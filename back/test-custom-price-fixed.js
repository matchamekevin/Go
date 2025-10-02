// Set environment variables BEFORE importing the app
process.env.DATABASE_URL = 'postgresql://gosotral_user:gosotral_pass@localhost:5433/gosotral_db';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433';
process.env.DB_USER = 'gosotral_user';
process.env.DB_PASSWORD = 'gosotral_pass';
process.env.DB_NAME = 'gosotral_db';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'adminpass';

const http = require('http');
const app = require('./dist/app.js').default;

const PORT = 7004;

function postJson(path, payload, token, method = 'POST') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { hostname: '127.0.0.1', port: PORT, path, method, headers },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : null;
            resolve({ status: res.statusCode || 0, body: parsed });
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function startServer() {
  return new Promise((resolve) => {
    const s = app.listen(PORT, () => resolve(s));
  });
}

(async () => {
  const server = await startServer();
  try {
    console.log('Server started for custom price test on port', PORT);

    // Login admin
    const login = await postJson('/auth/admin/login', { email: 'admin@example.com', password: 'adminpass' });
    if (login.status !== 200 || !login.body?.data?.token) {
      console.error('LOGIN FAILED', login);
      process.exit(1);
    }
    const token = login.body.data.token;
    console.log('LOGIN TEST PASSED');

    // Test génération avec prix personnalisé
    const customPrice = 250;
    console.log('Testing ticket generation with custom price:', customPrice);
    const ticketGen = await postJson('/admin/sotral/generate-tickets', {
      lineId: 1,
      ticketTypeCode: 'ordinaires',
      quantity: 100,  // Test avec 100 tickets
      validityHours: 24,
      price_fcfa: customPrice
    }, token);

    if (ticketGen.status !== 200 && ticketGen.status !== 201) {
      console.error('TICKET GENERATION FAILED', ticketGen);
      process.exit(1);
    }
    console.log('TICKET GENERATION PASSED');

    // Récupérer les tickets pour vérifier le prix
    const ticketsResponse = await postJson('/admin/sotral/tickets?limit=1000', {}, token, 'GET');
    if (ticketsResponse.status !== 200 || !ticketsResponse.body?.data) {
      console.error('TICKETS FETCH FAILED', ticketsResponse);
      process.exit(1);
    }

    const tickets = ticketsResponse.body.data;
    console.log(`Total tickets in database: ${tickets.length}`);

    // Compter les tickets avec le prix personnalisé
    const customPriceTickets = tickets.filter(t => t.price_paid_fcfa === customPrice);
    console.log(`Tickets with custom price (${customPrice}): ${customPriceTickets.length}`);

    if (customPriceTickets.length >= 100) {
      console.log('✅ CUSTOM PRICE TEST PASSED - All tickets have correct custom price');
    } else {
      console.error('❌ CUSTOM PRICE TEST FAILED - Not all tickets have custom price');
      console.error(`Expected at least 100 tickets with price ${customPrice}, got ${customPriceTickets.length}`);
      process.exit(1);
    }

    console.log('ALL TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('ERROR RUNNING TESTS', err);
    process.exit(1);
  } finally {
    server.close();
  }
})();