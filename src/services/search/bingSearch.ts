import { getConfig } from '../../config';
import { getHttpClient } from '../../utils/httpClient';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import type { SearchAdapter, SearchResultItem } from '../../types';

/** Microsoft Bing Web Search API (Azure Cognitive Services). */
export class BingSearchAdapter implements SearchAdapter {
  readonly engine = 'bing' as const;

  get enabled(): boolean {
    const { env } = getConfig();
    return Boolean(env.BING_SEARCH_ENABLED && env.BING_SEARCH_API_KEY);
  }

  async search(query: string, maxResults: number): Promise<SearchResultItem[]> {
    const { env } = getConfig();
    if (!this.enabled) return [];

    const http = getHttpClient();

    try {
      const response = await withRetry(() =>
        http.get('https://api.bing.microsoft.com/v7.0/search', {
          params: { q: query, count: Math.min(maxResults, 20) },
          headers: { 'Ocp-Apim-Subscription-Key': env.BING_SEARCH_API_KEY },
        }),
      );

      const items = (response.data?.webPages?.value ?? []) as Array<{
        name?: string;
        url?: string;
        snippet?: string;
      }>;

      return items
        .filter((item) => item.url)
        .map((item) => ({
          title: item.name ?? '',
          url: item.url as string,
          snippet: item.snippet ?? '',
          engine: this.engine,
          query,
        }));
    } catch (error) {
      logger.warn({ error, query }, 'Bing Search: echec de la requete');
      return [];
    }
  }
}
