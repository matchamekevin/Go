import { Pool } from 'pg';
import { Config } from '../../enviroment/env.config';

const pool = new Pool({
	connectionString: Config.databaseUrl || undefined,
});

export default pool;
