# src/database

Acces aux donnees PostgreSQL.

- `pool.ts` : pool de connexion partage (`pg`).
- `migrate.ts` + `migrations/` : migrations SQL versionnees, appliquees via
  `npm run migrate`.
- `repositories/` : une classe par agregat (`prospectRepository`,
  `pipelineRunRepository`, `logRepository`, `messageLogRepository`,
  `apiUsageRepository`), seul point d'acces SQL utilise par
  `src/services` et `src/modules`.
