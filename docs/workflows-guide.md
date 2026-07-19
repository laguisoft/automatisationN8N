# Guide des workflows (pipeline de prospection)

## Vue d'ensemble

```
Cron (n8n)
  -> POST /api/prospecting/run
       -> Recherche (Google/Bing/Brave/Tavily/DuckDuckGo, selon activation)
       -> Extraction (page publique, robots.txt, rate limit)
       -> Nettoyage (texte, telephone, email, site web)
       -> Deduplication (empreinte site/telephone/nom+ville, en base et dans le run)
       -> Analyse Claude (prompts/lead-analysis.md)
       -> Scoring (config/scoring-weights.json)
       -> Coordonnees (reconciliation extraction + analyse IA)
       -> Base de donnees (statut "pending_validation")
  <- resumé du run (prospectsFound, prospectsNew, errorsCount, runId)

Dashboard (humain)
  -> Valider / Refuser un prospect
  -> Generer le message (Claude, prompts/message-generation.md)
       [ou automatique via le workflow n8n 02-message-generation.json ]
  -> Envoyer (email / WhatsApp avec confirmation de consentement / formulaire)
  -> Journalisation (messages_log, execution_logs)
```

## Ou vit chaque etape dans le code

| Etape | Fichier |
| --- | --- |
| Recherche | `src/services/search/*`, `src/services/search/searchAggregator.ts` |
| Extraction | `src/services/extraction/extractCompanyInfo.ts` |
| Nettoyage | `src/services/cleaning/*` |
| Deduplication | `src/services/dedup/*` |
| Analyse Claude | `src/services/claude/analyzeProspect.ts` |
| Scoring | `src/services/scoring/scoreProspect.ts` |
| Coordonnees | `src/services/contacts/reconcileContactInfo.ts` |
| Orchestration complete | `src/modules/prospecting/pipeline.ts` |
| Validation / envoi | `src/modules/dashboard/routes.ts`, `src/services/messaging/*` |
| Journalisation | `src/database/repositories/logRepository.ts`, `pipelineRunRepository.ts`, `messageLogRepository.ts` |

## Modifier le comportement sans toucher au code

- Ponderation du score : `config/scoring-weights.json`
- Secteurs cibles et mots-cles de detection : `config/sectors.json`
- Zones geographiques et gabarits de requetes : `config/search-queries.json`
- Profil de l'entreprise (utilise dans le message commercial) :
  `config/company-profile.json`
- Texte des prompts IA : `prompts/lead-analysis.md`,
  `prompts/message-generation.md`

## Reprise apres erreur

Chaque resultat de recherche est traite independamment
(`mapWithConcurrency`, `src/utils/concurrency.ts`) : l'echec d'une page
(extraction, analyse Claude) est journalise (`execution_logs`, niveau
`error`) et incremente `errorsCount` sans interrompre le reste du run. Le
run se termine avec le statut `success`, `partial` (des erreurs mais aussi
des prospects) ou `failed`. Un nouveau run planifie repartira normalement ;
la deduplication empeche la recreation des prospects deja en base.
