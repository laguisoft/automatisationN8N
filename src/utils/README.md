# src/utils

Fonctions utilitaires generiques, sans dependance vers `modules/` ou
`services/` :

- `logger.ts` : logger structure (pino).
- `httpClient.ts` : client HTTP partage (axios), avec User-Agent identifiable.
- `retry.ts` : backoff exponentiel pour les appels externes.
- `rateLimiter.ts` : limiteur de debit en memoire par cle (moteur, domaine).
- `robotsTxt.ts` : verification de robots.txt avant extraction d'une page.
- `concurrency.ts` : execution d'une liste avec un nombre limite d'appels concurrents.
