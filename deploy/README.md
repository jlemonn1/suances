# 🍽️ Suances Deploy System

Sistema completo de despliegue para la aplicación Suances (microservicios).

## 📁 Estructura

```
deploy/
├── docker-compose.infra.yml      # PostgreSQL (4 BDs) + Redis
├── docker-compose.local.yml      # Microservicios (build local)
├── docker-compose.prod.yml       # Microservicios (Docker Hub)
├── .env.example                  # Template de variables
├── .env                          # Variables reales (NO commitear)
├── nginx/
│   └── nginx.conf                # Reverse proxy
├── scripts/
│   └── manage.py                 # Script principal con menú
└── backups/                      # Backups automáticos de BD
```

## 🌐 Arquitectura de Red

Todos los servicios comparten la red externa `suances-network`:

```
┌─────────────────────────────────────────────────────────┐
│                 suances-network                         │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL (4 instancias)                              │
│    - postgres-carta:5432                                │
│    - postgres-personal:5432                             │
│    - postgres-reservas:5432                             │
│    - postgres-sala:5432                                 │
│                                                         │
│  Redis (compartido)                                     │
│    - redis:6379                                         │
│                                                         │
│  Microservicios                                         │
│    - carta-service:8081                                 │
│    - personal-service:8085                              │
│    - reserva-service:8087                               │
│    - sala-service:8083                                  │
│                                                         │
│  Nginx (producción)                                     │
│    - nginx:80 → 46.225.238.149                          │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Primeros Pasos

### 1. Crear Red Docker

```bash
cd deploy/scripts
python manage.py --action create-network
```

O manualmente:
```bash
docker network create suances-network
```

### 2. Configurar Variables

```bash
cd deploy
cp .env.example .env
# Editar .env con tus valores reales
```

### 3. Preparar Backend (Healthchecks)

Asegúrate de que cada microservicio tiene `spring-boot-starter-actuator` en su `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## 💻 Desarrollo Local

### Opción A: Usar el Menú Interactivo

```bash
cd deploy/scripts
python manage.py
```

Selecciona:
- **3** → Deploy completo (build + levantar todo)

### Opción B: Comandos Directos

```bash
# Build de imágenes desde código
python manage.py --action build --version local

# Iniciar solo infraestructura (PostgreSQL + Redis)
python manage.py --action infra-up

# Deploy completo
python manage.py --action deploy-local

# Ver logs
python manage.py --action logs --service carta-service -f

# Ver estado
python manage.py --action status

# Detener todo
python manage.py --action stop-local

# Limpiar todo (⚠️ borra datos)
python manage.py --action clean
```

### Endpoints Locales

| Servicio | URL |
|----------|-----|
| Carta | http://localhost:8081/api/carta |
| Personal | http://localhost:8085/api/personal |
| Reservas | http://localhost:8087/api/reservas |
| Sala | http://localhost:8083/api/sala |

### Health Checks

| Servicio | Health Endpoint |
|----------|----------------|
| Carta | http://localhost:8081/api/carta/actuator/health |
| Personal | http://localhost:8085/api/personal/actuator/health |
| Reservas | http://localhost:8087/api/reservas/actuator/health |
| Sala | http://localhost:8083/api/sala/actuator/health |

## 🌐 Producción (VPS)

### Configurar Docker Hub

```bash
docker login
# Ingresa tus credenciales
```

### Build y Push

```bash
# Build + push a Docker Hub con versión
python manage.py --action build-push --version v1.0.0
```

### Deploy en VPS

```bash
# Deploy completo (backup + scp + deploy)
python manage.py --action deploy-prod
```

Esto hace:
1. Backup de bases de datos existentes
2. Copia archivos al VPS (`scp`)
3. Ejecuta deploy en el servidor remoto

### Acceso al VPS

```bash
ssh root@46.225.238.149
cd /opt/suances/deploy

# Ver logs
python manage.py --action logs -f

# Backup manual
python manage.py --action backup
```

### Endpoints Producción

| Servicio | URL |
|----------|-----|
| API | http://46.225.238.149 |
| Carta | http://46.225.238.149/api/carta |
| Personal | http://46.225.238.149/api/personal |
| Reservas | http://46.225.238.149/api/reservas |
| Sala | http://46.225.238.149/api/sala |

## 💾 Backups

### Automático
Se ejecuta automáticamente antes de cada deploy en producción.

### Manual
```bash
python manage.py --action backup
```

Los backups se guardan en `deploy/backups/` con formato: `{database}_YYYYMMDD_HHMMSS.sql`

### Restaurar Backup
```bash
# En el contenedor
docker exec -i postgres-carta psql -U postgres carta < backup_carta_20240315_120000.sql
```

## 🔧 Comandos Docker Útiles

```bash
# Ver logs de un servicio específico
docker logs -f carta-service

# Acceder al shell de un contenedor
docker exec -it carta-service /bin/sh

# Ver todas las redes
docker network ls

# Ver contenedores en la red
docker network inspect suances-network

# Reiniciar un servicio
docker restart carta-service

# Ver recursos usados
docker stats
```

## 📝 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VERSION` | Tag de la imagen | `v1.0.0` |
| `DOCKER_HUB_USER` | Usuario de Docker Hub | `suances` |
| `POSTGRES_USER` | Usuario PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña PostgreSQL | `secreta123` |
| `JWT_SECRET` | Clave secreta JWT | `Min256Bits...` |
| `SERVICE_TOKEN` | Token entre servicios | `token-interno` |
| `ADMIN_USERNAME` | Usuario admin | `admin` |
| `ADMIN_PASSWORD` | Contraseña admin | `admin123` |

## 🆘 Troubleshooting

### Error: Network not found
```bash
python manage.py --action create-network
```

### Error: Port already in use
```bash
# Ver qué usa el puerto
lsof -i :8081

# Matar proceso o cambiar puerto en docker-compose.local.yml
```

### Error: Database connection refused
Los servicios esperan automáticamente a que PostgreSQL esté listo (healthcheck). Si persiste:
```bash
# Ver logs de PostgreSQL
docker logs postgres-carta
```

### Error: Image not found
```bash
# Rebuild
python manage.py --action build
```

## 📦 Actualización de Servicios

### Local (desarrollo)
```bash
# Rebuild y redeploy
python manage.py --action deploy-local
```

### Producción
```bash
# 1. Build + push nueva versión
python manage.py --action build-push --version v1.1.0

# 2. Deploy con nueva versión
VERSION=v1.1.0 python manage.py --action deploy-prod
```

## 🔒 Seguridad

- **Nunca comitees** el archivo `.env`
- Usa contraseñas fuertes en producción
- El JWT_SECRET debe tener al menos 256 bits
- En producción, `CREATE_ADMIN_USER` debe ser `false`

## 🎯 Checklist Producción

- [ ] Configurar `.env` con valores reales
- [ ] Cambiar `JWT_SECRET` por uno seguro
- [ ] Cambiar `POSTGRES_PASSWORD`
- [ ] Cambiar `ADMIN_PASSWORD`
- [ ] Configurar `DOCKER_HUB_USER`
- [ ] Probar en local primero
- [ ] Hacer backup antes de deploy
- [ ] Verificar health endpoints
- [ ] Probar endpoints principales

---

**Nota:** Si usas Windows, ejecuta el script con Python desde Git Bash o WSL para mejor compatibilidad.
