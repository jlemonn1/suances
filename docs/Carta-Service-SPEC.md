# Micro SERVICIO CARTA - Especificación Técnica

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | CartaService |
| **Puerto** | 8081 |
| **Context Path** | /api/carta |
| **Base de datos** | PostgreSQL (localhost:5432/carta) |
| **Cache/Eventos** | Redis (localhost:6379) |

---

## 2. Stack Tecnológico

- **Framework**: Spring Boot 3.2.x
- **Lenguaje**: Java 17
- **Build**: Maven
- **ORM**: Spring Data JPA + Hibernate
- **Seguridad**: Spring Security + JWT (jjwt-library)
- **Validación**: Jakarta Bean Validation
- **Base de datos**: PostgreSQL
- **Redis**: Streams para eventos, pub/sub para alertas

---

## 3. Configuración (application.yml)

```yaml
server:
  port: 8081

spring:
  application:
    name: carta-service
  datasource:
    url: jdbc:postgresql://localhost:5432/carta
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
    stream-output: carta.events
    group: carta-group

logging:
  level:
    root: INFO
    com.suances.carta: DEBUG
```

---

## 4. Modelo de Datos

### 4.1 Entidades

#### Distribuidor
```java
@Table(name = "distribuidores")
- id: UUID (PK)
- nombre: VARCHAR(255) NOT NULL
- email: VARCHAR(255) NULL
- telefono: VARCHAR(50) NULL
- descripcion: TEXT NULL
- activo: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP

Constraints:
- nombre NOT NULL
- CHECK (email IS NOT NULL OR telefono IS NOT NULL)
```

#### Ingrediente
```java
@Table(name = "ingredientes")
- id: UUID (PK)
- nombre: VARCHAR(255) NOT NULL
- unidad_medida: VARCHAR(20) NOT NULL  // ENUM: GRAMO, ML, UNIDAD
- precio_por_unidad: DECIMAL(10,4) NOT NULL
- stock_actual: DECIMAL(10,4) DEFAULT 0
- umbral_alerta: DECIMAL(10,4) NOT NULL
- activo: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

Constraints:
- nombre NOT NULL
- unidad_medida IN ('GRAMO', 'ML', 'UNIDAD')
- precio_por_unidad >= 0
```

#### IngredienteDistribuidor (Relación N:N)
```java
@Table(name = "ingrediente_distribuidor")
- ingrediente_id: UUID (PK, FK)
- distribuidor_id: UUID (PK, FK)
- precio_personalizado: DECIMAL(10,4) NULL  // Futuro uso
```

#### Plato
```java
@Table(name = "platos")
- id: UUID (PK)
- nombre: VARCHAR(255) NOT NULL
- descripcion: TEXT NULL
- precio_venta: DECIMAL(10,2) NOT NULL
- contador_pedidos: BIGINT DEFAULT 0
- activo: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP

Constraints:
- nombre NOT NULL
- precio_venta > 0
```

#### PlatoImagen
```java
@Table(name = "platos_imagenes")
- id: UUID (PK)
- plato_id: UUID (FK)
- url: VARCHAR(500) NOT NULL
- orden: INTEGER DEFAULT 0
```

#### Escandallo
```java
@Table(name = "escandallos")
- id: UUID (PK)
- plato_id: UUID (UNIQUE, FK)
- nombre_version: VARCHAR(100) NOT NULL
- coste_total_snapshot: DECIMAL(10,4) NOT NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

Constraints:
- plato_id UNIQUE
```

#### EscandalloDetalle
```java
@Table(name = "escandallo_detalles")
- id: UUID (PK)
- escandallo_id: UUID (FK)
- ingrediente_id: UUID (FK)
- cantidad: DECIMAL(10,4) NOT NULL

Constraints:
- cantidad > 0
```

#### TipoCarta
```java
@Table(name = "tipos_carta")
- id: UUID (PK)
- nombre: VARCHAR(100) NOT NULL
- hora_inicio: TIME NOT NULL
- hora_fin: TIME NOT NULL
- activo: BOOLEAN DEFAULT TRUE

Constraints:
- hora_inicio < hora_fin
- No solapamiento con otros tipos activos
```

#### TipoCartaPlato (Relación N:N)
```java
@Table(name = "tipo_carta_plato")
- tipo_carta_id: UUID (PK, FK)
- plato_id: UUID (PK, FK)
```

#### EventosProcesados (Idempotencia)
```java
@Table(name = "eventos_procesados")
- event_id: UUID (PK)
- processed_at: TIMESTAMP
```

---

## 5. Contrato REST API

### Headers Requeridos
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Endpoints

#### INGREDIENTES

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | /ingredientes | Crear ingrediente | PROPIETARIO |
| GET | /ingredientes | Listar ingredientes | TODOS |
| GET | /ingredientes/{id} | Obtener ingrediente | TODOS |
| PUT | /ingredientes/{id} | Editar ingrediente | PROPIETARIO |
| DELETE | /ingredientes/{id} | Soft delete | PROPIETARIO |
| POST | /ingredientes/{id}/distribuidores | Asociar distribuidor | PROPIETARIO |
| DELETE | /ingredientes/{id}/distribuidores/{distId} | Desasociar | PROPIETARIO |

**POST /ingredientes**
```json
Request:
{
  "nombre": "Tomate",
  "unidadMedida": "GRAMO",
  "precioPorUnidad": 0.004,
  "stockActual": 10000,
  "umbralAlerta": 2000
}

Response 201:
{
  "id": "uuid",
  "nombre": "Tomate",
  "unidadMedida": "GRAMO",
  "precioPorUnidad": 0.004,
  "stockActual": 10000,
  "umbralAlerta": 2000,
  "activo": true,
  "createdAt": "2026-02-23T10:00:00Z"
}
```

**GET /ingredientes?activo=true**
```json
Response 200:
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 10
}
```

#### DISTRIBUIDORES

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | /distribuidores | Crear distribuidor | PROPIETARIO |
| GET | /distribuidores | Listar distribuidores | PROPIETARIO |
| GET | /distribuidores/{id} | Obtener distribuidor | PROPIETARIO |
| PUT | /distribuidores/{id} | Editar distribuidor | PROPIETARIO |
| DELETE | /distribuidores/{id} | Soft delete | PROPIETARIO |

**POST /distribuidores**
```json
Request:
{
  "nombre": "Proveedor Norte",
  "email": "contacto@proveedor.com",
  "telefono": null,
  "descripcion": "Proveedor principal"
}
```

#### PLATOS

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | /platos | Crear plato | PROPIETARIO |
| GET | /platos | Listar platos | TODOS |
| GET | /platos/{id} | Obtener plato con margen | TODOS |
| PUT | /platos/{id} | Editar plato | PROPIETARIO |
| DELETE | /platos/{id} | Soft delete | PROPIETARIO |

**POST /platos**
```json
Request:
{
  "nombre": "Ensalada Mixta",
  "descripcion": "Lechuga, tomate y cebolla",
  "precioVenta": 12.50
}

Response 201:
{
  "id": "uuid",
  "nombre": "Ensalada Mixta",
  "descripcion": "Lechuga, tomate y cebolla",
  "precioVenta": 12.50,
  "contadorPedidos": 0,
  "activo": true,
  "createdAt": "2026-02-23T10:00:00Z"
}
```

**GET /platos/{id}**
```json
Response 200:
{
  "id": "uuid",
  "nombre": "Ensalada Mixta",
  "descripcion": "Lechuga, tomate y cebolla",
  "precioVenta": 12.50,
  "costeTotal": 3.40,
  "margen": 0.728,
  "contadorPedidos": 45,
  "activo": true,
  "imagenes": [...]
}
```

#### ESCANDALLO

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | /platos/{platoId}/escandallo | Crear/Actualizar escandallo | PROPIETARIO |
| GET | /platos/{platoId}/escandallo | Obtener escandallo | TODOS |
| DELETE | /platos/{platoId}/escandallo | Eliminar escandallo | PROPIETARIO |

**POST /platos/{platoId}/escandallo**
```json
Request:
{
  "nombreVersion": "Base 2026",
  "ingredientes": [
    {"ingredienteId": "uuid1", "cantidad": 150},
    {"ingredienteId": "uuid2", "cantidad": 20}
  ]
}

Response 201:
{
  "platoId": "uuid",
  "nombreVersion": "Base 2026",
  "costeTotal": 3.40,
  "ingredientes": [
    {"ingredienteId": "uuid1", "nombre": "Tomate", "cantidad": 150, "coste": 0.60},
    {"ingredienteId": "uuid2", "nombre": "Aceite", "cantidad": 20, "coste": 0.40}
  ],
  "createdAt": "2026-02-23T10:00:00Z",
  "updatedAt": "2026-02-23T10:00:00Z"
}
```

#### TIPOS DE CARTA

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | /tipos-carta | Crear tipo carta | PROPIETARIO |
| GET | /tipos-carta | Listar tipos carta | PROPIETARIO |
| GET | /tipos-carta/{id} | Obtener tipo carta | PROPIETARIO |
| PUT | /tipos-carta/{id} | Editar tipo carta | PROPIETARIO |
| DELETE | /tipos-carta/{id} | Soft delete | PROPIETARIO |
| POST | /tipos-carta/{id}/platos | Asociar platos | PROPIETARIO |
| GET | /carta/activa | Obtener carta activa | TODOS |

**POST /tipos-carta**
```json
Request:
{
  "nombre": "Carta Comida",
  "horaInicio": "12:00",
  "horaFin": "16:00"
}

Response 201:
{
  "id": "uuid",
  "nombre": "Carta Comida",
  "horaInicio": "12:00:00",
  "horaFin": "16:00:00",
  "activo": true
}
```

**POST /tipos-carta/{id}/platos**
```json
Request:
{
  "platoIds": ["uuid1", "uuid2", "uuid3"]
}

Response 200:
{
  "tipoCartaId": "uuid",
  "platos": [...]
}
```

**GET /carta/activa**
```json
Response 200:
{
  "tipoCarta": {
    "id": "uuid",
    "nombre": "Carta Comida",
    "horaInicio": "12:00:00",
    "horaFin": "16:00:00"
  },
  "platos": [
    {
      "id": "uuid",
      "nombre": "Ensalada Mixta",
      "precioVenta": 12.50,
      "costeTotal": 3.40,
      "margen": 0.728,
      "imagenes": [...]
    }
  ],
  "timestamp": "2026-02-23T14:30:00Z"
}
```

---

## 6. Contrato Eventos Redis

### 6.1 Evento Entrada: sala.plato.pedido

**Stream**: `sala.events`  
**Consumer Group**: `carta-group`

```json
{
  "eventId": "uuid",
  "type": "sala.plato.pedido",
  "timestamp": "2026-02-23T21:10:00Z",
  "data": {
    "platoId": "uuid",
    "cantidad": 2
  }
}
```

**Procesamiento**:
1. Verificar eventId en `eventos_procesados`
2. Si existe → IGNORAR (ACK mensaje)
3. Si no existe:
   - Incrementar `contador_pedidos` del plato
   - Para cada ingrediente en escandallo:
     - `stock_actual = stock_actual - (cantidad * cantidad_escandallo)`
     - Si `stock_previo >= umbral AND stock_actual < umbral`:
       - Emitir evento `ingrediente.stock.bajo`
   - Insertar en `eventos_procesados`
4. ACK mensaje

### 6.2 Evento Salida: carta.events

**Stream**: `carta.events`

```json
{
  "eventId": "uuid",
  "type": "ingrediente.stock.bajo",
  "timestamp": "2026-02-23T21:10:00Z",
  "data": {
    "ingredienteId": "uuid",
    "ingredienteNombre": "Tomate",
    "stockActual": 1500,
    "umbral": 2000
  }
}
```

---

## 7. Seguridad JWT

### 7.1 Estructura del Token

```json
{
  "sub": "userId",
  "name": "Nombre Usuario",
  "role": "PROPIETARIO | GERENTE | CAMARERO",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### 7.2 Reglas de Autorización

| Rol | Permisos |
|-----|----------|
| **PROPIETARIO** | Acceso total: CRUD ingredientes, distribuidores, platos, escandallos, tipos-carta |
| **GERENTE** | Lectura total + gestión básica (sin cambiar precios ni escandallos) |
| **CAMARERO** | Solo lectura: GET /carta/activa, GET /platos, GET /ingredientes |

### 7.3 Errores de Seguridad

```
401 Unauthorized → Token no válido o ausente
403 Forbidden → Token válido pero rol sin permisos
```

---

## 8. Códigos de Error

| Código | Significado | Uso |
|--------|-------------|-----|
| 400 | Bad Request | Validación de campos |
| 401 | Unauthorized | JWT inválido o ausente |
| 403 | Forbidden | Rol sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Solapamiento horario |
| 422 | Unprocessable | Regla de negocio |

### Formato Error
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Descripción clara del error",
  "timestamp": "2026-02-23T10:00:00Z",
  "details": [...]
}
```

---

## 9. Reglas de Negocio Críticas

### 9.1 Cambio de Precio Ingrediente
- Al actualizar `precio_por_unidad` de un ingrediente:
  - Buscar todos los `EscandalloDetalle` con ese `ingrediente_id`
  - Recalcular `coste_total_snapshot` de cada `Escandallo`
  - Actualizar `updated_at`

### 9.2 Alerta de Stock Bajo
- Solo se emite cuando:
  - `stock_previo >= umbral_alerta` AND
  - `stock_actual < umbral_alerta`
- No se repite hasta que el stock vuelva a estar por encima del umbral

### 9.3 Margen Calculado
- Se calcula dinámicamente: `(precio_venta - coste_total) / precio_venta`
- NO se almacena en BD

### 9.4 Solo un Tipo de Carta Activo
- Al activar un TipoCarta, se desactivan los demás
- Validar no solapamiento de horarios

---

## 10. Estructura de Paquetes

```
com.suances.carta
├── CartaApplication.java
├── config/
│   ├── RedisConfig.java
│   ├── SecurityConfig.java
│   └── JwtConfig.java
├── controller/
│   ├── IngredienteController.java
│   ├── DistribuidorController.java
│   ├── PlatoController.java
│   ├── EscandalloController.java
│   ├── TipoCartaController.java
│   └── CartaController.java
├── service/
│   ├── IngredienteService.java
│   ├── DistribuidorService.java
│   ├── PlatoService.java
│   ├── EscandalloService.java
│   ├── TipoCartaService.java
│   ├── CartaActivaService.java
│   └── EventoService.java
├── repository/
│   ├── IngredienteRepository.java
│   ├── DistribuidorRepository.java
│   ├── PlatoRepository.java
│   ├── EscandalloRepository.java
│   ├── TipoCartaRepository.java
│   └── EventoProcesadoRepository.java
├── domain/
│   ├── model/
│   │   ├── Ingrediente.java
│   │   ├── Distribuidor.java
│   │   ├── Plato.java
│   │   ├── Escandallo.java
│   │   └── ...
│   └── enums/
│       ├── UnidadMedida.java
│       └── Rol.java
├── dto/
│   ├── request/
│   └── response/
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── BusinessRuleException.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtAuthenticationEntryPoint.java
└── event/
    ├── SalaPedidoEvent.java
    ├── StockBajoEvent.java
    └── EventConsumer.java
```

---

## 11. Dependencias Maven (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot -->
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
    
    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- JWT -->
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
    
    <!-- Lombok -->
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
</dependencies>
```

---

## 12. Scripts de Inicialización

### 12.1 Crear Base de Datos
```sql
CREATE DATABASE carta;
```

### 12.2 Tablas (DDL)
Ver archivo `SCHEMA.md` para el DDL completo.

---

## 13. Notas de Implementación

1. **Transacciones**: El procesamiento del evento Redis debe ser atómico
2. **Concurrencia**: Usar `@Transactional` para operaciones de esc stock
3. **Redis**: Consumer group debe hacer ACK después de procesar exitosamente
4. **Idempotencia**: Verificar eventId antes de cualquier procesamiento
5. **Soft Delete**: Nunca usar DELETE físico, usar `activo = false`
