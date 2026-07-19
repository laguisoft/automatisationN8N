# Guide n8n

## Principe d'architecture

n8n orchestre (planification, branchement, notification) mais ne contient
pas la logique metier : la recherche multi-moteurs, l'extraction, le
nettoyage, la deduplication, l'analyse Claude, le scoring et la sauvegarde
en base sont tous executes en une seule fois par l'API TypeScript
(`POST /api/prospecting/run`). Ce choix garde la logique testable
(`tests/unit`) et versionnee comme du code, plutot que dispersee dans des
noeuds Function difficiles a relire et a tester.

## Credential a creer

Dans n8n : **Settings > Credentials > New > Header Auth**

- Nom : `Laguisoft API Key` (les workflows fournis y font reference)
- Nom de l'en-tete : `x-api-key`
- Valeur : la valeur de `DASHBOARD_API_KEY` dans `.env`

## Workflows fournis (`/workflows`)

### `01-lead-discovery-pipeline.json`

Cron quotidien -> `POST /api/prospecting/run` -> branchement selon
`errorsCount` -> preparation d'un message de synthese. Le noeud final
`Notifier equipe commerciale (a configurer)` est un `NoOp` a remplacer par
un noeud Email/Slack/Teams selon les outils internes.

### `02-message-generation.json`

Toutes les 2 heures, recupere les prospects au statut `validated` (valides
manuellement dans le dashboard) et genere leur message commercial via
Claude (`POST /api/prospects/:id/generate-message`). **N'envoie jamais** de
message : l'envoi reste une action manuelle du dashboard, avec confirmation
de consentement pour WhatsApp.

## Importer / exporter les workflows

```bash
./scripts/import-workflows.sh
```

Ou manuellement dans l'interface n8n : **Workflows > Import from File**.
Apres modification dans l'interface, exportez et remplacez le fichier JSON
correspondant dans `/workflows` pour garder l'historique versionne avec le
code (`n8n export:workflow --id=<id> --output=workflows/...`).

## Ajouter un nouveau workflow

1. Construisez-le dans l'interface n8n en local.
2. Exportez-le en JSON dans `/workflows`, avec un prefixe numerique
   (`03-...json`).
3. Documentez son role dans ce fichier.
