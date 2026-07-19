import type { Pool } from 'pg';
import { getPool } from '../pool';

export type MessageChannel = 'email' | 'whatsapp' | 'contact_form';
export type MessageStatus = 'queued' | 'sent' | 'failed';

export class MessageLogRepository {
  constructor(private readonly pool: Pool = getPool()) {}

  async record(params: {
    prospectId: string;
    channel: MessageChannel;
    content: string;
    status: MessageStatus;
    error?: string | null;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO messages_log (prospect_id, channel, content, status, error, sent_at)
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $4 = 'sent' THEN now() ELSE NULL END)`,
      [params.prospectId, params.channel, params.content, params.status, params.error ?? null],
    );
  }

  async findByProspectId(prospectId: string) {
    const { rows } = await this.pool.query(
      `SELECT * FROM messages_log WHERE prospect_id = $1 ORDER BY created_at DESC`,
      [prospectId],
    );
    return rows;
  }
}
