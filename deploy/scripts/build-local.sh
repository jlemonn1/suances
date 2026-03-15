#!/bin/bash
set -e

echo "============================================"
echo "  BUILD Y UP - Suances Backend (LOCAL)"
echo "============================================"
echo ""

SERVICES=("carta-service" "personal-service" "reserva-service" "sala-service")

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

for SERVICE in "${SERVICES[@]}"; do
    echo ">>> Build de $SERVICE..."
    
    SERVICE_DIR="$BACKEND_DIR/rest-${SERVICE%-service}"
    
    if [ ! -d "$SERVICE_DIR" ]; then
        echo "ERROR: Directorio $SERVICE_DIR no encontrado"
        exit 1
    fi
    
    cd "$SERVICE_DIR"
    
    docker build -t ${SERVICE}:latest .
    
    echo ">>> $SERVICE completado"
    echo ""
    
    cd "$BACKEND_DIR"
done

echo "============================================"
echo "  LEVANTANDO SERVICIOS"
echo "============================================"
echo ""

echo ">>> Levantando carta-service..."
cd "$BACKEND_DIR/rest-carta-service"
docker-compose up -d

echo ">>> Levantando personal-service..."
cd "$BACKEND_DIR/rest-personal-service"
docker-compose up -d

echo ">>> Levantando reserva-service..."
cd "$BACKEND_DIR/rest-reserva-service"
docker-compose up -d

echo ">>> Levantando sala-service..."
cd "$BACKEND_DIR/rest-sala-service"
docker-compose up -d

echo ""
echo "============================================"
echo "  SERVICIOS LEVANTADOS"
echo "============================================"
echo ""
echo "Endpoints disponibles:"
echo "  - Carta:    http://localhost:8081/api/carta"
echo "  - Personal: http://localhost:8085/api/personal"
echo "  - Reservas: http://localhost:8087/api/reservas"
echo "  - Sala:     http://localhost:8083/api/sala"
echo ""
echo "Comandos útiles:"
echo "  docker-compose logs -f           # Ver logs"
echo "  docker-compose down              # Detener"
