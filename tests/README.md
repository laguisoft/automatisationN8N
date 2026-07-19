# tests

Suites de tests automatises :

- `unit/` : tests unitaires isoles (services, utils, logique metier pure),
  sans dependance a une base de donnees ou un reseau reel.
- `integration/` : tests verifiant l'interaction entre plusieurs composants
  (ex : service + PostgreSQL, service + Redis).
- `e2e/` : tests de bout en bout simulant un scenario complet (API,
  workflows n8n inclus).
