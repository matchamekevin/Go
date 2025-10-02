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
import pool from './shared/database/client';

// Fonction d'initialisation de la base de données
async function initializeDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Créer les tables essentielles si elles n'existent pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Base de données initialisée');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    // Ne pas arrêter le serveur pour une erreur d'initialisation
  }
}

// Use configured port (from .env or Render). Fallback to 7000 for local dev compatibility.
const port = Config.port || (process.env.PORT ? Number(process.env.PORT) : 7000);

console.log('Using databaseUrl:', Config.databaseUrl);
console.log('Listening on port:', port);

// Initialiser la base de données puis démarrer le serveur
initializeDatabase().then(() => {
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
}).catch((error) => {
  console.error('❌ Erreur fatale lors de l\'initialisation:', error);
  process.exit(1);
});
