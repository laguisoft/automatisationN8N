# src/services

Services transverses reutilisables, organises par domaine technique. Ne
contiennent pas de logique HTTP (pas de `req`/`res`) : uniquement de la
logique metier/technique appelee par `src/modules`.

- `search/` : connecteurs Google Custom Search, Bing, Brave, Tavily,
  DuckDuckGo et `searchAggregator.ts` qui les execute en parallele et
  fusionne/deduplique les resultats par URL.
- `extraction/` : recuperation et parsing des pages publiques (respect de
  robots.txt et de la limite de debit, extraction telephone/email/Facebook/
  LinkedIn).
- `cleaning/` : normalisation de texte, telephone, email, site web et nom
  d'entreprise.
- `dedup/` : calcul d'empreinte de deduplication et deduplication d'un lot.
- `claude/` : client Anthropic, chargement des prompts (`/prompts`),
  analyse d'un prospect et generation du message commercial.
- `scoring/` : calcul du score final (0-100) a partir de
  `config/scoring-weights.json`.
- `contacts/` : reconciliation des coordonnees extraites automatiquement et
  de celles identifiees par Claude.
- `messaging/` : envoi des messages (email, WhatsApp Business, formulaire de
  contact) et repartition (`messageDispatcher.ts`), avec verification
  obligatoire de la validation humaine et du consentement.
- `export/` : generation des exports CSV, Excel (.xlsx) et PDF.
