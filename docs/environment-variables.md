# Guide des variables d'environnement

Toutes les variables sont documentees et valeurs par defaut dans
`.env.example`, et validees au demarrage par `src/config/env.ts` (zod) : une
variable requise manquante ou invalide empeche le demarrage avec un message
explicite.

| Variable | Requise | Role |
| --- | --- | --- |
| `DASHBOARD_API_KEY` | oui | Cle partagee dashboard / API / n8n (en-tete `x-api-key`) |
| `DATABASE_URL` | oui | Connexion PostgreSQL |
| `REDIS_URL` | oui | Connexion Redis |
| `ANTHROPIC_API_KEY` | oui | Cle API Claude (analyse + generation de messages) |
| `CLAUDE_MODEL` | non | Modele Claude utilise (defaut `claude-sonnet-5`) |
| `GOOGLE_CSE_ENABLED` / `_API_KEY` / `_ENGINE_ID` | non | Google Programmable Search Engine |
| `BING_SEARCH_ENABLED` / `_API_KEY` | non | Bing Web Search (Azure) |
| `BRAVE_SEARCH_ENABLED` / `_API_KEY` | non | Brave Search API |
| `TAVILY_ENABLED` / `_API_KEY` | non | Tavily Search API |
| `DUCKDUCKGO_ENABLED` | non | API publique Instant Answer (sans cle, couverture limitee) |
| `SEARCH_MAX_REQUESTS_PER_MINUTE` | non | Limite de debit globale par moteur de recherche |
| `EXTRACTION_MAX_REQUESTS_PER_MINUTE` | non | Limite de debit pour la recuperation de pages |
| `EXTRACTION_RESPECT_ROBOTS_TXT` | non | Doit rester `true` en production |
| `EXTRACTION_USER_AGENT` | non | User-Agent identifiable envoye lors de l'extraction |
| `SMTP_ENABLED` / `SMTP_*` | non | Envoi d'email |
| `WHATSAPP_ENABLED` / `WHATSAPP_*` | non | Envoi via WhatsApp Business Cloud API |
| `WHATSAPP_REQUIRE_OPT_IN` | non | Doit rester `true` : bloque l'envoi sans consentement confirme |
| `PIPELINE_REQUIRE_HUMAN_VALIDATION` | non | Doit rester `true` : bloque l'envoi sans validation manuelle |
| `PIPELINE_MAX_QUERIES_PER_RUN` / `PIPELINE_MAX_RESULTS_PER_QUERY` | non | Bornes de volume par run |

Au moins un moteur de recherche `*_ENABLED=true` avec ses cles doit etre
configure pour que le pipeline trouve des resultats (`GET /health` demarre
sans, mais `POST /api/prospecting/run` journalisera un avertissement et ne
trouvera rien).
