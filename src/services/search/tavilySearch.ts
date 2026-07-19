import { getConfig } from '../../config';
import { getHttpClient } from '../../utils/httpClient';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import type { SearchAdapter, SearchResultItem } from '../../types';

/** Tavily Search API (https://tavily.com), pensee pour la recherche assistee par IA. */
export class TavilySearchAdapter implements SearchAdapter {
  readonly engine = 'tavily' as const;

  get enabled(): boolean {
    const { env } = getConfig();
    return Boolean(env.TAVILY_ENABLED && env.TAVILY_API_KEY);
  }

  async search(query: string, maxResults: number): Promise<SearchResultItem[]> {
    const { env } = getConfig();
    if (!this.enabled) return [];

    const http = getHttpClient();

    try {
      const response = await withRetry(() =>
        http.post('https://api.tavily.com/search', {
          api_key: env.TAVILY_API_KEY,
          query,
          max_results: Math.min(maxResults, 20),
          search_depth: 'basic',
        }),
      );

      const items = (response.data?.results ?? []) as Array<{
        title?: string;
        url?: string;
        content?: string;
      }>;

      return items
        .filter((item) => item.url)
        .map((item) => ({
          title: item.title ?? '',
          url: item.url as string,
          snippet: item.content ?? '',
          engine: this.engine,
          query,
        }));
    } catch (error) {
      logger.warn({ error, query }, 'Tavily: echec de la requete');
      return [];
    }
  }
}
