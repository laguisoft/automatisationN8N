# src/middleware

Middlewares Express partages. `auth.ts` verifie l'en-tete `x-api-key` contre
`DASHBOARD_API_KEY` pour toutes les routes `/api/*` (dashboard, pilotage du
pipeline, logs).
