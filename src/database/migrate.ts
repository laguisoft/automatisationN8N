import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getPool } from './pool';
import { logger } from '../utils/logger';

const MIGRATIONS_DIR = join(__dirname, 'migrations');

export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
    if (rows.length > 0) {
      logger.debug({ file }, 'Migration deja appliquee, ignoree');
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      logger.info({ file }, 'Migration appliquee');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({ file, error }, "Echec de la migration");
      throw error;
    } finally {
      client.release();
    }
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Toutes les migrations sont appliquees');
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, 'Echec des migrations');
      process.exit(1);
    });
}
