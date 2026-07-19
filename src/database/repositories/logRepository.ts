import type { Pool, QueryResultRow } from 'pg';
import { getPool } from '../pool';
import type { ExecutionLogEntry, LogLevel, PipelineStage } from '../../types';

interface ExecutionLogRow extends QueryResultRow {
  id: string;
  run_id: string;
  stage: PipelineStage;
  level: LogLevel;
  message: string;
  metadata: Record<string, unknown>;
  duration_ms: number | null;
  created_at: Date;
}

export class LogRepository {
  constructor(private readonly pool: Pool = getPool()) {}

  async log(entry: ExecutionLogEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO execution_logs (run_id, stage, level, message, metadata, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.runId,
        entry.stage,
        entry.level,
        entry.message,
        JSON.stringify(entry.metadata ?? {}),
        entry.durationMs ?? null,
      ],
    );
  }

  async findByRunId(runId: string): Promise<ExecutionLogRow[]> {
    const { rows } = await this.pool.query<ExecutionLogRow>(
      `SELECT * FROM execution_logs WHERE run_id = $1 ORDER BY created_at ASC`,
      [runId],
    );
    return rows;
  }

  async findRecent(limit = 100): Promise<ExecutionLogRow[]> {
    const { rows } = await this.pool.query<ExecutionLogRow>(
      `SELECT * FROM execution_logs ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return rows;
  }
}
