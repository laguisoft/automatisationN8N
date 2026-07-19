# Guide des APIs

## Principe general

Seules des API officielles et autorisees sont utilisees pour la recherche.
Aucun scraping de pages de resultats de moteurs de recherche (SERP
scraping) n'est effectue : `src/services/search/*` appelle exclusivement
des endpoints d'API documentes. L'extraction de pages d'entreprises
(`src/services/extraction`) se limite a des pages web publiques, respecte
`robots.txt` (`EXTRACTION_RESPECT_ROBOTS_TXT=true`) et envoie un User-Agent
identifiable (`EXTRACTION_USER_AGENT`).

## Moteurs de recherche

| Moteur | Obtention de la cle | Documentation |
| --- | --- | --- |
| Google Custom Search | Console Google Cloud > activer "Custom Search API" + creer un moteur sur programmablesearchengine.google.com | https://developers.google.com/custom-search/v1/overview |
| Bing Web Search | Azure Portal > ressource "Bing Search v7" | https://learn.microsoft.com/azure/cognitive-services/bing-web-search/ |
| Brave Search | https://brave.com/search/api/ | https://api.search.brave.com/app/documentation |
| Tavily | https://tavily.com (cle API sur le dashboard) | https://docs.tavily.com |
| DuckDuckGo | Aucune cle : API publique "Instant Answer" | https://duckduckgo.com/api — couverture limitee (pas un SERP complet), utilisee en complement uniquement |

Chaque connecteur verifie sa propre variable `*_ENABLED` : desactivez ceux
que vous n'utilisez pas plutot que de laisser une cle vide (`enabled`
renvoie `false` si la cle manque, mais le mettre explicitement a `false`
evite toute ambiguite).

Respectez les quotas contractuels de chaque fournisseur.
`SEARCH_MAX_REQUESTS_PER_MINUTE` limite le debit sortant cote application ;
`api_usage` (table PostgreSQL) journalise l'usage quotidien par fournisseur
pour audit.

## Claude (Anthropic)

Cle sur https://console.anthropic.com. Utilisee pour :

1. `prompts/lead-analysis.md` : extraction structuree + detail du score.
2. `prompts/message-generation.md` : redaction du message commercial.

Le modele est configurable (`CLAUDE_MODEL`), par defaut `claude-sonnet-5`.

## Email (SMTP)

Tout fournisseur SMTP standard convient (ex. un compte professionnel avec
mot de passe d'application). Renseignez `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.

## WhatsApp Business Cloud API

1. Creer une app Meta for Developers, ajouter le produit "WhatsApp".
2. Verifier un numero d'expediteur (WhatsApp Business).
3. Recuperer `WHATSAPP_BUSINESS_PHONE_ID` et un token permanent
   `WHATSAPP_BUSINESS_TOKEN` (via un System User, pas un token utilisateur
   temporaire).
4. Pour tout premier contact hors fenetre de 24h, Meta impose l'usage d'un
   **modele de message pre-approuve** — un message texte libre sera
   rejete. Adaptez `src/services/messaging/whatsappSender.ts` en consequence
   si vous ciblez le premier contact plutot qu'une conversation deja
   ouverte.
5. `WHATSAPP_REQUIRE_OPT_IN=true` (defaut) impose une confirmation de
   consentement explicite a chaque envoi depuis le dashboard
   (`whatsappConsentConfirmed: true` dans la requete) — ne desactivez ce
   garde-fou qu'en connaissance de cause des politiques de la plateforme.

## Formulaires de contact et reseaux sociaux

Le projet n'automatise pas la soumission de formulaires de contact (chaque
site a une structure differente et l'automatiser de maniere generique
s'apparenterait a du spam) ni l'envoi de messages sur Facebook/LinkedIn
(hors API officielle et consentement). `src/services/messaging/
contactFormSubmitter.ts` journalise l'intention pour traitement manuel.
