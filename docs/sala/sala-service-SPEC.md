# Micro SERVICIO SALA - Especificación Técnica

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | SalaService |
| **Puerto** | 8083 |
| **Context Path** | `/api/sala` |
| **Base de datos** | PostgreSQL (`localhost:5432/sala`) |
| **Eventos** | Redis Streams (`localhost:6379`) |

---

## 2. Stack Tecnológico

- **Framework**: Spring Boot 3.5.11
- **Lenguaje**: Java 21
- **Build**: Maven
- **Arquitectura**: Hexagonal (Puertos y Adaptadores)
- **Persistencia**: Spring Data JPA + Hibernate
- **Cache / Cola**: Redis Streams (event sourcing)
- **Seguridad**: Spring Security 6 + JWT (tokens emitidos por PersonnelService)
- **Validación**: Jakarta Bean Validation
- **Observabilidad**: Micrometer + Prometheus

---

## 3. Propósito y Responsabilidad

El microservicio de **Sala** gestiona toda la **operativa de servicio** en el restaurante:

- **Comandas**: Creación y gestión de pedidos por mesa
- **Pedidos**: Items individuales dentro de una comanda
- **Estados de mesa**: LIBRE, OCUPADA, PIDIENDO, SERVIDA, CUENTA, COBRADA
- **Cuentas**: Cálculo de totales, aplicación de descuentos
- **Eventos en tiempo real**: Notificaciones de estado a reservas y carta

**Flujo de trabajo típico**:
```
Cliente llega → Mesa OCUPADA → Comanda abierta → Pedidos agregados
→ Cocina prepara → Pedidos SERVIDOS → Cliente pide cuenta
→ Mesa CUENTA → Pago procesado → Mesa COBRADA → Mesa LIBRE
```

---

## 4. Configuración (application.yml)

```yaml
server:
  port: 8083
  servlet:
    context-path: /api/sala

spring:
  application:
    name: sala-service
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/sala}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  data:
    redis:
      host: ${SPRING_DATA_REDIS_HOST:localhost}
      port: ${SPRING_DATA_REDIS_PORT:6379}
      timeout: 2000

app:
  jwt:
    issuer: ${APP_JWT_ISSUER:personnel-service}
    audience: ${APP_JWT_AUDIENCE:sala-service}
    secret: ${APP_JWT_SECRET:SuperSecretKeyQueEsMuyLargaYSegura2024ParaProduccion}
    allowed-roles: ${APP_JWT_ALLOWED_ROLES:OWNER,MANAGER,WAITER}
  security:
    bcrypt-strength: 12
  redis:
    stream-input: ${APP_REDIS_STREAM_INPUT:reservas.events}
    stream-output: ${APP_REDIS_STREAM_OUTPUT:sala.events}
    consumer-group: ${APP_REDIS_CONSUMER_GROUP:sala-group}
  comanda:
    tiempo-maximo-preparacion-minutos: ${APP_COMANDA_TIEMPO_MAXIMO:45}
    auto-cierre-cuenta-minutos: ${APP_COMANDA_AUTO_CIERRE:180}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

---

## 5. Arquitectura de Paquetes

```
com.suances.sala
├── SalaApplication.java
├── config/
│   ├── RedisConfig.java
│   ├── SecurityConfig.java
│   └── OpenApiConfig.java
├── controller/
│   ├── ComandaController.java
│   ├── PedidoController.java
│   ├── MesaOperativaController.java
│   └── CuentaController.java
├── service/
│   ├── ComandaService.java
│   ├── PedidoService.java
│   ├── MesaOperativaService.java
│   └── CuentaService.java
├── repository/
│   ├── ComandaRepository.java
│   ├── PedidoRepository.java
│   ├── MesaOperativaRepository.java
│   └── EventoProcesadoRepository.java
├── domain/
│   ├── model/
│   │   ├── Comanda.java
│   │   ├── Pedido.java
│   │   ├── MesaOperativa.java
│   │   └── EventoProcesado.java
│   └── enums/
│       ├── ComandaEstado.java
│       ├── PedidoEstado.java
│       ├── MesaEstadoOperativo.java
│       └── TipoPago.java
├── dto/
│   ├── request/
│   └── response/
├── event/
│   ├── ReservasEventConsumer.java
│   ├── SalaEventProducer.java
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

## 6. Modelo de Dominio

### 6.1 Entidades

#### Comanda
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `mesa_id` | UUID | Referencia a mesa en reservas-service |
| `camarero_id` | UUID | Referencia a usuario en personnel-service |
| `codigo` | VARCHAR(20) | Código único de comanda (ej: CMD-1234) |
| `estado` | ENUM | ABIERTA, EN_PREPARACION, SERVIDA, CUENTA, COBRADA, CANCELADA |
| `numero_comensales` | SMALLINT | Cantidad de personas en la mesa |
| `notas` | TEXT | Observaciones generales |
| `total` | DECIMAL(10,2) | Total calculado de la cuenta |
| `descuento_porcentaje` | DECIMAL(5,2) | Descuento aplicado (%) |
| `fecha_apertura` | TIMESTAMP | Cuándo se abrió la comanda |
| `fecha_cierre` | TIMESTAMP | Cuándo se cerró/cobró |
| `created_at` | TIMESTAMP | Auditoría |
| `updated_at` | TIMESTAMP | Auditoría |

#### Pedido
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `comanda_id` | UUID | FK a Comanda |
| `plato_id` | UUID | Referencia a plato en carta-service |
| `cantidad` | SMALLINT | Cantidad pedida |
| `precio_unitario` | DECIMAL(10,2) | Precio en momento del pedido |
| `estado` | ENUM | PENDIENTE, EN_PREPARACION, LISTO, SERVIDO, CANCELADO |
| `notas` | TEXT | Modificaciones/alergias |
| `hora_pedido` | TIMESTAMP | Cuándo se tomó |
| `hora_listo` | TIMESTAMP | Cuándo estuvo listo (cocina) |
| `hora_servido` | TIMESTAMP | Cuándo se sirvió |
| `created_at` | TIMESTAMP | Auditoría |

#### MesaOperativa (Vista sincronizada)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Mismo ID que en reservas-service |
| `numero` | INTEGER | Número de mesa |
| `sala_id` | UUID | Referencia a sala en reservas-service |
| `estado_operativo` | ENUM | LIBRE, OCUPADA, PIDIENDO, SERVIDA, CUENTA, COBRADA |
| `comanda_activa_id` | UUID | FK a comanda actual (si existe) |
| `ultima_actualizacion` | TIMESTAMP | Para sincronización |
| `camarero_asignado_id` | UUID | Camarero responsable |

#### EventoProcesado (Idempotencia)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event_id` | UUID | PK - ID del evento recibido |
| `processed_at` | TIMESTAMP | Cuándo se procesó |
| `tipo_evento` | VARCHAR(50) | Tipo para debugging |

---

## 7. Estados y Flujos

### 7.1 Estados de Comanda

```
ABIERTA → EN_PREPARACION → SERVIDA → CUENTA → COBRADA
   ↓          ↓                ↓         ↓
CANCELADA  (algún pedido    (todos     (cliente
            cancelado)      servidos)   pide cuenta)
```

**Transiciones permitidas**:
- ABIERTA → EN_PREPARACION: Al primer pedido en preparación
- ABIERTA → CANCELADA: Si no hay pedidos servidos
- EN_PREPARACION → SERVIDA: Todos los pedidos servidos
- SERVIDA → CUENTA: Cliente solicita cuenta
- CUENTA → COBRADA: Pago procesado
- CUENTA → ABIERTA: Cliente agrega más pedidos

### 7.2 Estados de Pedido

```
PENDIENTE → EN_PREPARACION → LISTO → SERVIDO
    ↓              ↓            ↓
CANCELADO     (cocina      (camarero
               inicia)      sirve)
```

### 7.3 Estados de Mesa Operativa

```
LIBRE → OCUPADA → PIDIENDO → SERVIDA → CUENTA → COBRADA → LIBRE
 ↑       ↓          ↓           ↓         ↓         ↓
 └───────┴──────────┴───────────┴─────────┴─────────┘ (eventos externos)
```

---

## 8. Reglas de Negocio (RN)

### Comandas
- **RN1**: Solo una comanda ABIERTA por mesa
- **RN2**: Comanda en estado COBRADA es inmutable (solo lectura)
- **RN3**: Cancelación solo permitida si no hay pedidos SERVIDOS
- **RN4**: Auto-cierre después de X horas de inactividad

### Pedidos
- **RN5**: Precio unitario se congela al momento del pedido (no cambia si carta se actualiza)
- **RN6**: Cancelación de pedido solo antes de estado SERVIDO
- **RN7**: Tiempo máximo de preparación configurable por plato (futuro)

### Mesas
- **RN8**: Transiciones de estado validadas según comanda activa
- **RN9**: Eventos de reservas actualizan estado automáticamente

### Cuentas
- **RN10**: Total = Σ(pedidos no cancelados × precio unitario)
- **RN11**: Descuentos aplicables solo en estado CUENTA
- **RN12**: Split de cuenta permitido (futuro)

---

## 9. Contrato REST API

### 9.1 Headers Requeridos
```
Authorization: Bearer <JWT>
Content-Type: application/json
```

### 9.2 Endpoints - Comandas

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/comandas` | Abrir nueva comanda | WAITER, MANAGER, OWNER |
| GET | `/comandas` | Listar comandas activas | WAITER, MANAGER, OWNER |
| GET | `/comandas/{id}` | Detalle de comanda | WAITER, MANAGER, OWNER |
| PATCH | `/comandas/{id}/estado` | Cambiar estado | WAITER, MANAGER, OWNER |
| POST | `/comandas/{id}/cerrar` | Cerrar comanda (CUENTA) | WAITER, MANAGER, OWNER |
| POST | `/comandas/{id}/cobrar` | Procesar cobro | WAITER, MANAGER, OWNER |
| DELETE | `/comandas/{id}` | Cancelar comanda | MANAGER, OWNER |

**POST /comandas**
```json
{
  "mesaId": "uuid-mesa",
  "camareroId": "uuid-camarero",
  "numeroComensales": 4,
  "notas": "Mesa junto a ventana"
}
```

**Response 201**
```json
{
  "id": "uuid-comanda",
  "codigo": "CMD-9F3A",
  "mesaId": "uuid-mesa",
  "camareroId": "uuid-camarero",
  "estado": "ABIERTA",
  "numeroComensales": 4,
  "notas": "Mesa junto a ventana",
  "total": 0.00,
  "fechaApertura": "2026-03-07T13:00:00Z"
}
```

### 9.3 Endpoints - Pedidos

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/comandas/{comandaId}/pedidos` | Agregar pedido | WAITER, MANAGER, OWNER |
| GET | `/comandas/{comandaId}/pedidos` | Listar pedidos | WAITER, MANAGER, OWNER |
| PATCH | `/pedidos/{id}/estado` | Actualizar estado | WAITER, MANAGER, OWNER |
| DELETE | `/pedidos/{id}` | Cancelar pedido | WAITER, MANAGER, OWNER |

**POST /comandas/{comandaId}/pedidos**
```json
{
  "platoId": "uuid-plato",
  "cantidad": 2,
  "notas": "Sin cebolla, uno sin gluten"
}
```

**Response 201**
```json
{
  "id": "uuid-pedido",
  "comandaId": "uuid-comanda",
  "platoId": "uuid-plato",
  "nombrePlato": "Ensalada Mixta",
  "cantidad": 2,
  "precioUnitario": 12.50,
  "estado": "PENDIENTE",
  "notas": "Sin cebolla, uno sin gluten",
  "horaPedido": "2026-03-07T13:05:00Z"
}
```

### 9.4 Endpoints - Mesas Operativas

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/mesas` | Listar mesas con estado | WAITER, MANAGER, OWNER |
| GET | `/mesas/{id}` | Detalle mesa + comanda activa | WAITER, MANAGER, OWNER |
| PATCH | `/mesas/{id}/estado` | Cambiar estado manual | MANAGER, OWNER |
| POST | `/mesas/{id}/asignar-camarero` | Asignar camarero | MANAGER, OWNER |

**GET /mesas**
```json
[
  {
    "id": "uuid-mesa",
    "numero": 12,
    "salaId": "uuid-sala",
    "estadoOperativo": "OCUPADA",
    "comandaActivaId": "uuid-comanda",
    "camareroAsignadoId": "uuid-camarero",
    "nombreCamarero": "Jorge García"
  }
]
```

### 9.5 Endpoints - Cuenta

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/comandas/{id}/cuenta` | Ver cuenta detallada | WAITER, MANAGER, OWNER |
| POST | `/comandas/{id}/descuento` | Aplicar descuento | MANAGER, OWNER |

**GET /comandas/{id}/cuenta**
```json
{
  "comandaId": "uuid-comanda",
  "codigo": "CMD-9F3A",
  "mesaNumero": 12,
  "items": [
    {
      "pedidoId": "uuid-pedido",
      "nombrePlato": "Ensalada Mixta",
      "cantidad": 2,
      "precioUnitario": 12.50,
      "subtotal": 25.00
    }
  ],
  "subtotal": 25.00,
  "descuentoPorcentaje": 10.00,
  "descuentoMonto": 2.50,
  "total": 22.50,
  "fechaApertura": "2026-03-07T13:00:00Z",
  "tiempoTranscurridoMinutos": 45
}
```

---

## 10. Contrato Eventos Redis

### 10.1 Eventos Entrantes (Stream: `reservas.events`)

Consumidos por: `ReservasEventConsumer`

#### `reserva.created`
```json
{
  "eventId": "uuid",
  "type": "reserva.created",
  "timestamp": "2026-03-07T13:00:00Z",
  "data": {
    "reservaId": "uuid",
    "mesaId": "uuid",
    "codigo": "RSV-9F3A",
    "estado": "CONFIRMADA",
    "fecha": "2026-03-07",
    "franjaId": "uuid",
    "comensales": 4,
    "nombreCliente": "Laura",
    "telefono": "+34 600000000"
  }
}
```
**Acción**: Pre-bloquear mesa, preparar vista para llegada del cliente

#### `reserva.updated`
```json
{
  "eventId": "uuid",
  "type": "reserva.updated",
  "timestamp": "2026-03-07T13:00:00Z",
  "data": {
    "reservaId": "uuid",
    "mesaId": "uuid",
    "estadoAnterior": "CONFIRMADA",
    "estadoNuevo": "CANCELADA"
  }
}
```
**Acción**: Actualizar estado de mesa operativa

#### `reserva.cancelled`
```json
{
  "eventId": "uuid",
  "type": "reserva.cancelled",
  "timestamp": "2026-03-07T13:00:00Z",
  "data": {
    "reservaId": "uuid",
    "mesaId": "uuid",
    "codigo": "RSV-9F3A",
    "motivo": "CLIENTE"
  }
}
```
**Acción**: Liberar mesa si no hay comanda activa

#### `mesa.blocked`
```json
{
  "eventId": "uuid",
  "type": "mesa.blocked",
  "timestamp": "2026-03-07T13:00:00Z",
  "data": {
    "mesaId": "uuid",
    "tipo": "TOTAL",
    "motivo": "Mantenimiento",
    "fechaDesde": "2026-03-07",
    "fechaHasta": "2026-03-07"
  }
}
```
**Acción**: Marcar mesa como no disponible para nuevas comandas

### 10.2 Eventos Salientes (Stream: `sala.events`)

Producidos por: `SalaEventProducer`

#### `sala.comanda.abierta`
```json
{
  "eventId": "uuid",
  "type": "sala.comanda.abierta",
  "timestamp": "2026-03-07T13:00:00Z",
  "data": {
    "comandaId": "uuid",
    "mesaId": "uuid",
    "codigo": "CMD-9F3A",
    "camareroId": "uuid",
    "numeroComensales": 4,
    "horaApertura": "2026-03-07T13:00:00Z"
  }
}
```

#### `sala.pedido.creado`
```json
{
  "eventId": "uuid",
  "type": "sala.pedido.creado",
  "timestamp": "2026-03-07T13:05:00Z",
  "data": {
    "pedidoId": "uuid",
    "comandaId": "uuid",
    "mesaId": "uuid",
    "platoId": "uuid",
    "cantidad": 2,
    "horaPedido": "2026-03-07T13:05:00Z"
  }
}
```

#### `sala.pedido.estado-cambiado`
```json
{
  "eventId": "uuid",
  "type": "sala.pedido.estado-cambiado",
  "timestamp": "2026-03-07T13:15:00Z",
  "data": {
    "pedidoId": "uuid",
    "comandaId": "uuid",
    "estadoAnterior": "EN_PREPARACION",
    "estadoNuevo": "LISTO",
    "horaCambio": "2026-03-07T13:15:00Z"
  }
}
```

#### `sala.mesa.estado-cambiado`
```json
{
  "eventId": "uuid",
  "type": "sala.mesa.estado-cambiado",
  "timestamp": "2026-03-07T13:00:00Z",
  "data": {
    "mesaId": "uuid",
    "estadoAnterior": "LIBRE",
    "estadoNuevo": "OCUPADA",
    "comandaId": "uuid"
  }
}
```

#### `sala.cuenta.cerrada`
```json
{
  "eventId": "uuid",
  "type": "sala.cuenta.cerrada",
  "timestamp": "2026-03-07T14:30:00Z",
  "data": {
    "comandaId": "uuid",
    "mesaId": "uuid",
    "codigo": "CMD-9F3A",
    "total": 45.50,
    "descuento": 0.00,
    "horaApertura": "2026-03-07T13:00:00Z",
    "horaCierre": "2026-03-07T14:30:00Z",
    "duracionMinutos": 90
  }
}
```

---

## 11. Seguridad y Autorización

### 11.1 JWT Claims
```json
{
  "sub": "uuid-usuario",
  "iss": "personnel-service",
  "aud": "sala-service",
  "iat": 1708711200,
  "exp": 1708797600,
  "name": "Jorge García",
  "role": "WAITER"
}
```

### 11.2 Matriz de Permisos

| Acción | OWNER | MANAGER | WAITER |
|--------|-------|---------|--------|
| CRUD Comandas | ✅ | ✅ | ✅ |
| Cancelar Comanda | ✅ | ✅ | ❌ |
| Cambiar estado mesa | ✅ | ✅ | ❌ |
| Aplicar descuentos | ✅ | ✅ | ❌ |
| Asignar camareros | ✅ | ✅ | ❌ |
| Ver todas las mesas | ✅ | ✅ | ✅ |
| Cobrar cuenta | ✅ | ✅ | ✅ |

---

## 12. Dependencias Maven (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.11</version>
    </parent>
    
    <groupId>com.suances</groupId>
    <artifactId>sala-service</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    
    <properties>
        <java.version>21</java.version>
        <jjwt.version>0.12.3</jjwt.version>
        <springdoc.version>2.6.0</springdoc.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
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
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- PostgreSQL -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Utilidades -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 13. Códigos de Error

| Código | Significado | Uso |
|--------|-------------|-----|
| 400 | Bad Request | Validación de campos |
| 401 | Unauthorized | JWT inválido o ausente |
| 403 | Forbidden | Rol sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Mesa ya ocupada, comanda ya existe |
| 422 | Unprocessable | Regla de negocio violada |

**Formato Error**:
```json
{
  "error": "MESA_OCUPADA",
  "message": "La mesa 12 ya tiene una comanda activa",
  "timestamp": "2026-03-07T13:00:00Z",
  "details": []
}
```

---

## 14. Métricas y Observabilidad

### Métricas Clave
- `comandas_abiertas_total`: Gauge de comandas activas
- `comandas_cobradas_total`: Counter por día
- `tiempo_promedio_comanda_minutes`: Histograma
- `pedidos_por_estado`: Gauge por estado
- `eventos_procesados_total`: Counter
- `eventos_lag_ms`: Tiempo entre emisión y procesamiento

### Logs Estructurados
```json
{
  "timestamp": "2026-03-07T13:00:00Z",
  "level": "INFO",
  "service": "sala-service",
  "traceId": "uuid",
  "message": "Comanda abierta",
  "comandaId": "uuid",
  "mesaId": "uuid",
  "camareroId": "uuid"
}
```

---

## 15. Roadmap

### Fase 1 - MVP (Actual)
- Comandas básicas (CRUD)
- Pedidos simples
- Estados de mesa
- Eventos básicos

### Fase 2 - Mejoras
- Split de cuenta
- Pagos parciales
- Historial de comandas
- Reportes de camareros

### Fase 3 - Avanzado
- Integración con TPV
- Módulo de cocina (pantallas)
- Notificaciones push
- Analytics de ventas

---

**Versión**: 1.0.0  
**Última actualización**: 2026-03-07  
**Autor**: Equipo Suances
