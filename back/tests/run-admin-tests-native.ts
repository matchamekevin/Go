import http from 'http';
import app from '../src/app';

const PORT = 7001;

function postJson(path: string, payload: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      { hostname: '127.0.0.1', port: PORT, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
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
    console.log('Server started for tests on port', PORT);
    // valid
    const valid = await postJson('/auth/admin/login', { email: 'admin@example.com', password: 'adminpass' });
    if (valid.status !== 200 || !valid.body || valid.body.success !== true || !valid.body.data?.token) {
      console.error('VALID TEST FAILED', valid);
      process.exitCode = 1;
      return;
    }
    console.log('VALID TEST PASSED');

    // invalid
    const invalid = await postJson('/auth/admin/login', { email: 'admin@example.com', password: 'wrong' });
    if (invalid.status === 200 || (invalid.body && invalid.body.success === true)) {
      console.error('INVALID TEST FAILED', invalid);
      process.exitCode = 1;
      return;
    }
    console.log('INVALID TEST PASSED');
    process.exitCode = 0;
  } catch (err) {
    console.error('ERROR RUNNING TESTS', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
})();
