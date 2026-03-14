# rest-caja-service

Microservicio de caja para el restaurante Suances. Gestiona la apertura y cierre de caja diario, registra las comandas cobradas recibidas desde el microservicio Sala vía Redis Streams, y expone una API REST para consulta y auditoría.

## Stack

- Java 21 · Spring Boot 3.5
- Spring Data JPA + PostgreSQL
- Spring Security + OAuth2 Resource Server (JWT HMAC-SHA256 compartido con personal-service)
- Redis Streams (consumer group `caja-group`)
- Maven

## Arquitectura

```
Sala-Service  ──Redis Stream──▶  SalaEventConsumer  ──▶  ComandaCobradaService
                sala.events                                      │
                                                          SesionCaja (auto si no hay)
                                                          ComandaCobrada

Frontend/API  ──HTTP──▶  SesionCajaController    (abrir / cerrar / listar / detalle)
                         ComandaCobradaController (listar / detalle)
```

## Endpoints

Base path: `http://localhost:8082/suances`

### Sesiones de Caja

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `POST` | `/sesiones/abrir` | Abre caja con dinero inicial | OWNER, MANAGER |
| `POST` | `/sesiones/cerrar` | Cierra caja activa y calcula totales | OWNER, MANAGER |
| `GET` | `/sesiones/activa` | Sesión abierta de hoy | Todos |
| `GET` | `/sesiones` | Historial paginado con filtros | OWNER, MANAGER |
| `GET` | `/sesiones/{id}` | Detalle de una sesión | OWNER, MANAGER |

**Filtros disponibles en `GET /sesiones`:** `fechaDesde`, `fechaHasta`, `estado`

### Comandas Cobradas

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/comandas` | Listado paginado con filtros | OWNER, MANAGER |
| `GET` | `/comandas/{id}` | Detalle con items | OWNER, MANAGER |

**Filtros disponibles en `GET /comandas`:** `fecha`, `fechaDesde`, `fechaHasta`, `metodoPago`, `sesionCajaId`, `mesaNumero`

## Reglas de Negocio

| Código | Descripción |
|--------|-------------|
| RN-01 | Solo una sesión por día. Segundo intento de apertura → `409 CONFLICT` |
| RN-02 | Una sesión cerrada es inmutable. Los totales son definitivos |
| RN-03 | Las comandas cobradas son inmutables. Solo llegan por evento Redis |
| RN-04 | `total_efectivo = dinero_inicial + Σ EFECTIVO` · `total_general = Σ los tres métodos` |
| RN-05 | Idempotencia: `event_id` en tabla `eventos_procesados` evita doble procesamiento |
| RN-06 | Si llega un evento sin sesión abierta, se crea automáticamente con `dinero_inicial = 0` |
| RN-07 | No existen endpoints DELETE. Todos los datos son históricos y auditables |

## Configuración

Variables de entorno (o valores por defecto para desarrollo local):

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/caja` | URL JDBC de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de BD |
| `DB_PASSWORD` | `postgres` | Contraseña de BD |
| `REDIS_HOST` | `localhost` | Host de Redis |
| `REDIS_PORT` | `6379` | Puerto de Redis |
| `JWT_SECRET` | *(ver .env)* | Secret HMAC-SHA256 compartido con personal-service |

## Ejecución local

### Prerrequisito: infraestructura compartida

```bash
# Desde la raíz del repositorio
docker compose -f docker-compose-infra.yml up -d
```

Esto levanta PostgreSQL (5432) y Redis (6379). La base de datos `caja` se crea automáticamente con el `init.sql`.

### Opción A — Maven directo

```bash
cd backend/rest-caja-service
./mvnw spring-boot:run
```

### Opción B — Docker Compose

```bash
# La red suances_suances-network debe existir (creada por docker-compose-infra.yml)
cd backend/rest-caja-service
docker compose up --build
```

## Schema de base de datos

El schema se aplica manualmente o mediante migración (Flyway/Liquibase pendiente). El DDL completo está en [`docs/caja/Caja-Service-SPEC.md`](../../docs/caja/Caja-Service-SPEC.md) — sección 5.

Tablas:
- `sesiones_caja` — apertura/cierre de caja diario
- `comandas_cobradas` — registro de cada cobro recibido por evento
- `comandas_cobradas_items` — snapshot de líneas de cada comanda
- `eventos_procesados` — tabla de idempotencia para eventos Redis

## Seguridad

Autenticación delegada a **personal-service** mediante JWT firmado con HMAC-SHA256. El token debe incluirse en cada petición:

```
Authorization: Bearer <token>
```

Claim `rol` en el JWT → Spring convierte a `ROLE_OWNER`, `ROLE_MANAGER`, `ROLE_WAITER`.
