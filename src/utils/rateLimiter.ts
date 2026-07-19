/**
 * Limiteur de debit en memoire (token bucket simplifie) par cle (ex: par
 * moteur de recherche ou par domaine). Suffisant pour un seul processus
 * applicatif ; en cas de scaling horizontal, remplacer par une implementation
 * Redis (le client Redis est deja disponible dans le projet).
 */
export class RateLimiter {
  private readonly timestamps = new Map<string, number[]>();

  constructor(private readonly maxRequests: number, private readonly windowMs: number) {}

  /** Attend, si necessaire, jusqu'a ce qu'une requete puisse etre effectuee pour `key`. */
  async acquire(key: string): Promise<void> {
    for (;;) {
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const history = (this.timestamps.get(key) ?? []).filter((t) => t > windowStart);

      if (history.length < this.maxRequests) {
        history.push(now);
        this.timestamps.set(key, history);
        return;
      }

      const oldest = history[0];
      const waitMs = oldest + this.windowMs - now + 10;
      await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 10)));
    }
  }
}
