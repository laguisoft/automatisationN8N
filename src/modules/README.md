# src/modules

Modules metier de l'application, organises par domaine fonctionnel (ex :
`leads/`, `enrichment/`, `scoring/`, `export/`). Chaque module regroupe ses
propres controleurs/handlers, routes et logique specifique, et s'appuie sur
les services partages du dossier `src/services`.
