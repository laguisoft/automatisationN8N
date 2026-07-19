# config

Configuration metier non sensible, versionnee avec le code (a l'inverse des
secrets, qui vivent uniquement dans `.env`, jamais ici).

- `scoring-weights.json` : ponderation des criteres de scoring (0-100).
- `sectors.json` : secteurs cibles et mots-cles de detection des besoins.
- `search-queries.json` : zones geographiques prioritaires et gabarits de
  requetes de recherche.
- `company-profile.json` : profil de Laguisoft Technologie utilise dans le
  prompt de generation de message commercial.

Ces fichiers sont charges au demarrage par `src/config/index.ts` et peuvent
etre ajustes par un non-developpeur sans toucher au code TypeScript.
