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

import app from './app';
import { Config } from './enviroment/env.config';

const port = 7001; // Utilisation d'un port différent pour éviter les conflits

console.log('Using databaseUrl:', Config.databaseUrl);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
