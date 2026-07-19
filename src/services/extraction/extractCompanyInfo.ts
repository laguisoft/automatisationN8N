import * as cheerio from 'cheerio';
import { getConfig } from '../../config';
import { getHttpClient } from '../../utils/httpClient';
import { RateLimiter } from '../../utils/rateLimiter';
import { isAllowedByRobotsTxt } from '../../utils/robotsTxt';
import { logger } from '../../utils/logger';
import type { ExtractedPage } from '../../types';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Numeros guineens (+224 puis 8 ou 9 chiffres) ou formats locaux avec espaces/tirets.
const PHONE_REGEX = /(?:\+224|00224)?[\s.-]?(?:6|7)\d(?:[\s.-]?\d){6,7}/g;
const FACEBOOK_REGEX = /https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9._-]+/g;
const LINKEDIN_REGEX = /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[A-Za-z0-9._-]+/g;

let rateLimiter: RateLimiter | null = null;
function getExtractionRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    const { env } = getConfig();
    rateLimiter = new RateLimiter(env.EXTRACTION_MAX_REQUESTS_PER_MINUTE, 60_000);
  }
  return rateLimiter;
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

/**
 * Recupere et parse une page web publique, en respectant robots.txt et une
 * limite de debit. Retourne `null` si l'acces est interdit ou echoue.
 */
export async function extractCompanyInfo(url: string): Promise<ExtractedPage | null> {
  const allowed = await isAllowedByRobotsTxt(url);
  if (!allowed) {
    logger.info({ url }, 'Extraction ignoree : interdite par robots.txt');
    return null;
  }

  const origin = (() => {
    try {
      return new URL(url).origin;
    } catch {
      return url;
    }
  })();

  await getExtractionRateLimiter().acquire(origin);

  try {
    const http = getHttpClient();
    const response = await http.get<string>(url, {
      timeout: 15_000,
      validateStatus: (status) => status < 400,
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });

    const html = typeof response.data === 'string' ? response.data : '';
    const $ = cheerio.load(html);

    $('script, style, noscript').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 20_000);
    const title = $('title').first().text().trim() || null;

    return {
      url,
      title,
      textContent,
      phones: uniq(textContent.match(PHONE_REGEX) ?? []),
      emails: uniq((html.match(EMAIL_REGEX) ?? []).filter((e) => !e.endsWith('.png') && !e.endsWith('.jpg'))),
      facebookUrls: uniq(html.match(FACEBOOK_REGEX) ?? []),
      linkedinUrls: uniq(html.match(LINKEDIN_REGEX) ?? []),
      fetchedAt: new Date(),
    };
  } catch (error) {
    logger.warn({ error, url }, "Echec de l'extraction de la page");
    return null;
  }
}
