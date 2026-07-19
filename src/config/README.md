# src/config

Chargement et validation centralisee de la configuration de l'application
(variables d'environnement, connexions PostgreSQL/Redis, parametres n8n,
constantes globales). Aucun autre dossier ne doit lire `process.env`
directement : tout passe par ce module.
