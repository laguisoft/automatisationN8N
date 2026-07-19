# Laguisoft Lead Finder

Plateforme de prospection B2B pour **Laguisoft Technologie** (Kankan, Haute
Guinee) : identifie des entreprises susceptibles d'avoir besoin d'une
application de gestion (ERP, gestion commerciale, stock, facturation,
comptabilite, POS, gestion scolaire ou hospitaliere), les analyse et les
score avec **Claude**, et permet une **validation humaine** avant tout
envoi de message commercial.

n8n orchestre la planification et les notifications ; toute la logique
metier (recherche, extraction, analyse, scoring, base de donnees, envoi)
vit dans une application **Node.js / TypeScript** testable et versionnee.

## Stack technique

| Composant | Role |
| --- | --- |
| Node.js / TypeScript | API, pipeline de prospection, dashboard |
| n8n | Planification (cron) et orchestration de haut niveau |
| Claude (Anthropic) | Analyse des prospects, scoring assiste, redaction des messages |
| PostgreSQL | Prospects, runs, journaux d'execution, messages envoyes |
| Redis | Reserve pour cache / limitation de debit distribuee |
| Docker Compose | Orchestration locale de l'ensemble des services |
| Google CSE, Bing, Brave, Tavily, DuckDuckGo | Recherche multi-moteurs (API officielles uniquement) |

## Pipeline

```
Cron (n8n) -> Recherche -> Extraction -> Nettoyage -> Deduplication
  -> Analyse Claude -> Scoring -> Coordonnees -> Base de donnees
  -> [ Validation humaine (dashboard) ]
  -> Generation du message -> Envoi (email / WhatsApp+consentement / formulaire)
  -> Journalisation
```

Detail complet : [`docs/workflows-guide.md`](docs/workflows-guide.md).

## Demarrage rapide

```bash
./scripts/setup.sh          # copie .env, installe les deps, DB + migrations
# -> renseigner DASHBOARD_API_KEY, ANTHROPIC_API_KEY et au moins un moteur
#    de recherche dans .env (voir docs/environment-variables.md)
docker compose up -d
./scripts/import-workflows.sh
npm run seed                 # optionnel : 3 prospects d'exemple pour tester le dashboard
```

- Dashboard : http://localhost:3000
- API : http://localhost:3000/api (en-tete `x-api-key` requis)
- n8n : http://localhost:5678

Guide detaille : [`docs/installation.md`](docs/installation.md).

## Arborescence du projet

```
.
├── src/
│   ├── config/                 # Variables d'environnement (zod) + config/*.json
│   ├── middleware/              # Auth API (x-api-key)
│   ├── modules/
│   │   ├── prospecting/         # Orchestration du pipeline, route /api/prospecting/run
│   │   ├── dashboard/           # Routes REST + frontend statique (public/)
│   │   └── logs/                # Routes de consultation des runs/journaux
│   ├── services/
│   │   ├── search/              # Google/Bing/Brave/Tavily/DuckDuckGo + aggregateur
│   │   ├── extraction/          # Recuperation de pages publiques (robots.txt, rate limit)
│   │   ├── cleaning/            # Normalisation texte/telephone/email/site/nom
│   │   ├── dedup/                # Empreinte et deduplication
│   │   ├── claude/               # Client Anthropic, prompts, analyse, message
│   │   ├── scoring/              # Calcul du score (config/scoring-weights.json)
│   │   ├── contacts/             # Reconciliation des coordonnees
│   │   ├── messaging/            # Email, WhatsApp Business, formulaire, dispatcher
│   │   └── export/               # CSV, Excel, PDF
│   ├── database/                 # Pool pg, migrations, repositories
│   ├── utils/                    # logger, http, retry, rate limiter, robots.txt, concurrency
│   ├── types/                    # Types partages
│   ├── server.ts / index.ts      # Assemblage Express + bootstrap
├── config/                       # Config metier versionnee (scoring, secteurs, requetes, profil entreprise)
├── prompts/                       # Prompts Claude (analyse, generation de message)
├── workflows/                     # Workflows n8n exportes (.json)
├── scripts/                       # setup.sh, import-workflows.sh, seed.ts
├── docs/                          # Guides (installation, Docker, n8n, APIs, securite...)
├── tests/                         # unit/, integration/, e2e/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

Role detaille de chaque dossier : README.md dans chaque repertoire
(`src/config/README.md`, `src/services/README.md`, `config/README.md`,
`prompts/README.md`, `workflows/README.md`, `scripts/README.md`,
`docs/README.md`, `tests/README.md`).

## Garde-fous integres

- **Validation humaine obligatoire** avant tout envoi
  (`PIPELINE_REQUIRE_HUMAN_VALIDATION=true`, verifie cote serveur).
- **Consentement explicite** requis a chaque envoi WhatsApp
  (`WHATSAPP_REQUIRE_OPT_IN=true`).
- **robots.txt respecte** lors de l'extraction (`EXTRACTION_RESPECT_ROBOTS_TXT=true`).
- **Limitation de debit** configurable par moteur de recherche et pour
  l'extraction (`SEARCH_MAX_REQUESTS_PER_MINUTE`,
  `EXTRACTION_MAX_REQUESTS_PER_MINUTE`).
- **Deduplication** systematique (empreinte site/telephone/nom+ville).
- **Aucun scraping de SERP** : uniquement des API de recherche officielles.

Detail : [`docs/data-privacy.md`](docs/data-privacy.md).

## Scripts npm

| Commande | Description |
| --- | --- |
| `npm run dev` | API en mode developpement (ts-node-dev) |
| `npm run build` | Compile TypeScript + copie les assets du dashboard vers `dist/` |
| `npm start` | Demarre l'application compilee |
| `npm run migrate` | Applique les migrations PostgreSQL |
| `npm run seed` | Insere des prospects d'exemple |
| `npm run lint` / `lint:fix` | Verifie/corrige le style avec ESLint |
| `npm test` / `test:unit` / `test:integration` | Tests (voir `tests/README.md`) |
| `npm run typecheck` | Verifie le typage sans compiler |

## Documentation

- [`docs/installation.md`](docs/installation.md)
- [`docs/docker-guide.md`](docs/docker-guide.md)
- [`docs/n8n-guide.md`](docs/n8n-guide.md)
- [`docs/environment-variables.md`](docs/environment-variables.md)
- [`docs/apis-guide.md`](docs/apis-guide.md)
- [`docs/workflows-guide.md`](docs/workflows-guide.md)
- [`docs/maintenance.md`](docs/maintenance.md)
- [`docs/data-privacy.md`](docs/data-privacy.md)
