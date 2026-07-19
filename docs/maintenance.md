# Guide de maintenance

## Ajouter un moteur de recherche

1. Creer `src/services/search/<nom>Search.ts` implementant l'interface
   `SearchAdapter` (`src/types/search.ts`).
2. L'ajouter au tableau `adapters` de
   `src/services/search/searchAggregator.ts`.
3. Ajouter les variables `<NOM>_ENABLED` / `<NOM>_API_KEY` a
   `src/config/env.ts` et `.env.example`.
4. Documenter dans `docs/apis-guide.md`.

## Ajouter un connecteur d'envoi (nouveau canal)

1. Creer `src/services/messaging/<canal>Sender.ts` retournant
   `{ success: boolean; error?: string }`.
2. L'ajouter au `switch` de `src/services/messaging/messageDispatcher.ts`.
3. Etendre le type `MessageChannel`
   (`src/database/repositories/messageLogRepository.ts`) et la contrainte
   `CHECK` correspondante en base (nouvelle migration
   `src/database/migrations/00X_*.sql`).

## Ajouter un connecteur de formulaire de contact specifique

`src/services/messaging/contactFormSubmitter.ts` journalise par defaut sans
automatiser (structure de formulaire trop variable d'un site a l'autre).
Pour un site cible recurrent, ajouter un cas special avant l'appel
generique, avec un `axios.post` explicite vers l'endpoint du formulaire.

## Ajuster le scoring

Modifier `config/scoring-weights.json` (ponderation par critere) sans
redeploiement : le service `src/services/scoring/scoreProspect.ts` lit ce
fichier a chaque appel de `loadAppConfig()` (mis en cache en memoire au
premier appel du processus — redemarrer l'application apres modification en
production).

## Migrations

```bash
npm run migrate
```

Ajoute un fichier `src/database/migrations/00X_description.sql` (numero
suivant). Les migrations deja appliquees sont suivies dans la table
`schema_migrations` et ne sont jamais rejouees.

## Purge / archivage

Aucune purge automatique n'est fournie par defaut. Pour respecter les
politiques de conservation des donnees (voir `docs/data-privacy.md`),
planifier une tache (script ou requete SQL) supprimant ou anonymisant les
prospects `rejected` ou inactifs depuis plus de N mois.

## Logs applicatifs

Le logger (`src/utils/logger.ts`, pino) ecrit en JSON structure en
production (utilisable par un collecteur de logs standard) et en format
lisible en developpement (`pino-pretty`). Les evenements du pipeline sont
en plus persistes en base (`execution_logs`), consultables via
`GET /api/logs`.
