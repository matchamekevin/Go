import { Pool } from 'pg';
import { Config } from '../../enviroment/env.config';

console.log('Database SSL config:', {
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_SSL: process.env.DATABASE_SSL,
	databaseUrl: Config.databaseUrl,
	sslEnabled: process.env.NODE_ENV === 'production' || process.env.DATABASE_SSL === 'true'
});

const pool = new Pool({
	connectionString: Config.databaseUrl || undefined,
	ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default pool;
