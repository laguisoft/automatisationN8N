# scripts

Scripts operationnels (bash/TypeScript) pour les taches ponctuelles ou
recurrentes hors cycle de vie applicatif normal.

- `setup.sh` : premiere installation locale (copie `.env`, installe les
  dependances, demarre PostgreSQL/Redis, applique les migrations).
- `import-workflows.sh` : importe les workflows versionnes de `/workflows`
  dans l'instance n8n locale.
- `seed.ts` (`npm run seed`) : insere des prospects d'exemple pour tester
  le dashboard sans avoir configure les cles API de recherche/IA.

Les migrations elles-memes vivent dans `src/database/migrations` et sont
appliquees via `npm run migrate` (voir `src/database/migrate.ts`).
