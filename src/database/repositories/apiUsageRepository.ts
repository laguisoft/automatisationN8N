import type { Pool } from 'pg';
import { getPool } from '../pool';

export class ApiUsageRepository {
  constructor(private readonly pool: Pool = getPool()) {}

  /** Incremente le compteur du jour pour un provider et retourne le total apres incrementation. */
  async increment(provider: string): Promise<number> {
    const { rows } = await this.pool.query<{ requests_count: number }>(
      `INSERT INTO api_usage (provider, usage_date, requests_count)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (provider, usage_date)
       DO UPDATE SET requests_count = api_usage.requests_count + 1
       RETURNING requests_count`,
      [provider],
    );
    return rows[0].requests_count;
  }

  async getTodayUsage(provider: string): Promise<number> {
    const { rows } = await this.pool.query<{ requests_count: number }>(
      `SELECT requests_count FROM api_usage WHERE provider = $1 AND usage_date = CURRENT_DATE`,
      [provider],
    );
    return rows[0]?.requests_count ?? 0;
  }
}
