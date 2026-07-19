import { z } from 'zod';

const boolFromString = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().default('laguisoft-lead-finder'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DASHBOARD_API_KEY: z.string().min(8, 'DASHBOARD_API_KEY doit contenir au moins 8 caracteres'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),

  REDIS_URL: z.string().min(1, 'REDIS_URL est requis'),

  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY est requis'),
  CLAUDE_MODEL: z.string().default('claude-sonnet-5'),

  OPENAI_API_KEY: z.string().optional(),

  GOOGLE_CSE_ENABLED: boolFromString,
  GOOGLE_CSE_API_KEY: z.string().optional(),
  GOOGLE_CSE_ENGINE_ID: z.string().optional(),

  BING_SEARCH_ENABLED: boolFromString,
  BING_SEARCH_API_KEY: z.string().optional(),

  BRAVE_SEARCH_ENABLED: boolFromString,
  BRAVE_SEARCH_API_KEY: z.string().optional(),

  TAVILY_ENABLED: boolFromString,
  TAVILY_API_KEY: z.string().optional(),

  DUCKDUCKGO_ENABLED: boolFromString,

  SEARCH_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(20),
  EXTRACTION_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(15),
  EXTRACTION_RESPECT_ROBOTS_TXT: boolFromString,
  EXTRACTION_USER_AGENT: z
    .string()
    .default('LaguisoftLeadFinderBot/1.0 (+https://laguisoft.com; prospection B2B)'),

  SMTP_ENABLED: boolFromString,
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_SECURE: boolFromString,
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  WHATSAPP_ENABLED: boolFromString,
  WHATSAPP_BUSINESS_PHONE_ID: z.string().optional(),
  WHATSAPP_BUSINESS_TOKEN: z.string().optional(),
  WHATSAPP_REQUIRE_OPT_IN: boolFromString,

  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_API_KEY: z.string().optional(),

  PIPELINE_MAX_QUERIES_PER_RUN: z.coerce.number().int().positive().default(40),
  PIPELINE_MAX_RESULTS_PER_QUERY: z.coerce.number().int().positive().default(10),
  PIPELINE_REQUIRE_HUMAN_VALIDATION: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuration invalide (.env) :\n${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
