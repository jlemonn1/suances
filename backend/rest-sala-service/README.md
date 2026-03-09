# Sala Service - Microservicio de Operativa de Sala

## Descripción

Microservicio de gestión operativa de sala para el restaurante Suances. Gestiona comandas, pedidos, estados de mesas y sincronización con otros microservicios.

## Tecnologías

- Java 21
- Spring Boot 3.5.11
- PostgreSQL 16
- Redis Streams
- JWT (JSON Web Tokens)
- Docker

## Características

### Funcionalidades Implementadas

- ✅ Gestión completa de comandas (CRUD + estados)
- ✅ Gestión de pedidos con estados (PENDIENTE → EN_PREPARACION → LISTO → SERVIDO)
- ✅ Cálculo automático de totales
- ✅ Estados operativos de mesas (LIBRE, OCUPADA, PIDIENDO, SERVIDA, CUENTA, COBRADA)
- ✅ Sincronización con reservas vía Redis Streams
- ✅ Eventos salientes a otros microservicios
- ✅ Cobros y aplicación de descuentos
- ✅ Reportes y estadísticas (ventas, camareros, rotación de mesas)
- ✅ Seguridad JWT completa
- ✅ Manejo de excepciones global

## Endpoints API

### Comandas
- `POST /api/sala/comandas` - Crear comanda
- `GET /api/sala/comandas` - Listar comandas
- `GET /api/sala/comandas/{id}` - Obtener comanda
- `PATCH /api/sala/comandas/{id}/estado` - Cambiar estado
- `DELETE /api/sala/comandas/{id}` - Cancelar comanda

### Pedidos
- `POST /api/sala/comandas/{comandaId}/pedidos` - Agregar pedido
- `GET /api/sala/comandas/{comandaId}/pedidos` - Listar pedidos
- `PATCH /api/sala/comandas/{comandaId}/pedidos/{pedidoId}/estado` - Cambiar estado
- `DELETE /api/sala/comandas/{comandaId}/pedidos/{pedidoId}` - Cancelar pedido

### Cuenta
- `GET /api/sala/comandas/{comandaId}/cuenta` - Ver total
- `POST /api/sala/comandas/{comandaId}/cuenta/cerrar` - Cerrar cuenta
- `POST /api/sala/comandas/{comandaId}/cuenta/cobrar` - Cobrar comanda
- `POST /api/sala/comandas/{comandaId}/cuenta/descuento` - Aplicar descuento
- `GET /api/sala/comandas/{comandaId}/cuenta/cambio` - Calcular cambio

### Mesas
- `GET /api/sala/mesas` - Listar mesas
- `GET /api/sala/mesas/{id}` - Obtener mesa
- `PATCH /api/sala/mesas/{id}/estado` - Cambiar estado
- `POST /api/sala/mesas/{id}/asignar-camarero` - Asignar camarero

### Estadísticas
- `GET /api/sala/estadisticas/dia` - Resumen del día
- `GET /api/sala/estadisticas/camareros` - Rendimiento por camarero
- `GET /api/sala/estadisticas/mesas` - Estadísticas de mesas

## Configuración

### Variables de Entorno

```env
POSTGRES_DB=sala
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sala
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379

APP_JWT_SECRET=SuperSecretKeyQueEsMuyLargaYSegura2024ParaProduccion
APP_JWT_ISSUER=personnel-service
APP_JWT_AUDIENCE=sala-service
APP_JWT_ALLOWED_ROLES=OWNER,MANAGER,WAITER
```

## Ejecución

### Con Docker Compose

```bash
docker-compose up -d
```

### Desarrollo Local

```bash
# Requisitos: PostgreSQL y Redis corriendo
mvn spring-boot:run
```

## Arquitectura

### Eventos Redis

**Entrantes (reservas.events):**
- `reserva.created` - Sincronizar nueva reserva
- `reserva.cancelled` - Liberar reserva

**Salientes (sala.events):**
- `sala.comanda.abierta` - Nueva comanda
- `sala.pedido.creado` - Nuevo pedido
- `sala.cuenta.cerrada` - Cuenta cerrada
- `sala.comanda.cobrada` - Comanda cobrada

### Estados

**Comanda:**
```
ABIERTA → EN_PREPARACION → SERVIDA → CUENTA → COBRADA
    ↓           ↓
CANCELADA  (cancelar pedidos)
```

**Pedido:**
```
PENDIENTE → EN_PREPARACION → LISTO → SERVIDO
    ↓            ↓
CANCELADO
```

**Mesa:**
```
LIBRE → OCUPADA → PIDIENDO → SERVIDA → CUENTA → COBRADA → LIBRE
  ↑                                    ↓
  └────────────────────────────────────┘ (agregar más pedidos)
```

## Seguridad

Todos los endpoints requieren autenticación JWT. Los roles permitidos son:
- **OWNER**: Acceso total
- **MANAGER**: CRUD + cancelaciones + descuentos
- **WAITER**: Operaciones básicas (sin cancelaciones ni descuentos)

## Integración

### Con reservas-service
- Consume eventos de reservas para sincronizar mesas
- Envía eventos de comandas cobradas para liberar mesas

### Con carta-service (TODO)
- Obtener precios de platos
- Notificar pedidos para descontar stock

## Autor

Equipo Suances - 2026
