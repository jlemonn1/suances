#!/bin/bash
set -e

echo "🚀 Arrancando infraestructura..."
docker compose -f docker-compose-infra.yml up -d

echo "⏳ Esperando a PostgreSQL..."
sleep 10

echo "📦 Arrancando microservicios..."
docker compose -f backend/rest-carta-service/docker-compose.yml up -d
docker compose -f backend/rest-personal-service/docker-compose.yml up -d
docker compose -f backend/rest-media-service/docker-compose.yml up -d

echo ""
echo "✅ Todo arrancado!"
echo ""
echo "📊 Estado de contenedores:"
docker compose -f docker-compose-infra.yml ps
docker compose -f backend/rest-carta-service/docker-compose.yml ps
docker compose -f backend/rest-personal-service/docker-compose.yml ps
docker compose -f backend/rest-media-service/docker-compose.yml ps
