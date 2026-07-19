import { getConfig } from '../../config';
import { getHttpClient } from '../../utils/httpClient';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import type { SearchAdapter, SearchResultItem } from '../../types';

/** Brave Search API (https://api.search.brave.com). */
export class BraveSearchAdapter implements SearchAdapter {
  readonly engine = 'brave' as const;

  get enabled(): boolean {
    const { env } = getConfig();
    return Boolean(env.BRAVE_SEARCH_ENABLED && env.BRAVE_SEARCH_API_KEY);
  }

  async search(query: string, maxResults: number): Promise<SearchResultItem[]> {
    const { env } = getConfig();
    if (!this.enabled) return [];

    const http = getHttpClient();

    try {
      const response = await withRetry(() =>
        http.get('https://api.search.brave.com/res/v1/web/search', {
          params: { q: query, count: Math.min(maxResults, 20) },
          headers: {
            Accept: 'application/json',
            'X-Subscription-Token': env.BRAVE_SEARCH_API_KEY,
          },
        }),
      );

      const items = (response.data?.web?.results ?? []) as Array<{
        title?: string;
        url?: string;
        description?: string;
      }>;

      return items
        .filter((item) => item.url)
        .map((item) => ({
          title: item.title ?? '',
          url: item.url as string,
          snippet: item.description ?? '',
          engine: this.engine,
          query,
        }));
    } catch (error) {
      logger.warn({ error, query }, 'Brave Search: echec de la requete');
      return [];
    }
  }
}
