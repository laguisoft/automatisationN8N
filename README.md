# Laguisoft Lead Finder

Plateforme professionnelle d'automatisation de recherche, d'enrichissement et
de qualification de leads, combinant une application **Node.js / TypeScript**
et des workflows **n8n**, avec **PostgreSQL** pour la persistance et
**Redis** pour le cache/les files d'attente.

> Etat actuel : architecture du projet uniquement. Aucun code metier n'a
> encore ete implemente (voir section "Prochaines etapes").

## Stack technique

| Composant   | Role                                                              |
| ----------- | ------------------------------------------------------------------ |
| Node.js/TS  | Application backend (API, orchestration, logique metier)          |
| n8n         | Moteur de workflows d'automatisation (recherche, enrichissement, notifications) |
| PostgreSQL  | Base de donnees relationnelle (leads, entreprises, campagnes...)   |
| Redis       | Cache, files d'attente, gestion de session/rate-limit             |
| Docker      | Conteneurisation et orchestration locale via `docker-compose`     |

## Arborescence du projet

```
.
├── src/                    # Code source de l'application Node.js/TypeScript
│   ├── config/             # Chargement centralise de la configuration (.env, connexions)
│   ├── modules/            # Modules metier par domaine fonctionnel
│   ├── services/           # Services transverses (DB, cache, API externes, n8n)
│   ├── database/           # Client DB, migrations et seeds PostgreSQL
│   │   ├── migrations/
│   │   └── seeds/
│   ├── utils/              # Fonctions utilitaires generiques
│   ├── types/              # Types et interfaces TypeScript partages
│   └── index.ts            # Point d'entree de l'application
├── prompts/                # Prompts IA versionnes (recherche, scoring, redaction...)
├── workflows/               # Exports JSON des workflows n8n, versionnes
├── scripts/                 # Scripts operationnels (init DB, seed, maintenance)
├── docs/                    # Documentation technique et fonctionnelle
├── tests/                   # Tests automatises
│   ├── unit/                # Tests unitaires
│   ├── integration/         # Tests d'integration (DB, Redis...)
│   └── e2e/                  # Tests de bout en bout
├── docker/
│   └── postgres-init/       # Scripts d'initialisation PostgreSQL (extensions, roles...)
├── docker-compose.yml       # Orchestration des services (app, postgres, redis, n8n)
├── Dockerfile                # Image de l'application Node.js/TypeScript
├── package.json
├── tsconfig.json
├── .env.example              # Modele des variables d'environnement
└── README.md
```

## Role detaille de chaque dossier

- **`src/config`** : point unique de lecture des variables d'environnement
  et de construction des objets de configuration (DB, Redis, n8n). Aucun
  autre dossier ne doit acceder directement a `process.env`.
- **`src/modules`** : logique metier organisee par domaine (ex : leads,
  enrichissement, scoring, export). Chaque module est autonome et s'appuie
  sur les services partages.
- **`src/services`** : services reutilisables entre modules (acces
  PostgreSQL/Redis, appels API externes, integration avec n8n).
- **`src/database`** : connexion a PostgreSQL, migrations de schema
  (`migrations/`) et donnees d'amorcage (`seeds/`).
- **`src/utils`** : helpers generiques sans dependance metier (logger,
  formatage, validation).
- **`src/types`** : contrats de donnees TypeScript partages dans tout le
  projet.
- **`prompts`** : bibliotheque versionnee des prompts utilises par les
  fonctionnalites IA (recherche/qualification de leads, enrichissement,
  redaction de messages), independante du code applicatif.
- **`workflows`** : exports JSON des workflows n8n, versionnes avec le code
  pour assurer la tracabilite et la reproductibilite des automatisations.
- **`scripts`** : scripts operationnels hors cycle de vie applicatif
  (initialisation, maintenance, import/export).
- **`docs`** : documentation technique (architecture, schema de donnees,
  ADR) et fonctionnelle du projet.
- **`tests`** : tests unitaires, d'integration et de bout en bout, separes
  par niveau de granularite.
- **`docker`** : ressources d'initialisation des conteneurs (ex : scripts
  SQL executes au demarrage de PostgreSQL).

## Demarrage rapide

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env

# 2. Installer les dependances
npm install

# 3. Lancer l'infrastructure (PostgreSQL, Redis, n8n, app)
docker compose up -d

# 4. Acceder aux services
# - n8n       : http://localhost:5678
# - App       : http://localhost:3000
# - PostgreSQL: localhost:5432
# - Redis     : localhost:6379
```

## Scripts npm disponibles

| Commande               | Description                                  |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Lance l'application en mode developpement    |
| `npm run build`         | Compile le TypeScript vers `dist/`           |
| `npm start`             | Demarre l'application compilee               |
| `npm run lint`          | Verifie le style de code avec ESLint         |
| `npm run test`          | Execute l'ensemble des tests                 |
| `npm run test:unit`     | Execute uniquement les tests unitaires       |
| `npm run test:integration` | Execute uniquement les tests d'integration |
| `npm run typecheck`     | Verifie le typage sans compiler              |

## Prochaines etapes

Cette phase a mis en place l'architecture complete du projet (dossiers,
configuration Docker, outillage TypeScript). Le developpement du code metier
(modules `leads`, `enrichment`, `scoring`, schema de base de donnees,
workflows n8n, prompts IA) demarrera apres validation de cette architecture.
