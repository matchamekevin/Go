import * as http from 'http';
import app from './src/app';

const PORT = 7002;

function postJson(path: string, payload: any, token?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers: any = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { hostname: '127.0.0.1', port: PORT, path, method: 'POST', headers },
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
  return new Promise<any>((resolve) => {
    const s = app.listen(PORT, () => resolve(s));
  });
}

(async () => {
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_PASSWORD = 'adminpass';

  const server = await startServer();
  try {
    console.log('Server started for custom price tests on port', PORT);

    // Login admin
    const login = await postJson('/auth/admin/login', { email: 'admin@example.com', password: 'adminpass' });
    if (login.status !== 200 || !login.body?.data?.token) {
      console.error('LOGIN FAILED', login);
      process.exitCode = 1;
      return;
    }
    const token = login.body.data.token;
    console.log('LOGIN TEST PASSED');

    // Test génération avec prix personnalisé
    const customPrice = 250;
    const ticketGen = await postJson('/admin/sotral/generate-tickets', {
      lineId: 1,
      ticketTypeCode: 'ordinaires',
      quantity: 1,
      validityHours: 24,
      price_fcfa: customPrice
    }, token);

    if (ticketGen.status !== 200 || !ticketGen.body?.message?.includes('générés')) {
      console.error('CUSTOM PRICE TEST FAILED', ticketGen);
      process.exitCode = 1;
      return;
    }
    console.log('CUSTOM PRICE TEST PASSED - Tickets generated with custom price:', customPrice);

    // Vérifier que le ticket a bien le prix personnalisé
    const ticketsResponse = await postJson('/admin/sotral/tickets', {}, token);
    if (ticketsResponse.status !== 200 || !ticketsResponse.body?.data) {
      console.error('TICKETS FETCH FAILED', ticketsResponse);
      process.exitCode = 1;
      return;
    }

    const tickets = ticketsResponse.body.data;
    const latestTicket = tickets.find((t: any) => t.price_paid_fcfa === customPrice);

    if (!latestTicket) {
      console.error('CUSTOM PRICE VERIFICATION FAILED - No ticket found with price:', customPrice);
      console.error('Available tickets:', tickets.map((t: any) => ({ id: t.id, price: t.price_paid_fcfa })));
      process.exitCode = 1;
      return;
    }

    console.log('CUSTOM PRICE VERIFICATION PASSED - Ticket found with custom price:', customPrice);
    console.log('Ticket details:', { id: latestTicket.id, price: latestTicket.price_paid_fcfa, code: latestTicket.ticket_code });

    process.exitCode = 0;
  } catch (err) {
    console.error('ERROR RUNNING TESTS', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
})();