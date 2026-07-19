import { getConfig } from '../../config';
import { RateLimiter } from '../../utils/rateLimiter';
import { logger } from '../../utils/logger';
import { ApiUsageRepository } from '../../database/repositories/apiUsageRepository';
import type { SearchAdapter, SearchResultItem } from '../../types';
import { GoogleCustomSearchAdapter } from './googleCustomSearch';
import { BraveSearchAdapter } from './braveSearch';
import { BingSearchAdapter } from './bingSearch';
import { TavilySearchAdapter } from './tavilySearch';
import { DuckDuckGoSearchAdapter } from './duckduckgoSearch';

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    u.searchParams.delete('utm_source');
    u.searchParams.delete('utm_medium');
    u.searchParams.delete('utm_campaign');
    return `${u.origin}${u.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export class SearchAggregator {
  private readonly adapters: SearchAdapter[];
  private readonly rateLimiter: RateLimiter;
  private readonly apiUsageRepository: ApiUsageRepository;

  constructor(apiUsageRepository: ApiUsageRepository = new ApiUsageRepository()) {
    this.adapters = [
      new GoogleCustomSearchAdapter(),
      new BraveSearchAdapter(),
      new BingSearchAdapter(),
      new TavilySearchAdapter(),
      new DuckDuckGoSearchAdapter(),
    ];
    const { env } = getConfig();
    this.rateLimiter = new RateLimiter(env.SEARCH_MAX_REQUESTS_PER_MINUTE, 60_000);
    this.apiUsageRepository = apiUsageRepository;
  }

  /** Recherche sur tous les moteurs actives et fusionne/deduplique les resultats par URL normalisee. */
  async searchAll(query: string, maxResultsPerEngine: number): Promise<SearchResultItem[]> {
    const enabledAdapters = this.adapters.filter((a) => a.enabled);

    if (enabledAdapters.length === 0) {
      logger.warn('Aucun moteur de recherche active (verifier les variables *_ENABLED dans .env)');
      return [];
    }

    const resultsPerEngine = await Promise.all(
      enabledAdapters.map(async (adapter) => {
        await this.rateLimiter.acquire(adapter.engine);
        try {
          const results = await adapter.search(query, maxResultsPerEngine);
          await this.apiUsageRepository.increment(adapter.engine);
          return results;
        } catch (error) {
          logger.warn({ error, engine: adapter.engine, query }, 'Adaptateur de recherche en echec');
          return [] as SearchResultItem[];
        }
      }),
    );

    const seen = new Set<string>();
    const merged: SearchResultItem[] = [];

    for (const results of resultsPerEngine) {
      for (const result of results) {
        const key = normalizeUrl(result.url);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(result);
      }
    }

    return merged;
  }

  listEnabledEngines(): string[] {
    return this.adapters.filter((a) => a.enabled).map((a) => a.engine);
  }
}
