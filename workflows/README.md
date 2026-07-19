# workflows

Exports JSON versionnes des workflows n8n (recherche de leads, enrichissement,
notifications, synchronisation CRM, etc.). Ce dossier est monte dans le
conteneur n8n (voir `docker-compose.yml`) afin de servir de reference
partagee et versionnee en dehors de l'instance n8n elle-meme.

Convention suggeree : un fichier par workflow, nomme
`NN-nom-du-workflow.json`, avec un numero de sequence pour l'ordre logique de
mise en place.
