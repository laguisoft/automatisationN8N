import { readFileSync } from 'fs';
import { join } from 'path';

// Les fichiers JSON de /config (racine du projet) sont charges une seule fois
// au demarrage. __dirname pointe vers src/config (dev) ou dist/config (prod),
// et /config est dans les deux cas deux niveaux au-dessus.
const CONFIG_DIR = join(__dirname, '..', '..', 'config');

function readJson<T>(filename: string): T {
  const raw = readFileSync(join(CONFIG_DIR, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

export interface ScoringWeightsConfig {
  maxScore: number;
  criteria: Record<string, { points: number; description: string }>;
  thresholds: { hot: number; warm: number; cold: number };
}

export interface SectorDefinition {
  id: string;
  label: string;
  keywords: string[];
}

export interface SectorsConfig {
  sectors: SectorDefinition[];
  needSignals: Record<string, string[]>;
}

export interface SearchQueriesConfig {
  locations: { name: string; priority: number }[];
  queryTemplates: string[];
  maxResultsPerQuery: number;
  maxQueriesPerRun: number;
}

export interface CompanyProfileConfig {
  name: string;
  activities: string[];
  priorityZones: string[];
  targetSectors: string[];
  valueProposition: string;
  callToAction: string;
  signature: string;
}

let cache: {
  scoringWeights: ScoringWeightsConfig;
  sectors: SectorsConfig;
  searchQueries: SearchQueriesConfig;
  companyProfile: CompanyProfileConfig;
} | null = null;

export function loadAppConfig() {
  if (cache) return cache;

  cache = {
    scoringWeights: readJson<ScoringWeightsConfig>('scoring-weights.json'),
    sectors: readJson<SectorsConfig>('sectors.json'),
    searchQueries: readJson<SearchQueriesConfig>('search-queries.json'),
    companyProfile: readJson<CompanyProfileConfig>('company-profile.json'),
  };

  return cache;
}
