const http = require('http');
const app = require('./dist/app.js').default;

const PORT = 7003;

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
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_PASSWORD = 'adminpass';

  const server = await startServer();
  try {
    console.log('Server started for delete tickets test on port', PORT);

    // Login admin
    const login = await postJson('/auth/admin/login', { email: 'admin@example.com', password: 'adminpass' });
    if (login.status !== 200 || !login.body?.data?.token) {
      console.error('LOGIN FAILED', login);
      process.exit(1);
    }
    const token = login.body.data.token;
    console.log('LOGIN TEST PASSED');

    // Test génération d'un ticket d'abord
    const ticketGen = await postJson('/admin/sotral/generate-tickets', {
      lineId: 1,
      ticketTypeCode: 'ordinaires',
      quantity: 1,
      validityHours: 24,
      price_fcfa: 150
    }, token);

    if (ticketGen.status !== 200) {
      console.error('TICKET GENERATION FAILED', ticketGen);
      process.exit(1);
    }
    console.log('TICKET GENERATION PASSED');

    // Récupérer les tickets pour obtenir un ID
    const ticketsResponse = await postJson('/admin/sotral/tickets', {}, token, 'GET');
    if (ticketsResponse.status !== 200 || !ticketsResponse.body?.data) {
      console.error('TICKETS FETCH FAILED', ticketsResponse);
      process.exit(1);
    }

    const tickets = ticketsResponse.body.data;
    if (tickets.length === 0) {
      console.error('NO TICKETS FOUND');
      process.exit(1);
    }

    const ticketId = tickets[0].id;
    console.log('Found ticket with ID:', ticketId);

    // Test suppression d'un ticket individuel
    const deleteSingle = await postJson(`/admin/sotral/tickets/${ticketId}`, {}, token, 'DELETE');
    if (deleteSingle.status !== 200) {
      console.error('SINGLE TICKET DELETE FAILED', deleteSingle);
      process.exit(1);
    }
    console.log('SINGLE TICKET DELETE PASSED');

    // Générer quelques tickets pour tester la suppression multiple
    const bulkGen = await postJson('/admin/sotral/generate-tickets', {
      lineId: 1,
      ticketTypeCode: 'ordinaires',
      quantity: 3,
      validityHours: 24,
      price_fcfa: 200
    }, token);

    if (bulkGen.status !== 200) {
      console.error('BULK TICKET GENERATION FAILED', bulkGen);
      process.exit(1);
    }
    console.log('BULK TICKET GENERATION PASSED');

    // Récupérer les tickets à nouveau
    const ticketsResponse2 = await postJson('/admin/sotral/tickets', {}, token, 'GET');
    if (ticketsResponse2.status !== 200 || !ticketsResponse2.body?.data) {
      console.error('TICKETS FETCH 2 FAILED', ticketsResponse2);
      process.exit(1);
    }

    const newTickets = ticketsResponse2.body.data;
    const ticketIds = newTickets.slice(0, 2).map(t => t.id); // Supprimer les 2 premiers
    console.log('Will delete tickets with IDs:', ticketIds);

    // Test suppression multiple
    const deleteMultiple = await postJson('/admin/sotral/tickets', { ids: ticketIds }, token, 'DELETE');
    if (deleteMultiple.status !== 200) {
      console.error('MULTIPLE TICKETS DELETE FAILED', deleteMultiple);
      process.exit(1);
    }
    console.log('MULTIPLE TICKETS DELETE PASSED');

    console.log('ALL TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('ERROR RUNNING TESTS', err);
    process.exit(1);
  } finally {
    server.close();
  }
})();