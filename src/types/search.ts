export type SearchEngine = 'google' | 'bing' | 'brave' | 'tavily' | 'duckduckgo';

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  engine: SearchEngine;
  query: string;
}

export interface SearchAdapter {
  readonly engine: SearchEngine;
  readonly enabled: boolean;
  search(query: string, maxResults: number): Promise<SearchResultItem[]>;
}

export interface ExtractedPage {
  url: string;
  title: string | null;
  textContent: string;
  phones: string[];
  emails: string[];
  facebookUrls: string[];
  linkedinUrls: string[];
  fetchedAt: Date;
}
