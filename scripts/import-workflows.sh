#!/usr/bin/env bash
# Importe tous les workflows versionnes dans /workflows vers l'instance n8n
# du docker-compose local. A executer apres 'docker compose up -d n8n'.
set -euo pipefail
cd "$(dirname "$0")/.."

for file in workflows/*.json; do
  name=$(basename "$file")
  echo "Import de ${name}..."
  docker compose exec -T n8n n8n import:workflow --input="/home/node/.n8n/workflows/${name}"
done

echo "Import termine. Ouvrez http://localhost:5678 pour activer les workflows et configurer la credential 'Laguisoft API Key'."
