#!/bin/bash
set -e

echo "============================================"
echo "  DEPLOY - Suances Backend (PRODUCCION)"
echo "============================================"
echo ""

# Verificar que existe .env
if [ ! -f ".env" ]; then
    echo "ERROR: No existe archivo .env"
    echo "Copia .env.example a .env y configura los valores"
    exit 1
fi

# Cargar variables
source .env

VERSION=${VERSION:-latest}
DOCKER_HUB_USER=${DOCKER_HUB_USER:-suances}

echo "Versión: $VERSION"
echo "Docker Hub: $DOCKER_HUB_USER"
echo ""

# Descargar imágenes más recientes
echo ">>> Descargando imágenes de Docker Hub..."
docker compose pull

echo ""
echo ">>> Deteniendo servicios existentes..."
docker compose down

echo ""
echo ">>> Iniciando servicios..."
docker compose up -d

echo ""
echo "============================================"
echo "  ESPERANDO A QUE LOS SERVICIOS ESTÉN UP"
echo "============================================"

# Esperar a que los servicios estén healthy
sleep 10

# Mostrar estado
echo ""
docker compose ps

echo ""
echo "============================================"
echo "  VERIFICANDO ENDPOINTS"
echo "============================================"

check_service() {
    local name=$1
    local url=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "✓ $name - OK"
    else
        echo "✗ $name - FALLO"
    fi
}

check_service "Carta Service" "http://localhost/api/carta/actuator/health"
check_service "Personal Service" "http://localhost/api/personal/actuator/health"
check_service "Reserva Service" "http://localhost/api/reservas/actuator/health"
check_service "Sala Service" "http://localhost/api/sala/actuator/health"

echo ""
echo "============================================"
echo "  DEPLOY COMPLETADO"
echo "============================================"
echo ""
echo "Endpoints disponibles:"
echo "  - Carta:    http://46.225.238.149/api/carta"
echo "  - Personal: http://46.225.238.149/api/personal"
echo "  - Reservas: http://46.225.238.149/api/reservas"
echo "  - Sala:     http://46.225.238.149/api/sala"
