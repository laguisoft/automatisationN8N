import { Pool } from 'pg';
import { getConfig } from '../config';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const { env } = getConfig();
    pool = new Pool({ connectionString: env.DATABASE_URL });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
