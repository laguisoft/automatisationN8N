# Guide d'installation

## Prerequis

- Docker et Docker Compose v2
- Node.js >= 20 (pour le developpement local hors conteneur, et pour les
  scripts `npm run migrate` / `npm run seed`)

## Installation rapide

```bash
git clone <votre-fork>
cd automatisationN8N
./scripts/setup.sh
```

Le script `setup.sh` copie `.env.example` vers `.env`, installe les
dependances, demarre PostgreSQL et Redis, puis applique les migrations.

Ensuite, ouvrez `.env` et renseignez au minimum :

- `DASHBOARD_API_KEY` (valeur forte, ex. `openssl rand -hex 32`)
- `ANTHROPIC_API_KEY` (obligatoire : Claude analyse chaque prospect et
  redige les messages)
- Au moins un moteur de recherche (`GOOGLE_CSE_*`, `BRAVE_SEARCH_*`,
  `BING_SEARCH_*` ou `TAVILY_*`) — voir `docs/apis-guide.md`

## Demarrage de la stack complete

```bash
docker compose up -d
./scripts/import-workflows.sh
```

- Dashboard : http://localhost:3000
- API : http://localhost:3000/api (necessite l'en-tete `x-api-key`)
- n8n : http://localhost:5678

Dans n8n, creez la credential **Header Auth** nommee `Laguisoft API Key`
(nom d'en-tete `x-api-key`, valeur = `DASHBOARD_API_KEY`), puis activez les
deux workflows importes.

## Verifier l'installation

```bash
curl http://localhost:3000/health
npm run seed   # insere 3 prospects d'exemple pour tester le dashboard
```

Ouvrez ensuite http://localhost:3000, renseignez la cle API dans le champ en
haut a droite, et vous devriez voir les 3 prospects d'exemple.

Voir aussi : `docs/docker-guide.md`, `docs/n8n-guide.md`,
`docs/environment-variables.md`, `docs/apis-guide.md`.
