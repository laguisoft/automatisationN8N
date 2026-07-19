-- Schema initial de Laguisoft Lead Finder

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'failed', 'partial')),
  prospects_found INTEGER NOT NULL DEFAULT 0,
  prospects_new INTEGER NOT NULL DEFAULT 0,
  prospects_validated INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,
  triggered_by TEXT NOT NULL DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  city TEXT,
  sector TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  description TEXT,
  probable_needs TEXT[] NOT NULL DEFAULT '{}',
  current_software TEXT,
  commercial_potential TEXT NOT NULL DEFAULT 'moyen'
    CHECK (commercial_potential IN ('faible', 'moyen', 'eleve')),
  urgency TEXT NOT NULL DEFAULT 'moyenne'
    CHECK (urgency IN ('faible', 'moyenne', 'haute')),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  score_reason TEXT,
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  search_query TEXT,
  dedup_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'pending_validation', 'validated', 'rejected', 'message_generated', 'sent', 'failed')),
  generated_message TEXT,
  validated_by TEXT,
  validated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_channel TEXT,
  run_id UUID REFERENCES pipeline_runs (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects (status);
CREATE INDEX IF NOT EXISTS idx_prospects_score ON prospects (score DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_city ON prospects (city);
CREATE INDEX IF NOT EXISTS idx_prospects_sector ON prospects (sector);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON prospects (created_at DESC);

CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES pipeline_runs (id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_execution_logs_run_id ON execution_logs (run_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_level ON execution_logs (level);
CREATE INDEX IF NOT EXISTS idx_execution_logs_created_at ON execution_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS messages_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects (id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'contact_form')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_log_prospect_id ON messages_log (prospect_id);

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  requests_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (provider, usage_date)
);
