#!/bin/bash
set -e

echo "🛑 Deteniendo contenedores..."
docker compose -f backend/rest-carta-service/docker-compose.yml down
docker compose -f backend/rest-personal-service/docker-compose.yml down
docker compose -f backend/rest-media-service/docker-compose.yml down
docker compose -f backend/rest-sala-service/docker-compose.yml down
docker compose -f backend/rest-caja-service/docker-compose.yml down

echo "🔨 Reconstruyendo imágenes..."
docker compose -f backend/rest-carta-service/docker-compose.yml build --no-cache
docker compose -f backend/rest-personal-service/docker-compose.yml build --no-cache
docker compose -f backend/rest-media-service/docker-compose.yml build --no-cache
docker compose -f backend/rest-sala-service/docker-compose.yml build --no-cache
docker compose -f backend/rest-caja-service/docker-compose.yml build --no-cache

echo "🚀 Arrancando servicios..."
docker compose -f backend/rest-carta-service/docker-compose.yml up -d
docker compose -f backend/rest-personal-service/docker-compose.yml up -d
docker compose -f backend/rest-media-service/docker-compose.yml up -d
docker compose -f backend/rest-sala-service/docker-compose.yml up -d
docker compose -f backend/rest-caja-service/docker-compose.yml up -d

echo ""
echo "✅ Reconstrucción completada!"
echo ""
echo "📊 Estado de contenedores:"
docker compose -f backend/rest-carta-service/docker-compose.yml ps
docker compose -f backend/rest-personal-service/docker-compose.yml ps
docker compose -f backend/rest-media-service/docker-compose.yml ps
docker compose -f backend/rest-sala-service/docker-compose.yml ps
docker compose -f backend/rest-caja-service/docker-compose.yml ps
