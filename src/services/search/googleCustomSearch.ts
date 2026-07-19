import { getConfig } from '../../config';
import { getHttpClient } from '../../utils/httpClient';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import type { SearchAdapter, SearchResultItem } from '../../types';

/** Google Programmable Search Engine (Custom Search JSON API). */
export class GoogleCustomSearchAdapter implements SearchAdapter {
  readonly engine = 'google' as const;

  get enabled(): boolean {
    const { env } = getConfig();
    return Boolean(env.GOOGLE_CSE_ENABLED && env.GOOGLE_CSE_API_KEY && env.GOOGLE_CSE_ENGINE_ID);
  }

  async search(query: string, maxResults: number): Promise<SearchResultItem[]> {
    const { env } = getConfig();
    if (!this.enabled) return [];

    const http = getHttpClient();
    const num = Math.min(maxResults, 10);

    try {
      const response = await withRetry(() =>
        http.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: env.GOOGLE_CSE_API_KEY,
            cx: env.GOOGLE_CSE_ENGINE_ID,
            q: query,
            num,
          },
        }),
      );

      const items = (response.data?.items ?? []) as Array<{
        title?: string;
        link?: string;
        snippet?: string;
      }>;

      return items
        .filter((item) => item.link)
        .map((item) => ({
          title: item.title ?? '',
          url: item.link as string,
          snippet: item.snippet ?? '',
          engine: this.engine,
          query,
        }));
    } catch (error) {
      logger.warn({ error, query }, 'Google Custom Search: echec de la requete');
      return [];
    }
  }
}
