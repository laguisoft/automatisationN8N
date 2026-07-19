#!/usr/bin/env bash
# Prepare l'environnement local : copie .env, installe les dependances,
# demarre PostgreSQL/Redis et applique les migrations.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Fichier .env cree a partir de .env.example. Renseignez vos cles API avant de continuer."
fi

echo "Installation des dependances Node.js..."
npm install

echo "Demarrage de PostgreSQL et Redis..."
docker compose up -d postgres redis

echo "Attente de la disponibilite de PostgreSQL..."
until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-llf_user}" >/dev/null 2>&1; do
  sleep 1
done

echo "Application des migrations..."
npm run migrate

echo "Termine. Lancez 'npm run dev' pour l'API, ou 'docker compose up -d' pour la stack complete (n8n inclus)."
