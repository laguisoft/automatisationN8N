# docker/postgres-init

Scripts SQL/shell executes automatiquement par l'image officielle PostgreSQL
au premier demarrage du conteneur (extensions, roles, schema initial). Voir
le montage dans `docker-compose.yml` (`/docker-entrypoint-initdb.d`).
