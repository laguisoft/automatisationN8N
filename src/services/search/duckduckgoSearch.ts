import { getConfig } from '../../config';
import { getHttpClient } from '../../utils/httpClient';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import type { SearchAdapter, SearchResultItem } from '../../types';

/**
 * DuckDuckGo Instant Answer API (https://api.duckduckgo.com).
 *
 * Important : il s'agit de l'API publique officielle "Instant Answer", pas
 * d'un moteur de recherche web complet (DuckDuckGo ne propose pas d'API SERP
 * publique avec cle). Elle est utilisee ici en complement des autres moteurs
 * (resultats souvent limites a des entites connues/Wikipedia) et non comme
 * source primaire. Aucun scraping HTML du site duckduckgo.com n'est effectue.
 */
export class DuckDuckGoSearchAdapter implements SearchAdapter {
  readonly engine = 'duckduckgo' as const;

  get enabled(): boolean {
    const { env } = getConfig();
    return Boolean(env.DUCKDUCKGO_ENABLED);
  }

  async search(query: string, _maxResults: number): Promise<SearchResultItem[]> {
    if (!this.enabled) return [];

    const http = getHttpClient();

    try {
      const response = await withRetry(() =>
        http.get('https://api.duckduckgo.com/', {
          params: { q: query, format: 'json', no_html: 1, skip_disambig: 1 },
        }),
      );

      const results: SearchResultItem[] = [];
      const data = response.data ?? {};

      if (data.AbstractURL) {
        results.push({
          title: data.Heading ?? query,
          url: data.AbstractURL,
          snippet: data.AbstractText ?? '',
          engine: this.engine,
          query,
        });
      }

      const relatedTopics = (data.RelatedTopics ?? []) as Array<{
        FirstURL?: string;
        Text?: string;
      }>;
      for (const topic of relatedTopics) {
        if (topic.FirstURL) {
          results.push({
            title: topic.Text ?? '',
            url: topic.FirstURL,
            snippet: topic.Text ?? '',
            engine: this.engine,
            query,
          });
        }
      }

      return results;
    } catch (error) {
      logger.warn({ error, query }, 'DuckDuckGo: echec de la requete');
      return [];
    }
  }
}
