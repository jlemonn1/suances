#!/bin/bash
set -e

VERSION=${1:-latest}
DOCKER_HUB_USER=${2:-suances}

echo "============================================"
echo "  BUILD Y PUSH - Suances Backend"
echo "============================================"
echo "Versión: $VERSION"
echo "Docker Hub User: $DOCKER_HUB_USER"
echo ""

SERVICES=("carta-service" "personal-service" "reserva-service" "sala-service")

for SERVICE in "${SERVICES[@]}"; do
    echo ">>> Build y push de $SERVICE..."
    
    # Ir al directorio del servicio
    SERVICE_DIR="../../backend/rest-${SERVICE%-service}"
    
    if [ ! -d "$SERVICE_DIR" ]; then
        echo "ERROR: Directorio $SERVICE_DIR no encontrado"
        exit 1
    fi
    
    cd "$SERVICE_DIR"
    
    # Build
    docker build -t ${DOCKER_HUB_USER}/${SERVICE}:${VERSION} .
    
    # Tag latest también si no es latest
    if [ "$VERSION" != "latest" ]; then
        docker tag ${DOCKER_HUB_USER}/${SERVICE}:${VERSION} ${DOCKER_HUB_USER}/${SERVICE}:latest
    fi
    
    # Push
    docker push ${DOCKER_HUB_USER}/${SERVICE}:${VERSION}
    if [ "$VERSION" != "latest" ]; then
        docker push ${DOCKER_HUB_USER}/${SERVICE}:latest
    fi
    
    echo ">>> $SERVICE completado"
    echo ""
    
    cd - > /dev/null
done

echo "============================================"
echo "  TODOS LOS SERVICIOS SUBDIDOS"
echo "============================================"
echo ""
echo "Para desplegar en servidor:"
echo "  scp -r deploy/ usuario@46.225.238.149:/opt/suances/"
echo "  ssh usuario@46.225.238.149"
echo "  cd /opt/suances/deploy"
echo "  ./scripts/deploy.sh"
