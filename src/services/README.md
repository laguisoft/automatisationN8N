# src/services

Services transverses reutilisables par plusieurs modules : acces base de
donnees, cache Redis, appels aux API externes (sources de leads, IA,
enrichissement), integration avec n8n (declenchement/ecoute de workflows).
Ne contiennent pas de logique HTTP, uniquement de la logique metier/technique
reutilisable.
