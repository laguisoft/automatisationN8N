# Securite et protection des donnees

## Sources de donnees

Seules des informations publiquement accessibles sont collectees (pages
web publiques, resultats de moteurs de recherche officiels). Aucune donnee
n'est achetee ou obtenue par des moyens non autorises.

## Limitation du volume de requetes

- `SEARCH_MAX_REQUESTS_PER_MINUTE` et `EXTRACTION_MAX_REQUESTS_PER_MINUTE`
  limitent le debit sortant (`src/utils/rateLimiter.ts`).
- `PIPELINE_MAX_QUERIES_PER_RUN` et `PIPELINE_MAX_RESULTS_PER_QUERY`
  bornent le volume par execution.
- La table `api_usage` journalise l'usage quotidien par fournisseur pour
  detecter une derive avant d'atteindre un quota contractuel.

## robots.txt

`EXTRACTION_RESPECT_ROBOTS_TXT=true` (par defaut) fait consulter et
respecter `robots.txt` avant toute recuperation d'une page
(`src/utils/robotsTxt.ts`). Un User-Agent identifiable
(`EXTRACTION_USER_AGENT`) est envoye sur chaque requete, permettant a un
site de nous identifier et de nous bloquer explicitement si necessaire.

## Deduplication

Chaque prospect est identifie par une empreinte stable (site web, sinon
telephone, sinon nom+ville normalises — `src/services/dedup/
computeDedupHash.ts`), unique en base (`prospects.dedup_hash`). Un meme
etablissement retrouve lors de runs successifs n'est jamais duplique.

## Validation humaine avant tout envoi

`PIPELINE_REQUIRE_HUMAN_VALIDATION=true` (par defaut) : aucun message ne
peut etre envoye (`src/services/messaging/messageDispatcher.ts`) tant que
le prospect n'a pas ete explicitement valide dans le dashboard. Ce garde-fou
est verifie cote serveur, pas seulement dans l'interface.

## Consentement (WhatsApp)

`WHATSAPP_REQUIRE_OPT_IN=true` (par defaut) : chaque envoi WhatsApp doit
inclure une confirmation explicite de consentement
(`whatsappConsentConfirmed: true`), demandee a l'operateur humain dans le
dashboard avant chaque envoi (pas une case cochee une fois pour toutes).

## Donnees personnelles

Les champs collectes (nom d'entreprise, ville, secteur, telephone, email,
site web, page Facebook/LinkedIn professionnelle) concernent des entites
professionnelles dans un cadre de prospection B2B. Recommandations :

- Ne pas etendre la collecte a des donnees personnelles sensibles.
- Mettre en place une procedure de suppression sur demande (un prospect
  qui demande a ne plus etre contacte doit pouvoir etre marque `rejected`
  et exclu des futurs runs — actuellement, marquer `rejected` empeche
  l'envoi mais ne bloque pas explicitement la re-decouverte lors d'un run
  futur si l'entreprise republie du contenu ; ajouter une liste
  d'exclusion perenne si necessaire pour votre juridiction).
- Restreindre l'acces au dashboard/API (`DASHBOARD_API_KEY`) aux personnes
  autorisees et la faire tourner (rotation) periodiquement.
- Chiffrer les sauvegardes de la base PostgreSQL si elles quittent
  l'environnement de production.

## Reprise apres erreur

Voir `docs/workflows-guide.md#reprise-apres-erreur` : les echecs sont
isoles par resultat, journalises, et n'empechent pas le run de se
terminer proprement ni le suivant de s'executer.
