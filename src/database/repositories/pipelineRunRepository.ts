import type { Pool, QueryResultRow } from 'pg';
import { getPool } from '../pool';
import type { PipelineRun, PipelineRunStatus } from '../../types';

interface PipelineRunRow extends QueryResultRow {
  id: string;
  started_at: Date;
  finished_at: Date | null;
  status: PipelineRunStatus;
  prospects_found: number;
  prospects_new: number;
  prospects_validated: number;
  messages_sent: number;
  errors_count: number;
  triggered_by: string;
}

function toPipelineRun(row: PipelineRunRow): PipelineRun {
  return {
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    prospectsFound: row.prospects_found,
    prospectsNew: row.prospects_new,
    prospectsValidated: row.prospects_validated,
    messagesSent: row.messages_sent,
    errorsCount: row.errors_count,
    triggeredBy: row.triggered_by,
  };
}

export class PipelineRunRepository {
  constructor(private readonly pool: Pool = getPool()) {}

  async start(triggeredBy: string): Promise<PipelineRun> {
    const { rows } = await this.pool.query<PipelineRunRow>(
      `INSERT INTO pipeline_runs (triggered_by) VALUES ($1) RETURNING *`,
      [triggeredBy],
    );
    return toPipelineRun(rows[0]);
  }

  async finish(
    id: string,
    status: Exclude<PipelineRunStatus, 'running'>,
    counters: {
      prospectsFound: number;
      prospectsNew: number;
      prospectsValidated: number;
      messagesSent: number;
      errorsCount: number;
    },
  ): Promise<PipelineRun> {
    const { rows } = await this.pool.query<PipelineRunRow>(
      `UPDATE pipeline_runs
       SET status = $2, finished_at = now(), prospects_found = $3,
           prospects_new = $4, prospects_validated = $5, messages_sent = $6,
           errors_count = $7
       WHERE id = $1
       RETURNING *`,
      [
        id,
        status,
        counters.prospectsFound,
        counters.prospectsNew,
        counters.prospectsValidated,
        counters.messagesSent,
        counters.errorsCount,
      ],
    );
    return toPipelineRun(rows[0]);
  }

  async findRecent(limit = 20): Promise<PipelineRun[]> {
    const { rows } = await this.pool.query<PipelineRunRow>(
      `SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT $1`,
      [limit],
    );
    return rows.map(toPipelineRun);
  }
}
