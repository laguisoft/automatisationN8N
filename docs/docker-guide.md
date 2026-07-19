# Guide Docker

## Services (`docker-compose.yml`)

| Service    | Role                                              | Port hote |
| ---------- | -------------------------------------------------- | --------- |
| `postgres` | Base de donnees (prospects, logs, runs)            | 5432      |
| `redis`    | Cache / limitation de debit distribuee (extension future) | 6379 |
| `n8n`      | Orchestration des workflows (cron, appels API)     | 5678      |
| `app`      | API + dashboard (Node.js/TypeScript)               | 3000      |

Tous les services partagent le reseau `llf_network` et se joignent par leur
nom de service (`postgres`, `redis`, `app`, `n8n`).

## Commandes usuelles

```bash
docker compose up -d              # demarre tout en arriere-plan
docker compose logs -f app        # suit les logs de l'application
docker compose exec postgres psql -U llf_user -d laguisoft_lead_finder
docker compose down                # arrete les conteneurs (conserve les volumes)
docker compose down -v             # arrete et supprime les volumes (perte de donnees)
```

## Build de l'image `app`

Le `Dockerfile` est multi-etapes :

1. `deps` : installe les dependances via `npm ci` (lockfile requis).
2. `build` : compile TypeScript (`dist/`) et copie les assets du dashboard.
3. `runtime` : image finale minimale (`dist/`, `config/`, `prompts/`,
   `node_modules`).

`config/` et `prompts/` sont aussi montes en volume (lecture seule) dans
`docker-compose.yml` : vous pouvez ajuster le bareme de scoring ou les
prompts sans reconstruire l'image.

## Healthchecks

`postgres`, `redis` et `app` exposent un healthcheck. `app` et `n8n`
attendent que `postgres`/`redis` soient `healthy` avant de demarrer
(`depends_on.condition: service_healthy`).
