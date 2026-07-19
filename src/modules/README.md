# src/modules

Modules metier exposant des routes Express, organises par domaine
fonctionnel. Chaque module s'appuie sur les services partages de
`src/services` et les repositories de `src/database/repositories`.

- `prospecting/` : construction des requetes de recherche
  (`queryBuilder.ts`), orchestration du pipeline complet
  (`pipeline.ts`) et route `POST /api/prospecting/run` declenchee par n8n.
- `dashboard/` : routes REST de gestion des prospects (liste/filtre,
  validation, refus, generation de message, envoi, exports CSV/Excel/PDF)
  et frontend statique (`public/`).
- `logs/` : routes de consultation des runs et des journaux d'execution.
