# Micro SERVICIO CAJA - Especificación Técnica

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | CajaService |
| **Artefacto** | rest-caja-service |
| **Puerto** | 8082 |
| **Context Path** | /api/caja |
| **Base de datos** | PostgreSQL (localhost:5432/caja) |
| **Cache/Eventos** | Redis (localhost:6379) |
| **Package base** | com.suances.caja |

---

## 2. Stack Tecnológico

- **Framework**: Spring Boot 3.2.x
- **Lenguaje**: Java 17
- **Build**: Maven
- **ORM**: Spring Data JPA + Hibernate
- **Seguridad**: Spring Security + JWT (jjwt 0.12.3)
- **Validación**: Jakarta Bean Validation
- **Base de datos**: PostgreSQL
- **Redis**: Streams (Consumer Groups) para eventos entrantes desde Sala
- **Lombok**: No (getters/setters manuales, igual que CartaService)

---

## 3. Configuración (application.yml)

```yaml
server:
  port: 8082

spring:
  application:
    name: caja-service
  datasource:
    url: jdbc:postgresql://localhost:5432/caja
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  data:
    redis:
      host: localhost
      port: 6379

app:
  jwt:
    secret: ${JWT_SECRET:CHANGE_ME_IN_PRODUCTION_MIN_256_BITS}
    expiration: 86400000
  redis:
    stream-events: sala.events
    group: caja-group
    consumer: caja-consumer

logging:
  level:
    root: INFO
    com.suances.caja: DEBUG

networks:
  suances-network:
    external: true
    name: suances_suances-network
```

---

## 4. Modelo de Datos

### 4.1 Entidades

#### SesionCaja
Representa la apertura y cierre de caja de un día. Solo puede haber una sesión abierta a la vez.

```java
@Table(name = "sesiones_caja")
- id:             UUID (PK)
- fecha:          DATE NOT NULL (día natural de la sesión)
- estado:         ENUM('ABIERTA', 'CERRADA') NOT NULL DEFAULT 'ABIERTA'
- dinero_inicial: DECIMAL(10,2) NOT NULL >= 0 (efectivo con el que se abre)
- abierta_por:    VARCHAR(255) NOT NULL (userId extraído del JWT)
- abierta_por_nombre: VARCHAR(255) NOT NULL (name del JWT)
- abierta_at:     TIMESTAMP NOT NULL
- cerrada_por:    VARCHAR(255) NULLABLE
- cerrada_por_nombre: VARCHAR(255) NULLABLE
- cerrada_at:     TIMESTAMP NULLABLE
- total_efectivo: DECIMAL(10,2) NULLABLE (calculado al cerrar: Σ efectivo + dinero_inicial)
- total_tarjeta:  DECIMAL(10,2) NULLABLE (calculado al cerrar: Σ tarjeta)
- total_mesa:     DECIMAL(10,2) NULLABLE (calculado al cerrar: Σ mesa)
- total_general:  DECIMAL(10,2) NULLABLE (calculado al cerrar: suma de los tres)
- created_at:     TIMESTAMP NOT NULL
```

Constraints:
- UNIQUE(fecha) — solo una sesión por día
- Si estado = CERRADA → cerrada_por, cerrada_at, totales son NOT NULL
- No se puede eliminar ni editar datos históricos

#### ComandaCobrada
Registro de cada comanda cobrada recibida desde Sala vía Redis. Inmutable una vez creada.

```java
@Table(name = "comandas_cobradas")
- id:               UUID (PK)
- sesion_caja_id:   UUID FK → sesiones_caja(id) NOT NULL
- event_id:         VARCHAR(255) UNIQUE NOT NULL (idempotencia Redis)
- comanda_id:       UUID NOT NULL (ID de la comanda en el micro Sala)
- mesa_numero:      VARCHAR(50) NOT NULL
- metodo_pago:      ENUM('EFECTIVO', 'TARJETA', 'MESA') NOT NULL
- importe_total:    DECIMAL(10,2) NOT NULL > 0
- cobrada_at:       TIMESTAMP NOT NULL (timestamp del evento de Sala)
- created_at:       TIMESTAMP NOT NULL (timestamp de inserción en Caja)
```

#### ComandaCobradaItem
Snapshot de cada línea de la comanda cobrada. Inmutable.

```java
@Table(name = "comandas_cobradas_items")
- id:                  UUID (PK)
- comanda_cobrada_id:  UUID FK → comandas_cobradas(id) NOT NULL
- plato_id:            UUID NOT NULL (ref al micro Carta, sin FK cruzada)
- plato_nombre:        VARCHAR(255) NOT NULL (snapshot del nombre)
- cantidad:            INTEGER NOT NULL > 0
- precio_unitario:     DECIMAL(10,2) NOT NULL >= 0
- subtotal:            DECIMAL(10,2) NOT NULL >= 0
```

#### EventosProcesados
Tabla de idempotencia para evitar doble procesamiento de eventos Redis.

```java
@Table(name = "eventos_procesados")
- event_id:      VARCHAR(255) (PK)
- processed_at:  TIMESTAMP NOT NULL
```

---

### 4.2 Enums

```java
// EstadoSesion
ABIERTA, CERRADA

// MetodoPago
EFECTIVO,   // pago en metálico en caja
TARJETA,    // pago con tarjeta bancaria
MESA        // cargo a cuenta de la mesa (pago diferido / fiado)
```

---

## 5. Esquema SQL (PostgreSQL)

```sql
-- ============================================================
-- MICRO SERVICIO CAJA - Schema PostgreSQL
-- ============================================================

CREATE TYPE estado_sesion AS ENUM ('ABIERTA', 'CERRADA');
CREATE TYPE metodo_pago   AS ENUM ('EFECTIVO', 'TARJETA', 'MESA');

-- ============================================================
-- TABLA: sesiones_caja
-- ============================================================
CREATE TABLE sesiones_caja (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha               DATE NOT NULL,
    estado              estado_sesion NOT NULL DEFAULT 'ABIERTA',
    dinero_inicial      DECIMAL(10,2) NOT NULL CHECK (dinero_inicial >= 0),
    abierta_por         VARCHAR(255) NOT NULL,
    abierta_por_nombre  VARCHAR(255) NOT NULL,
    abierta_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cerrada_por         VARCHAR(255),
    cerrada_por_nombre  VARCHAR(255),
    cerrada_at          TIMESTAMP,
    total_efectivo      DECIMAL(10,2),
    total_tarjeta       DECIMAL(10,2),
    total_mesa          DECIMAL(10,2),
    total_general       DECIMAL(10,2),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_sesion_fecha UNIQUE (fecha),
    CONSTRAINT chk_cerrada_completa CHECK (
        estado = 'ABIERTA'
        OR (cerrada_por IS NOT NULL AND cerrada_at IS NOT NULL
            AND total_efectivo IS NOT NULL AND total_tarjeta IS NOT NULL
            AND total_mesa IS NOT NULL AND total_general IS NOT NULL)
    )
);

CREATE INDEX idx_sesiones_fecha   ON sesiones_caja(fecha);
CREATE INDEX idx_sesiones_estado  ON sesiones_caja(estado);

-- ============================================================
-- TABLA: comandas_cobradas
-- ============================================================
CREATE TABLE comandas_cobradas (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_caja_id   UUID NOT NULL REFERENCES sesiones_caja(id),
    event_id         VARCHAR(255) NOT NULL UNIQUE,
    comanda_id       UUID NOT NULL,
    mesa_numero      VARCHAR(50) NOT NULL,
    metodo_pago      metodo_pago NOT NULL,
    importe_total    DECIMAL(10,2) NOT NULL CHECK (importe_total > 0),
    cobrada_at       TIMESTAMP NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comandas_sesion      ON comandas_cobradas(sesion_caja_id);
CREATE INDEX idx_comandas_cobrada_at  ON comandas_cobradas(cobrada_at);
CREATE INDEX idx_comandas_metodo_pago ON comandas_cobradas(metodo_pago);
CREATE INDEX idx_comandas_comanda_id  ON comandas_cobradas(comanda_id);

-- ============================================================
-- TABLA: comandas_cobradas_items
-- ============================================================
CREATE TABLE comandas_cobradas_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comanda_cobrada_id  UUID NOT NULL REFERENCES comandas_cobradas(id),
    plato_id            UUID NOT NULL,
    plato_nombre        VARCHAR(255) NOT NULL,
    cantidad            INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario     DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal            DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_items_comanda ON comandas_cobradas_items(comanda_cobrada_id);

-- ============================================================
-- TABLA: eventos_procesados
-- ============================================================
CREATE TABLE eventos_procesados (
    event_id      VARCHAR(255) PRIMARY KEY,
    processed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Épicas e Historias de Usuario

### ÉPICA 1 — Notificación de Comanda Cobrada (Integración con Sala)

Sala publica el evento `sala.comanda.cobrada` en el stream `sala.events`.
Caja está suscrito con consumer group `caja-group` y lo procesa.

#### HU 1.1 — Consumir evento de comanda cobrada

Como sistema Caja,
quiero recibir y persistir el evento `sala.comanda.cobrada` desde el stream Redis,
para registrar cada cobro en la sesión de caja activa.

**Criterios técnicos:**
- Verificar idempotencia via `event_id` en tabla `eventos_procesados`
- Si `event_id` ya existe → ACK y salir sin procesar
- Si no existe → procesar en transacción:
  1. Buscar sesión de caja abierta para hoy → si no hay, crear sesión automática con `dinero_inicial = 0` y `abierta_por = "sistema"`
  2. Insertar `ComandaCobrada` con sus items
  3. Insertar en `eventos_procesados`
  4. ACK al stream
- Si no hay sesión abierta y no se puede crear → logar error, no ACK (reintento automático)
- Todo en una única transacción `@Transactional`

**Payload del evento entrante:**

```json
{
  "eventId": "uuid",
  "type": "sala.comanda.cobrada",
  "timestamp": "2026-03-14T14:30:00Z",
  "data": {
    "comandaId": "uuid",
    "mesaNumero": "5",
    "metodoPago": "EFECTIVO",
    "importeTotal": 45.50,
    "items": [
      {
        "platoId": "uuid",
        "platoNombre": "Ensalada Mixta",
        "cantidad": 2,
        "precioUnitario": 12.50,
        "subtotal": 25.00
      }
    ],
    "cobradaAt": "2026-03-14T14:29:00Z"
  }
}
```

---

### ÉPICA 2 — CRUD de Comandas Cobradas

Solo lectura. Los datos son inmutables (llegan por evento).

#### HU 2.1 — Listar comandas cobradas con filtros

Como Gerente o Propietario,
quiero ver el listado de comandas cobradas con filtros,
para auditar y analizar los cobros.

**Filtros disponibles:**
- `fecha` (LocalDate) — filtra por `cobrada_at::date`
- `fechaDesde` / `fechaHasta` — rango de fechas
- `metodoPago` (EFECTIVO | TARJETA | MESA)
- `sesionCajaId` (UUID)
- `mesaNumero` (String)

**Respuesta:** página de `ComandaCobradaResumen` (sin items).

#### HU 2.2 — Ver detalle de comanda cobrada

Como Propietario (OWNER),
quiero ver el detalle completo de una comanda cobrada,
para verificar los items y el importe.

**Respuesta:** `ComandaCobradaDetalle` con lista de items.

---

### ÉPICA 3 — Caja y Flujos de Dinero

#### HU 3.1 — Abrir sesión de caja

Como Propietario (OWNER),
quiero indicar con cuánto dinero en efectivo se abre la caja,
para llevar el control del efectivo del día.

**Criterios:**
- Solo se puede abrir si no hay sesión `ABIERTA` para hoy
- `dinero_inicial` >= 0, obligatorio
- `abierta_por` y `abierta_por_nombre` se extraen del JWT
- `abierta_at` = momento actual
- `fecha` = fecha actual

**Request:**
```json
{ "dineroInicial": 150.00 }
```

**Response 201:**
```json
{
  "id": "uuid",
  "fecha": "2026-03-14",
  "estado": "ABIERTA",
  "dineroInicial": 150.00,
  "abiertaPor": "userId",
  "abiertaPorNombre": "María García",
  "abiertaAt": "2026-03-14T09:00:00"
}
```

**Errores:**
- `409 CONFLICT` si ya existe sesión abierta hoy

#### HU 3.2 — Cerrar sesión de caja

Como Gerente o Propietario,
quiero cerrar la caja al final del día,
para obtener los totales y registrar quién cierra.

**Criterios de cálculo al cerrar:**
- `total_efectivo` = Σ importe_total WHERE metodo_pago = 'EFECTIVO' + `dinero_inicial`
- `total_tarjeta` = Σ importe_total WHERE metodo_pago = 'TARJETA'
- `total_mesa`    = Σ importe_total WHERE metodo_pago = 'MESA'
- `total_general` = total_efectivo + total_tarjeta + total_mesa
- `cerrada_por` y `cerrada_por_nombre` se extraen del JWT
- `cerrada_at` = momento actual
- `estado` = 'CERRADA'
- Una sesión cerrada no puede reabrirse ni modificarse

**No tiene body de request** (el cierre es automático sobre la sesión abierta del día).

**Response 200:**
```json
{
  "id": "uuid",
  "fecha": "2026-03-14",
  "estado": "CERRADA",
  "dineroInicial": 150.00,
  "abiertaPor": "userId",
  "abiertaPorNombre": "María García",
  "abiertaAt": "2026-03-14T09:00:00",
  "cerradaPor": "userId2",
  "cerradaPorNombre": "Carlos López",
  "cerradaAt": "2026-03-14T23:45:00",
  "totalEfectivo": 487.50,
  "totalTarjeta": 320.00,
  "totalMesa": 95.00,
  "totalGeneral": 902.50
}
```

**Errores:**
- `404 NOT_FOUND` si no hay sesión abierta hoy
- `422 BUSINESS_RULE` si la sesión ya está cerrada

#### HU 3.3 — Consultar sesión activa

Como cualquier rol autenticado,
quiero saber si hay caja abierta hoy y su estado,
para mostrar información contextual en el frontend.

**Response 200** — si existe, devuelve SesionCajaResponse.
**Response 404** — si no hay sesión abierta hoy.

---

### ÉPICA 4 — CRUD de Caja (Consultas Históricas)

No se elimina ninguna información.

#### HU 4.1 — Listar sesiones de caja

Como Gerente o Propietario,
quiero ver el historial de sesiones de caja,
para revisar los totales diarios y los cierres.

**Filtros:**
- `fechaDesde` / `fechaHasta`
- `estado` (ABIERTA | CERRADA)

**Respuesta:** lista paginada de `SesionCajaResponse`.

#### HU 4.2 — Ver detalle de sesión de caja

Como Gerente o Propietario,
quiero ver el detalle de una sesión concreta,
para auditar los totales y quién la gestionó.

**Response:** `SesionCajaDetalle` — incluye los totales y metadatos de apertura/cierre.

---

## 7. Contrato REST

Base URL: `/api/caja`
Todos los endpoints requieren: `Authorization: Bearer <token>`
Heredamos autenticación de rest-personal-service, utilizando oauth2-resource-server

### 7.1 Sesiones de Caja

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| `POST` | `/sesiones/abrir` | Abrir caja con dinero inicial | PROPIETARIO |
| `POST` | `/sesiones/cerrar` | Cerrar caja activa del día | PROPIETARIO |
| `GET`  | `/sesiones/activa` | Obtener sesión abierta de hoy | Todos |
| `GET`  | `/sesiones` | Listar sesiones con filtros (paginado) | PROPIETARIO |
| `GET`  | `/sesiones/{id}` | Detalle de una sesión | PROPIETARIO |

### 7.2 Comandas Cobradas

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| `GET`  | `/comandas` | Listar con filtros (paginado) | PROPIETARIO |
| `GET`  | `/comandas/{id}` | Detalle completo con items | PROPIETARIO |

---

## 8. DTOs

### Requests

#### AbrirCajaRequest
```json
{
  "dineroInicial": 150.00
}
```
Validaciones: `@NotNull`, `@DecimalMin("0.00")`

### Responses

#### SesionCajaResponse
```json
{
  "id": "uuid",
  "fecha": "2026-03-14",
  "estado": "ABIERTA | CERRADA",
  "dineroInicial": 150.00,
  "abiertaPor": "userId",
  "abiertaPorNombre": "María García",
  "abiertaAt": "2026-03-14T09:00:00",
  "cerradaPor": null,
  "cerradaPorNombre": null,
  "cerradaAt": null,
  "totalEfectivo": null,
  "totalTarjeta": null,
  "totalMesa": null,
  "totalGeneral": null
}
```

#### ComandaCobradaResumen (listado sin items)
```json
{
  "id": "uuid",
  "sesionCajaId": "uuid",
  "comandaId": "uuid",
  "mesaNumero": "5",
  "metodoPago": "EFECTIVO",
  "importeTotal": 45.50,
  "cobradaAt": "2026-03-14T14:29:00"
}
```

#### ComandaCobradaDetalle (con items)
```json
{
  "id": "uuid",
  "sesionCajaId": "uuid",
  "comandaId": "uuid",
  "mesaNumero": "5",
  "metodoPago": "EFECTIVO",
  "importeTotal": 45.50,
  "cobradaAt": "2026-03-14T14:29:00",
  "createdAt": "2026-03-14T14:29:01",
  "items": [
    {
      "platoId": "uuid",
      "platoNombre": "Ensalada Mixta",
      "cantidad": 2,
      "precioUnitario": 12.50,
      "subtotal": 25.00
    }
  ]
}
```

---

## 9. Contrato Redis (Streams)

### Evento de entrada: `sala.comanda.cobrada`

- **Stream**: `sala.events`
- **Consumer Group**: `caja-group`
- **Consumer name**: `caja-consumer`

El campo `type` dentro del payload identifica el tipo de evento.
Caja debe ignorar (ACK sin procesar) cualquier mensaje cuyo `type` no sea `sala.comanda.cobrada`.

> **Contrato real publicado por Sala-Service** (`SalaEventProducer.publicarEvento`):
> los campos del stream son entradas planas del `Map<String, String>`;
> el campo `data` es un JSON serializado como **String**.
> No se incluyen items de línea — `ComandaCobradaItem` quedará vacío.

```json
{
  "eventId": "uuid",
  "type": "sala.comanda.cobrada",
  "timestamp": "2026-03-14T14:30:00+01:00",
  "source": "sala-service",
  "data": "{\"comandaId\":\"uuid\",\"mesaId\":\"uuid\",\"codigo\":\"C-001\",\"total\":\"45.50\",\"tipoPago\":\"EFECTIVO\",\"montoRecibido\":\"50.00\",\"horaCobro\":\"2026-03-14T14:29:00+01:00\"}"
}
```

| Campo Sala | Campo Caja             | Notas                                  |
|------------|------------------------|----------------------------------------|
| `mesaId`   | `mesa_numero`          | Se almacena el UUID como identificador |
| `tipoPago` | `metodo_pago`          | Mismo vocabulario: EFECTIVO/TARJETA/MESA |
| `total`    | `importe_total`        | BigDecimal parseado del String         |
| `horaCobro`| `cobrada_at`           | OffsetDateTime → LocalDateTime UTC     |

### Idempotencia de eventos

```
Tabla: eventos_procesados
PK: event_id (VARCHAR)

Flujo:
1. Leer evento del stream
2. Extraer eventId
3. IF existe en eventos_procesados → ACK, salir
4. IF no existe → procesar en @Transactional:
   a. Persistir ComandaCobrada + items
   b. Insertar eventos_procesados
5. ACK al stream
```

---

## 10. Seguridad JWT

Token compartido con todos los micros, firmado por Personal-Service.

```json
{
  "sub": "userId",
  "name": "Nombre Apellido",
  "role": "PROPIETARIO | GERENTE | CAMARERO",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Autorización por rol

| Operación | PROPIETARIO | GERENTE | CAMARERO |
|-----------|:-----------:|:-------:|:--------:|
| Abrir caja | ✅ | ✅ | ❌ |
| Cerrar caja | ✅ | ✅ | ❌ |
| Ver sesión activa | ✅ | ✅ | ✅ |
| Listar sesiones | ✅ | ✅ | ❌ |
| Ver detalle sesión | ✅ | ✅ | ❌ |
| Listar comandas cobradas | ✅ | ✅ | ❌ |
| Ver detalle comanda | ✅ | ✅ | ❌ |

---

## 11. Códigos de Error

| Código HTTP | Error | Cuándo |
|-------------|-------|--------|
| 400 | `VALIDATION_ERROR` | Campos inválidos en request |
| 401 | `UNAUTHORIZED` | Token ausente o inválido |
| 403 | `FORBIDDEN` | Rol sin permisos |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Sesión de caja ya abierta hoy |
| 422 | `BUSINESS_RULE` | Regla de negocio incumplida (ej. cerrar sesión ya cerrada) |
| 500 | `INTERNAL_ERROR` | Error interno inesperado |

**Formato de error estándar:**
```json
{
  "error": "TIPO_ERROR",
  "message": "Descripción clara del error",
  "timestamp": "2026-03-14T14:30:00"
}
```

---

## 12. Estructura de Paquetes

```
com.suances.caja
├── CajaApplication.java
├── config/
│   ├── RedisConfig.java
│   ├── SecurityConfig.java
│   └── JwtConfig.java
├── consumer/
│   └── SalaEventConsumer.java          ← consume sala.events
├── controller/
│   ├── SesionCajaController.java
│   └── ComandaCobradaController.java
├── domain/
│   ├── enums/
│   │   ├── EstadoSesion.java
│   │   └── MetodoPago.java
│   └── model/
│       ├── SesionCaja.java
│       ├── ComandaCobrada.java
│       ├── ComandaCobradaItem.java
│       └── EventosProcesados.java
├── dto/
│   ├── event/
│   │   ├── SalaComandaCobradaEvent.java
│   │   └── SalaComandaCobradaEventData.java
│   │   └── ComandaItemEvent.java
│   ├── request/
│   │   └── AbrirCajaRequest.java
│   └── response/
│       ├── SesionCajaResponse.java
│       ├── ComandaCobradaResumen.java
│       └── ComandaCobradaDetalle.java
├── exception/
│   ├── BusinessRuleException.java
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java
├── repository/
│   ├── SesionCajaRepository.java
│   ├── ComandaCobradaRepository.java
│   ├── ComandaCobradaItemRepository.java
│   └── EventosProcesadosRepository.java
├── security/
│   ├── JwtAuthFilter.java
│   └── JwtService.java
└── service/
    ├── SesionCajaService.java
    └── ComandaCobradaService.java
```

---

## 13. Reglas de Negocio Críticas

### RN-01: Una sesión por día
- Solo puede existir una `SesionCaja` con `fecha = hoy`
- Si se intenta abrir una segunda → `409 CONFLICT`

### RN-02: Sesión cerrada es inmutable
- Una vez `estado = CERRADA`, no se puede reabrir ni modificar
- Los totales son definitivos

### RN-03: Comandas cobradas son inmutables
- Solo llegan por evento Redis
- No existe endpoint POST/PUT/DELETE para comandas
- Una vez persistida, no se modifica

### RN-04: Cálculo de totales al cierre
```
total_efectivo = dinero_inicial + Σ(importe_total WHERE metodo_pago = 'EFECTIVO')
total_tarjeta  = Σ(importe_total WHERE metodo_pago = 'TARJETA')
total_mesa     = Σ(importe_total WHERE metodo_pago = 'MESA')
total_general  = total_efectivo + total_tarjeta + total_mesa
```

### RN-05: Idempotencia de eventos Redis
- El `eventId` del evento de Sala garantiza que no se procese dos veces
- La tabla `eventos_procesados` actúa como barrera

### RN-06: Evento sin sesión abierta
- Si llega un evento y no hay sesión abierta hoy, se crea automáticamente con `dinero_inicial = 0` y `abierta_por = "sistema"`
- El usuario puede después editar el `dinero_inicial` mediante apertura manual (si la sesión la creó el sistema)

### RN-07: Sin eliminación
- No existe ningún endpoint DELETE en este microservicio
- La información de caja es histórica y auditable

---

## 14. pom.xml de referencia

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.2</version>
</parent>

<groupId>com.suances</groupId>
<artifactId>rest-caja-service</artifactId>
<version>1.0.0-SNAPSHOT</version>

<properties>
    <java.version>17</java.version>
    <jjwt.version>0.12.3</jjwt.version>
</properties>

<dependencies>
    spring-boot-starter-web
    spring-boot-starter-data-jpa
    spring-boot-starter-validation
    spring-boot-starter-security
    spring-boot-starter-oauth2-resource-server
    spring-boot-starter-data-redis
    postgresql (runtime)
    jjwt-api / jjwt-impl / jjwt-jackson (0.12.3)
    spring-boot-starter-test (test)
    spring-security-test (test)
</dependencies>
```

---

## 15. Flujo Completo

```
[Sala] cobra comanda
  → publica evento 'sala.comanda.cobrada' en sala.events (Redis Stream)

[Caja - SalaEventConsumer]
  ← lee evento del stream (consumer group: caja-group)
  → verifica idempotencia (eventos_procesados)
  → busca/crea SesionCaja del día
  → persiste ComandaCobrada + items
  → registra evento procesado
  → ACK al stream

[Frontend / Gerente]
  → GET /api/caja/sesiones/activa   → ve estado de caja
  → GET /api/caja/comandas?fecha=hoy → ve tickets del día
  → POST /api/caja/sesiones/cerrar  → cierra caja, recibe totales
  → GET /api/caja/sesiones/{id}     → consulta histórico
```

---

## 16. Decisiones

| ID | Decisión | Decisión tomada |
|----|----------|-----------------|
| D-01 | Comportamiento si llega comanda sin sesión abierta | **A** — crear sesión automática con `dinero_inicial=0` |
| D-02 | ¿El CAMARERO puede ver la sesión activa? | **Sí** — para mostrar estado en el TPV |
| D-03 | Paginación por defecto | **size=20** |
| D-04 | ¿Filtro por mesa en listado de comandas? | **Sí** — útil para auditar una mesa concreta |
