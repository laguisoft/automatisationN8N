export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

/** Reessaie `fn` avec un backoff exponentiel. */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, baseDelayMs = 500, onRetry } = options;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      onRetry?.(error, attempt + 1);
      const delay = baseDelayMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
