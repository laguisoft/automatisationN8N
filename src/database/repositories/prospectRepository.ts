import type { Pool, QueryResultRow } from 'pg';
import { getPool } from '../pool';
import type {
  CommercialPotential,
  NewProspectInput,
  Prospect,
  ProspectStatus,
  ScoreBreakdown,
  Urgency,
} from '../../types';

interface ProspectRow extends QueryResultRow {
  id: string;
  company_name: string;
  city: string | null;
  sector: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  description: string | null;
  probable_needs: string[];
  current_software: string | null;
  commercial_potential: CommercialPotential;
  urgency: Urgency;
  score: number;
  score_reason: string | null;
  score_breakdown: ScoreBreakdown;
  source_urls: string[];
  search_query: string | null;
  dedup_hash: string;
  status: ProspectStatus;
  generated_message: string | null;
  validated_by: string | null;
  validated_at: Date | null;
  sent_at: Date | null;
  sent_channel: string | null;
  created_at: Date;
  updated_at: Date;
}

function toProspect(row: ProspectRow): Prospect {
  return {
    id: row.id,
    companyName: row.company_name,
    city: row.city,
    sector: row.sector,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    facebookUrl: row.facebook_url,
    linkedinUrl: row.linkedin_url,
    description: row.description,
    probableNeeds: row.probable_needs,
    currentSoftware: row.current_software,
    commercialPotential: row.commercial_potential,
    urgency: row.urgency,
    score: row.score,
    scoreReason: row.score_reason ?? '',
    scoreBreakdown: row.score_breakdown,
    sourceUrls: row.source_urls,
    searchQuery: row.search_query,
    dedupHash: row.dedup_hash,
    status: row.status,
    generatedMessage: row.generated_message,
    validatedBy: row.validated_by,
    validatedAt: row.validated_at,
    sentAt: row.sent_at,
    sentChannel: row.sent_channel,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ProspectFilters {
  status?: ProspectStatus;
  city?: string;
  sector?: string;
  minScore?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export class ProspectRepository {
  constructor(private readonly pool: Pool = getPool()) {}

  async findByDedupHash(dedupHash: string): Promise<Prospect | null> {
    const { rows } = await this.pool.query<ProspectRow>(
      'SELECT * FROM prospects WHERE dedup_hash = $1',
      [dedupHash],
    );
    return rows[0] ? toProspect(rows[0]) : null;
  }

  async create(input: NewProspectInput, runId: string | null): Promise<Prospect> {
    const { rows } = await this.pool.query<ProspectRow>(
      `INSERT INTO prospects (
        company_name, city, sector, address, phone, email, website,
        facebook_url, linkedin_url, description, probable_needs,
        current_software, commercial_potential, urgency, score,
        score_reason, score_breakdown, source_urls, search_query,
        dedup_hash, run_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      RETURNING *`,
      [
        input.companyName,
        input.city,
        input.sector,
        input.address,
        input.phone,
        input.email,
        input.website,
        input.facebookUrl,
        input.linkedinUrl,
        input.description,
        input.probableNeeds,
        input.currentSoftware,
        input.commercialPotential,
        input.urgency,
        input.score,
        input.scoreReason,
        JSON.stringify(input.scoreBreakdown),
        input.sourceUrls,
        input.searchQuery,
        input.dedupHash,
        runId,
      ],
    );
    return toProspect(rows[0]);
  }

  async findById(id: string): Promise<Prospect | null> {
    const { rows } = await this.pool.query<ProspectRow>(
      'SELECT * FROM prospects WHERE id = $1',
      [id],
    );
    return rows[0] ? toProspect(rows[0]) : null;
  }

  async findMany(filters: ProspectFilters): Promise<{ items: Prospect[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters.city) {
      params.push(`%${filters.city}%`);
      conditions.push(`city ILIKE $${params.length}`);
    }
    if (filters.sector) {
      params.push(filters.sector);
      conditions.push(`sector = $${params.length}`);
    }
    if (filters.minScore !== undefined) {
      params.push(filters.minScore);
      conditions.push(`score >= $${params.length}`);
    }
    if (filters.search) {
      params.push(`%${filters.search}%`);
      conditions.push(`(company_name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const { rows } = await this.pool.query<ProspectRow>(
      `SELECT * FROM prospects ${where} ORDER BY score DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    const { rows: countRows } = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM prospects ${where}`,
      params,
    );

    return { items: rows.map(toProspect), total: Number(countRows[0]?.count ?? 0) };
  }

  async updateStatus(
    id: string,
    status: ProspectStatus,
    extra: { validatedBy?: string } = {},
  ): Promise<Prospect | null> {
    const { rows } = await this.pool.query<ProspectRow>(
      `UPDATE prospects
       SET status = $2,
           validated_by = COALESCE($3, validated_by),
           validated_at = CASE WHEN $2 IN ('validated', 'rejected') THEN now() ELSE validated_at END,
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, status, extra.validatedBy ?? null],
    );
    return rows[0] ? toProspect(rows[0]) : null;
  }

  async setGeneratedMessage(id: string, message: string): Promise<Prospect | null> {
    const { rows } = await this.pool.query<ProspectRow>(
      `UPDATE prospects
       SET generated_message = $2, status = 'message_generated', updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, message],
    );
    return rows[0] ? toProspect(rows[0]) : null;
  }

  async markSent(id: string, channel: string): Promise<Prospect | null> {
    const { rows } = await this.pool.query<ProspectRow>(
      `UPDATE prospects
       SET status = 'sent', sent_at = now(), sent_channel = $2, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, channel],
    );
    return rows[0] ? toProspect(rows[0]) : null;
  }
}
