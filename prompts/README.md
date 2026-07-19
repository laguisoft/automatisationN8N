# prompts

Bibliotheque des prompts utilises par les composants IA du projet, sous
forme de fichiers Markdown independants du code (modifiables sans
redeploiement, chargement par `src/services/claude/promptLoader.ts`).

- `lead-analysis.md` : analyse d'un contenu web extrait, extraction
  structuree des informations de l'entreprise et calcul du detail de score
  (`scoreBreakdown`) selon le bareme de `config/scoring-weights.json`.
- `message-generation.md` : redaction du message commercial personnalise
  pour un prospect deja valide manuellement.

Placeholders `{{NOM_VARIABLE}}` remplaces au moment de l'appel : voir l'en-tete
de chaque fichier pour la liste exacte.
