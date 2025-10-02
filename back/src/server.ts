// Load .env file into process.env if present (lightweight, no dependency)
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  });
}

import http from 'http';
import app from './app';
import { Config } from './enviroment/env.config';

// Use configured port (from .env or Render). Fallback to 7000 for local dev compatibility.
const port = Config.port || (process.env.PORT ? Number(process.env.PORT) : 7000);

console.log('Using databaseUrl:', Config.databaseUrl);
console.log('Listening on port:', port);

// Create HTTP server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
