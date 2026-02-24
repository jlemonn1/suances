# Micro SERVICIO PERSONAL - Especificación Técnica

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | PersonnelService |
| **Puerto** | 8085 |
| **Context Path** | `/api/auth` |
| **Base de datos** | PostgreSQL (`localhost:5432/personnel`) |
| **Eventos** | Redis (`localhost:6379`) - *Auditoría* |

---

## 2. Stack Tecnológico

- **Framework**: Spring Boot 3.2.x
- **Lenguaje**: Java 17
- **Build**: Maven
- **Arquitectura**: Hexagonal (Ports & Adapters)
- **Seguridad**: Spring Security 6 + JJWT (Issuer)
- **Criptografía**: BCrypt (12 rounds)
- **Validación**: Jakarta Bean Validation
- **Base de datos**: PostgreSQL
- **Redis**: Pub/Sub para auditoría de accesos

---

## 3. Configuración (application.yml)

```yaml
server:
  port: 8085

spring:
  application:
    name: personnel-service
  datasource:
    url: jdbc:postgresql://localhost:5432/personnel
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
  data:
    redis:
      host: localhost
      port: 6379

app:
  jwt:
    # CLAVE PRIVADA DE FIRMA (Debe ser compartida/verificada por otros micros)
    secret: ${JWT_SECRET:CHANGE_ME_IN_PRODUCTION_MIN_256_BITS_FOR_HS256_SECURITY}
    expiration-ms: 86400000 # 24 horas
  security:
    bcrypt-strength: 12

logging:
  level:
    root: INFO
    com.restaurante.personnel: DEBUG
    org.springframework.security: INFO
```

---

## 4. Modelo de Datos

### 4.1 Entidades

#### Usuario (Personnel)
**Java Annotations:** `@Table(name = "usuarios")`

- **id**: UUID (PK)
- **username**: VARCHAR(50) NOT NULL UNIQUE
- **password**: VARCHAR(255) NOT NULL  // Hash BCrypt
- **full_name**: VARCHAR(100) NOT NULL
- **image_url**: VARCHAR(500) NULL     // URL CDN
- **role**: VARCHAR(20) NOT NULL       // ENUM: OWNER, MANAGER, WAITER
- **activo**: BOOLEAN DEFAULT TRUE
- **created_at**: TIMESTAMP
- **updated_at**: TIMESTAMP

**Constraints:**
- `username` UNIQUE
- `role` IN ('OWNER', 'MANAGER', 'WAITER')

#### AuditoriaLogin (Log de Seguridad)
**Java Annotations:** `@Table(name = "auditoria_accesos")`

- **id**: UUID (PK)
- **usuario_id**: UUID (FK, Nullable)
- **username_attempt**: VARCHAR(50)
- **ip_address**: VARCHAR(45)
- **status**: VARCHAR(20) // SUCCESS, FAILED
- **user_agent**: TEXT
- **timestamp**: TIMESTAMP

---

## 5. Contrato REST API

### Headers Requeridos
- `Content-Type: application/json`
- `Authorization: Bearer <JWT_TOKEN>` (No requerido para `/auth/login`)

### Endpoints

#### AUTENTICACIÓN

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | `/auth/login` | Validar credenciales y obtener Token | PÚBLICO |

**Request Body (`POST /auth/login`):**
```json
{
  "username": "admin",
  "password": "passwordSeguro123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "userInfo": {
    "id": "uuid",
    "fullName": "Juan Dueño",
    "role": "OWNER",
    "imageUrl": "https://cdn.restaurante.com/avatars/1.jpg"
  }
}
```

#### GESTIÓN DE PERSONAL

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | `/personnel` | Crear nuevo empleado | PROPIETARIO |
| GET | `/personnel` | Listar empleados | PROPIETARIO, GERENTE |
| GET | `/personnel/{id}` | Obtener detalle | PROPIETARIO, SELF |
| PATCH | `/personnel/{id}/role` | Modificar rol/permisos | PROPIETARIO |
| PUT | `/personnel/{id}` | Modificar datos básicos | PROPIETARIO, SELF |
| DELETE | `/personnel/{id}` | Desactivar empleado (Soft) | PROPIETARIO |

**Request Body (`POST /personnel`):**
```json
{
  "username": "camarero_jorge",
  "password": "tempPassword2026",
  "fullName": "Jorge García",
  "role": "WAITER",
  "imageUrl": "https://bucket..."
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "username": "camarero_jorge",
  "fullName": "Jorge García",
  "role": "WAITER",
  "activo": true,
  "createdAt": "2026-02-23T10:00:00Z"
}
```

**Request Body (`PATCH /personnel/{id}/role`):**
```json
{
  "role": "MANAGER"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "username": "camarero_jorge",
  "role": "MANAGER"
}
```

---

## 6. Contrato Eventos Redis

### 6.1 Evento Salida: `security.events`
**Propósito:** Auditoría centralizada.

**JSON Schema:**
```json
{
  "eventId": "uuid",
  "type": "auth.login.success",
  "timestamp": "2026-02-23T21:10:00Z",
  "data": {
    "userId": "uuid",
    "username": "admin",
    "role": "OWNER",
    "ip": "192.168.1.50"
  }
}
```

---

## 7. Seguridad JWT (Core)

Este microservicio actúa como **Authority Issuer**.

### 7.1 Estructura del Payload (Claims)
```json
{
  "sub": "uuid-del-usuario",       // Subject (ID)
  "iss": "personnel-service",      // Issuer
  "iat": 1708711200,               // Issued At
  "exp": 1708797600,               // Expiration
  "name": "Juan Dueño",            // Full Name (para UI)
  "role": "OWNER"                  // ROL CRÍTICO (para autorización)
}
```

### 7.2 Reglas de Autorización

| Rol | Capacidades |
|-----|-------------|
| **OWNER** | Superusuario. Puede crear cuentas, borrar (soft delete), cambiar roles y ver auditoría. |
| **MANAGER** | Puede listar personal para organizar turnos, pero NO puede crear usuarios. |
| **WAITER** | Acceso limitado. Solo puede editar su propia contraseña o foto. |

---

## 8. Códigos de Error

| Código | Significado | Causa Común |
|--------|-------------|-------------|
| 400 | Bad Request | Username ya existe, contraseña débil |
| 401 | Unauthorized | Credenciales incorrectas |
| 403 | Forbidden | Un Camarero intentando crear un usuario |
| 404 | Not Found | Usuario no existe |

---

## 9. Estructura de Paquetes

```text
com.restaurante.personnel
├── PersonnelApplication.java
├── config/
│   ├── SecurityConfig.java
│   └── OpenApiConfig.java
├── application/
│   ├── dto/
│   ├── port/
│   │   ├── in/ (UseCases)
│   │   └── out/ (PersistencePorts)
│   └── service/ (Domain Logic)
├── domain/
│   ├── model/
│   │   ├── User.java
│   │   └── Role.java
│   └── exception/
└── infrastructure/
    ├── adapter/
    │   ├── in/ (RestController)
    │   └── out/ (JpaAdapter, TokenAdapter)
    └── persistence/ (Repositories)
```

---

## 10. Scripts SQL (Schema)

```sql
-- Enum
CREATE TYPE user_role AS ENUM ('OWNER', 'MANAGER', 'WAITER');

-- Usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    role user_role NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoria
CREATE TABLE auditoria_accesos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID,
    username_attempt VARCHAR(50),
    status VARCHAR(20),
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Inicial (Password: admin123)
INSERT INTO usuarios (username, password, full_name, role)
VALUES ('admin', '$2a$12$R9h/cIPz0gi.URNNXRfx.O8fQ8U...', 'Admin Inicial', 'OWNER');
```
