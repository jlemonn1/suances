# Micro SERVICIO RESERVAS - Especificación Técnica

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | ReservaService |
| **Puerto** | 8087 |
| **Context Path** | `/api/reservas` |
| **Base de datos** | PostgreSQL (`localhost:5432/reservas`) |
| **Eventos** | Redis Streams (`localhost:6379`) |

---

## 2. Stack Tecnológico

- **Framework**: Spring Boot 3.5.11
- **Lenguaje**: Java 21
- **Build**: Maven
- **Arquitectura**: Hexagonal (puertos/adaptadores). Dominio rico con servicios de dominio para asignación.
- **Persistencia**: Spring Data JPA + Hibernate
- **Cache / Cola**: Redis Streams (event sourcing ligero)
- **Seguridad**: Spring Security 6 + JWT (tokens emitidos por PersonnelService)
- **Validación**: Jakarta Bean Validation
- **Observabilidad**: Micrometer + Prometheus (métricas), OpenTelemetry (tracing)

---

## 3. Configuración (application.yml)

```yaml
server:
  port: 8087

spring:
  application:
    name: reservas-service
  datasource:
    url: jdbc:postgresql://localhost:5432/reservas
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
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
    issuer: personnel-service
    secret: ${JWT_SECRET:CHANGE_ME_MIN_256_BITS}
    audiences: reservas-service
  redis:
    stream-input: sala.events
    stream-output: reservas.events
    consumer-group: reservas-group
  allocation:
    max-join-tables: 2   # Futuro
    hold-timeout-minutes: 15

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

---

## 4. Arquitectura y Paquetes

```
com.suances.reservas
├── ReservaApplication.java
├── config/
│   ├── RedisConfig.java
│   ├── SecurityConfig.java
│   └── OpenApiConfig.java
├── controller/
│   ├── SalaController.java
│   ├── MesaController.java
│   ├── FranjaController.java
│   ├── ReservaPrivadaController.java
│   └── ReservaPublicaController.java
├── service/
│   ├── SalaService.java
│   ├── MesaService.java
│   ├── FranjaService.java
│   ├── ReservaService.java
│   ├── WaitlistService.java
│   └── AllocationEngine.java
├── repository/
│   ├── SalaRepository.java
│   ├── MesaRepository.java
│   ├── FranjaRepository.java
│   ├── ReservaRepository.java
│   ├── BloqueoRepository.java
│   ├── WaitlistRepository.java
│   └── EventoProcesadoRepository.java
├── domain/
│   └── model/
│       ├── Sala.java
│       ├── Mesa.java
│       ├── FranjaHoraria.java
│       ├── Reserva.java
│       ├── Bloqueo.java
│       └── WaitlistEntry.java
├── dto/
│   ├── request/
│   └── response/
├── event/
│   ├── SalaEventConsumer.java
│   ├── ReservaEventProducer.java
│   └── mapper/
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── JwtTokenProvider.java
└── exception/
    ├── GlobalExceptionHandler.java
    ├── BusinessRuleException.java
    └── ResourceNotFoundException.java
```

---

## 5. Modelo de Dominio

### 5.1 Entidades

#### Sala
- `id: UUID`
- `nombre: VARCHAR(120)`
- `capacidadMaxima: INTEGER`
- `layout`: ancho, alto, lista de vértices (para plano)
- `activa: BOOLEAN`

#### Mesa
- `id: UUID`
- `salaId: UUID`
- `numero: INTEGER` (único por sala)
- `capacidad: SMALLINT`
- `posX, posY, ancho, alto`
- `estado: mesa_estado` (LIBRE, BLOQUEADA, OCUPADA)
- `visibleOnline: BOOLEAN`

#### FranjaHoraria
- `id: UUID`
- `nombre: VARCHAR(60)` (Comida, Cena, Especial)
- `horaInicio: TIME`
- `horaFin: TIME`
- `tipo: ENUM` (COMIDA, CENA, ESPECIAL)
- `activa: BOOLEAN`

#### Reserva
- `id: UUID`
- `codigo: VARCHAR(12)` (para clientes)
- `mesaId: UUID`
- `fecha: DATE`
- `franjaId: UUID`
- `estado: reserva_estado` (PENDIENTE, CONFIRMADA, CANCELADA, NO_SHOW, FINALIZADA)
- `origen: ENUM (ONLINE, MANUAL, WALKIN)`
- `nombreCliente`
- `telefono`
- `email`
- `comensales`
- `notas`

#### Bloqueo
- `id: UUID`
- `mesaId`
- `tipo: bloqueo_tipo` (ONLINE, TOTAL, EVENTO, MANTENIMIENTO)
- `motivo`
- `fechaDesde`
- `fechaHasta`
- `franjasAfectadas` (array)

#### WaitlistEntry
- `id`
- `fecha`
- `franjaId`
- `comensales`
- `estado: WAITING | NOTIFIED | CANCELLED`
- `prioridad`

#### ReservaAudit
- `id`
- `reservaId`
- `accion`
- `usuario`
- `payload`

### 5.2 Relaciones

```
Sala 1---N Mesa
Mesa 1---N Reserva (por fecha + franja)
Mesa 1---N Bloqueo
Franja 1---N Reserva
Reserva 1---N ReservaAudit
```

---

## 6. Reglas de Negocio (RN)

- **RN1**: Una mesa solo puede tener una reserva CONFIRMADA por franja/fecha.
- **RN2**: Reserva ONLINE solo asigna mesas visibles y no bloqueadas.
- **RN3**: Si comensales > capacidad mesa => rechazo salvo reserva manual con flag `force=true`.
- **RN4**: Cambios de comensales recalculan asignación; si falla, pasa a waitlist.
- **RN5**: Bloqueos TOTAL impiden incluso asignaciones manuales.
- **RN6**: Eventos de Sala (`ORDER_STARTED`) bloquean mesa en franja abierta; `ORDER_CLOSED` libera si no existe reserva posterior.
- **RN7**: Cancelación < 30 min marca `NO_SHOW` y notifica.
- **RN8**: Auto liberación: si cliente no confirma SMS en `hold-timeout` pasa a waitlist.

---

## 7. Flujos Clave

### 7.1 Reserva Online
1. Cliente envía solicitud (fecha, franja, comensales, contacto).
2. Servicio ejecuta `AllocationEngine`:
   - Filtra mesas activas, visibles, sin bloqueo y sin reserva en franja.
   - Ordena por capacidad mínima suficiente.
   - Toma la primera mesa libre.
3. Crea reserva `PENDIENTE`, genera `codigo` y envía evento `reserva.created`.
4. Si no hay mesa: añade a waitlist con prioridad `comensales` ascendente.

### 7.2 Reserva Manual (Owner/Gerente)
- Permite seleccionar mesa específica, saltar bloqueos ONLINE, forzar capacidad (debe justificar en `notas`).
- Cambios de mesa actualizan historial y envían evento `reserva.updated`.

### 7.3 Modificación / Cancelación
- Cambios validan RN1-RN6.
- Cancelación libera mesa y publica `reserva.cancelled`.
- `NO_SHOW` se marca tras evento `mesa.noactivity` o confirmación manual.

### 7.4 Bloqueos automáticos desde Sala
1. Micro Sala publica `sala.order.started` con `mesaId`, `fecha`, `hora`.
2. Reservas-service identifica franja activa y crea bloqueo tipo `EVENTO_AUTO`.
3. Si hay reserva manual confirmada, se mantiene pero se marca `OCUPADA`.
4. `sala.order.closed` elimina bloqueo si no existe otra reserva en curso.

---

## 8. Contrato REST API

### Headers Requeridos
- `Authorization: Bearer <JWT>` (obligatorio salvo `/public/reservas`)
- `Content-Type: application/json`

### 8.1 Salas

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/salas` | Crear sala | OWNER |
| GET | `/salas` | Listar salas | OWNER, MANAGER |
| GET | `/salas/{id}` | Detalle sala + layout | OWNER, MANAGER |
| PUT | `/salas/{id}` | Actualizar | OWNER |
| DELETE | `/salas/{id}` | Desactivar (soft) | OWNER |

**POST /salas**
```json
{
  "nombre": "Principal",
  "capacidadMaxima": 60,
  "layout": {
    "ancho": 500,
    "alto": 300,
    "vertices": [[0,0],[500,0],[500,300],[0,300]]
  }
}
```

### 8.2 Mesas

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/salas/{salaId}/mesas` | Crear mesa | OWNER |
| GET | `/salas/{salaId}/mesas` | Listar | OWNER, MANAGER |
| PATCH | `/mesas/{id}` | Actualizar estado/capacidad/posición | OWNER |
| POST | `/mesas/{id}/bloqueos` | Crear bloqueo | OWNER, MANAGER |
| DELETE | `/mesas/{id}/bloqueos/{bloqueoId}` | Quitar bloqueo | OWNER, MANAGER |

### 8.3 Franjas

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/franjas` | Crear franja | OWNER |
| GET | `/franjas` | Listar | OWNER, MANAGER |
| PUT | `/franjas/{id}` | Actualizar | OWNER |
| DELETE | `/franjas/{id}` | Soft delete | OWNER |

### 8.4 Reservas (Privado)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/reservas?fecha=2026-03-05&franjaId=...&estado=CONFIRMADA` | Listado paginado | OWNER, MANAGER |
| POST | `/reservas` | Crear manual | OWNER, MANAGER |
| PATCH | `/reservas/{id}` | Modificar | OWNER, MANAGER |
| POST | `/reservas/{id}/confirmar` | Confirmar llegada | OWNER, MANAGER, WAITER |
| POST | `/reservas/{id}/noshow` | Marcar no show | OWNER, MANAGER, WAITER |
| DELETE | `/reservas/{id}` | Cancelar | OWNER, MANAGER |

### 8.5 Reservas Públicas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/public/reservas/consultar` | Ver disponibilidad |
| POST | `/public/reservas` | Crear reserva online (pendiente) |
| GET | `/public/reservas/{codigo}` | Consultar estado |

**POST /public/reservas**
```json
{
  "fecha": "2026-03-05",
  "franjaId": "uuid-franja",
  "comensales": 4,
  "nombre": "Laura",
  "telefono": "+34 600000000",
  "email": "laura@correo.com",
  "preferencias": "Ventana"
}
```

**Response 201**
```json
{
  "codigo": "RSV-9F3A",
  "estado": "PENDIENTE",
  "mesaAsignada": 12,
  "fecha": "2026-03-05",
  "franja": {
    "id": "uuid",
    "horaInicio": "13:00",
    "horaFin": "14:30"
  }
}
```

### 8.6 Waitlist

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/waitlist?fecha=...&franjaId=...` | Listar cola | OWNER, MANAGER |
| POST | `/waitlist/{entryId}/notificar` | Lanzar notificación | OWNER, MANAGER |
| DELETE | `/waitlist/{entryId}` | Cancelar entrada | OWNER, MANAGER |

### 8.7 Respuestas de Error
```json
{
  "error": "NO_CAPACITY",
  "message": "No hay mesas disponibles para 6 comensales",
  "timestamp": "2026-03-02T19:00:00Z",
  "details": []
}
```

---

## 9. Contrato Eventos Redis

### 9.1 Entrantes (Stream `sala.events`)

#### Evento `sala.order.started`
```json
{
  "eventId": "uuid",
  "type": "sala.order.started",
  "timestamp": "2026-03-05T13:05:00Z",
  "data": {
    "mesaId": "uuid",
    "fecha": "2026-03-05",
    "hora": "13:05",
    "comandaId": "uuid"
  }
}
```

Acciones: marcar mesa `OCUPADA`, crear bloqueo `EVENTO_AUTO`, notificar reservas conflictivas.

#### Evento `sala.order.closed`
Libera mesa si no hay otra reserva activa.

### 9.2 Salientes (Stream `reservas.events`)

| Tipo | Payload | Consumidores |
|------|---------|--------------|
| `reserva.created` | Datos reserva (estado, mesa, contacto) | Notificaciones, Sala, Analytics |
| `reserva.updated` | Cambios relevantes | Sala |
| `reserva.cancelled` | Motivo cancelación | Notificaciones |
| `mesa.blocked` | Bloqueos manuales/auto | Sala |
| `mesa.released` | Liberación mesas | Sala |
| `waitlist.promoted` | Cliente pasa de cola a reserva | Notificaciones |

Formato genérico:
```json
{
  "eventId": "uuid",
  "type": "reserva.created",
  "timestamp": "2026-03-05T11:00:00Z",
  "data": { ... },
  "metadata": {
    "traceId": "",
    "source": "reservas-service"
  }
}
```

Idempotencia: tabla `eventos_procesados`.

---

## 10. Seguridad y Autorización

- JWT firmado por PersonnelService (HS256). Se valida `iss`, `exp`, `role`.
- Roles soportados: OWNER, MANAGER, WAITER, CUSTOMER (solo en endpoints públicos)
- Tabla de permisos resumida:

| Acción | OWNER | MANAGER | WAITER | CLIENTE |
|--------|-------|---------|--------|---------|
| CRUD Salas/Mesas/Franjas | ✅ | ❌ | ❌ | ❌ |
| Crear reserva manual | ✅ | ✅ | ❌ | ❌ |
| Confirmar llegada | ✅ | ✅ | ✅ | ❌ |
| Cancelar reserva | ✅ | ✅ | ❌ | ✅ (sobre su código) |
| Consultar disponibilidad | ✅ | ✅ | ✅ | ✅ |
| Gestionar waitlist | ✅ | ✅ | ❌ | ❌ |

- Auditoría: cada cambio crea registro en `reserva_audit` con `userId`.

---

## 11. Observabilidad

- **Métricas**: `reservas_total{estado}`, `waitlist_size`, `allocation_time_ms`, `events_lag_ms`.
- **Logs**: estructura JSON, correlación por `traceId`.
- **Alerts**: si `allocation_time_ms > 500` percentil 95 o `events_lag_ms > 2000`.

---

## 12. Requisitos No Funcionales

- **SLA**: 99.5% uptime mensual.
- **Capacidad**: 100 req/s pico.
- **Latency**: P95 < 200 ms para reserva online.
- **Consistencia**: eventual con Sala vía eventos; transaccional para datos propios.
- **Backups**: snapshot PostgreSQL diario + WAL cada hora.
- **Retención eventos**: 7 días en Redis Streams, archivado en S3.

---

## 13. Plan de Pruebas

- **Unitarias**: AllocationEngine, validaciones RN.
- **Integración**: REST controllers + repos.
- **Contratos**: Pact con micro Sala para eventos.
- **Carga**: 200 reservas/minuto durante 30 min.

---

## 14. Dependencias Maven (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.redisson</groupId>
        <artifactId>redisson</artifactId>
        <version>3.37.0</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 15. Scripts Iniciales

- Ver `docs/reservas/reservas-schema.sql` para DDL completo.
- Seed recomendada: al menos una sala, 5 mesas, 3 franjas.

---

## 16. Roadmap Futuro

- Join Tables automático (unir mesas en runtime).
- Motor de recomendaciones basado en ocupación histórica.
- Integración con pagos para reservar con señal.
- Integración push notifications (WhatsApp/SMS) vía micro Notificaciones.
