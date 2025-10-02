import { Pool } from 'pg';
import { Config } from '../../enviroment/env.config';

// Decide whether to enable SSL for Postgres connections.
// Use SSL when running in production, when explicitly requested via DATABASE_SSL=true,
// or when the connection string points to known hosted providers that require SSL (e.g. render.com).
const databaseUrl = Config.databaseUrl || '';
const explicitSsl = process.env.DATABASE_SSL === 'true';
const isProd = process.env.NODE_ENV === 'production';
const looksLikeHosted = /render\.com|amazonaws\.com|rds\.amazonaws\.com/i.test(databaseUrl);
const sslEnabled = isProd || explicitSsl || looksLikeHosted;

console.log('Database SSL config:', {
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_SSL: process.env.DATABASE_SSL,
	databaseUrl: databaseUrl ? `${databaseUrl.substring(0, 40)}...` : databaseUrl,
	sslEnabled,
	reason: isProd ? 'NODE_ENV=production' : explicitSsl ? 'DATABASE_SSL=true' : looksLikeHosted ? 'host looks hosted (render/aws)' : 'none'
});

const pool = new Pool({
	connectionString: databaseUrl || undefined,
	ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

export default pool;
