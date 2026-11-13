import { Pool } from 'pg';
import { env } from './env.js';

const timeoutMs = 2000;
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: timeoutMs,
  query_timeout: timeoutMs,
});

pool.on('error', (error) => {
  process.stderr.write(`Database connection error: ${error.message}\n`);
});
