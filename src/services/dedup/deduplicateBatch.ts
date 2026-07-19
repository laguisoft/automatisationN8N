import { computeDedupHash, type DedupIdentity } from './computeDedupHash';

/**
 * Deduplique un lot d'elements dans le meme run (avant analyse IA et avant
 * insertion en base), en conservant le premier element rencontre par
 * empreinte de dedup.
 */
export function deduplicateBatch<T extends DedupIdentity>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const hash = computeDedupHash(item);
    if (seen.has(hash)) continue;
    seen.add(hash);
    result.push(item);
  }

  return result;
}
