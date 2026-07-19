import robotsParser from 'robots-parser';
import { getConfig } from '../config';
import { getHttpClient } from './httpClient';
import { logger } from './logger';

const cache = new Map<string, ReturnType<typeof robotsParser> | null>();

async function getRobotsForOrigin(origin: string): Promise<ReturnType<typeof robotsParser> | null> {
  if (cache.has(origin)) return cache.get(origin) ?? null;

  const robotsUrl = `${origin}/robots.txt`;
  try {
    const http = getHttpClient();
    const response = await http.get(robotsUrl, { validateStatus: () => true, timeout: 8_000 });
    if (response.status >= 400) {
      cache.set(origin, null);
      return null;
    }
    const robots = robotsParser(robotsUrl, response.data ?? '');
    cache.set(origin, robots);
    return robots;
  } catch (error) {
    logger.debug({ error, robotsUrl }, 'robots.txt inaccessible, acces autorise par defaut');
    cache.set(origin, null);
    return null;
  }
}

/** Verifie si l'URL peut etre recuperee, conformement a robots.txt (si le site en publie un). */
export async function isAllowedByRobotsTxt(url: string): Promise<boolean> {
  const { env } = getConfig();
  if (!env.EXTRACTION_RESPECT_ROBOTS_TXT) return true;

  try {
    const parsed = new URL(url);
    const robots = await getRobotsForOrigin(parsed.origin);
    if (!robots) return true;
    return robots.isAllowed(url, env.EXTRACTION_USER_AGENT) !== false;
  } catch {
    return true;
  }
}
