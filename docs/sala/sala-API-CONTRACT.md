# Contrato REST API - Sala Service

## Base URL

```
http://localhost:8083/api/sala
```

## Autenticación

Todas las peticiones requieren header de autorización:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

El JWT debe contener claim `role` con valor: `OWNER`, `MANAGER` o `WAITER`.

---

## Códigos de Respuesta

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Operación exitosa sin contenido |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token JWT ausente o inválido |
| 403 | Forbidden | Rol sin permisos suficientes |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto de estado (ej: mesa ocupada) |
| 422 | Unprocessable | Violación de regla de negocio |

## Formato de Error

```json
{
  "timestamp": "2026-03-07T13:00:00Z",
  "status": 409,
  "error": "CONFLICT",
  "code": "MESA_OCUPADA",
  "message": "La mesa 12 ya tiene una comanda activa",
  "path": "/api/sala/comandas"
}
```

---

## 1. Comandas

### 1.1 Crear Comanda

Abre una nueva comanda para una mesa.

**Endpoint**: `POST /comandas`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Request**:
```json
{
  "mesaId": "550e8400-e29b-41d4-a716-446655440000",
  "camareroId": "550e8400-e29b-41d4-a716-446655440001",
  "numeroComensales": 4,
  "notas": "Mesa junto a ventana, cliente habitual"
}
```

**Validaciones**:
- `mesaId`: UUID requerido, debe existir en mesas_operativas
- `camareroId`: UUID requerido
- `numeroComensales`: Entero entre 1 y 50
- `notas`: Opcional, máximo 500 caracteres

**Response 201**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "codigo": "CMD-A7B3",
  "mesaId": "550e8400-e29b-41d4-a716-446655440000",
  "camareroId": "550e8400-e29b-41d4-a716-446655440001",
  "estado": "ABIERTA",
  "numeroComensales": 4,
  "notas": "Mesa junto a ventana, cliente habitual",
  "total": 0.00,
  "descuentoPorcentaje": 0.00,
  "fechaApertura": "2026-03-07T13:00:00Z",
  "createdAt": "2026-03-07T13:00:00Z"
}
```

**Errores posibles**:
- `409 CONFLICT`: Mesa ya tiene comanda activa
- `404 NOT FOUND`: Mesa no existe
- `422 UNPROCESSABLE`: Mesa bloqueada o no disponible

---

### 1.2 Listar Comandas

Obtiene listado de comandas con filtros opcionales.

**Endpoint**: `GET /comandas`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Query Parameters**:

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `estado` | String | Filtrar por estado | `ABIERTA`, `EN_PREPARACION`, `SERVIDA`, `CUENTA`, `COBRADA` |
| `mesaId` | UUID | Filtrar por mesa | `550e8400-e29b-41d4-a716-446655440000` |
| `camareroId` | UUID | Filtrar por camarero | `550e8400-e29b-41d4-a716-446655440001` |
| `fechaDesde` | DateTime | Desde fecha | `2026-03-07T00:00:00Z` |
| `fechaHasta` | DateTime | Hasta fecha | `2026-03-07T23:59:59Z` |
| `page` | Integer | Número de página | `0` (default) |
| `size` | Integer | Tamaño de página | `20` (default) |
| `sort` | String | Ordenamiento | `fechaApertura,desc` |

**Response 200**:
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "codigo": "CMD-A7B3",
      "mesaId": "550e8400-e29b-41d4-a716-446655440000",
      "mesaNumero": 12,
      "camareroId": "550e8400-e29b-41d4-a716-446655440001",
      "camareroNombre": "Jorge García",
      "estado": "ABIERTA",
      "numeroComensales": 4,
      "total": 45.50,
      "fechaApertura": "2026-03-07T13:00:00Z",
      "totalPedidos": 3,
      "pedidosPendientes": 1,
      "pedidosListos": 2
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

### 1.3 Obtener Comanda

Obtiene detalle completo de una comanda incluyendo pedidos.

**Endpoint**: `GET /comandas/{id}`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "codigo": "CMD-A7B3",
  "mesaId": "550e8400-e29b-41d4-a716-446655440000",
  "mesaNumero": 12,
  "camareroId": "550e8400-e29b-41d4-a716-446655440001",
  "camareroNombre": "Jorge García",
  "estado": "EN_PREPARACION",
  "numeroComensales": 4,
  "notas": "Mesa junto a ventana",
  "total": 45.50,
  "descuentoPorcentaje": 0.00,
  "fechaApertura": "2026-03-07T13:00:00Z",
  "pedidos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "platoId": "550e8400-e29b-41d4-a716-446655440004",
      "nombrePlato": "Ensalada Mixta",
      "cantidad": 2,
      "precioUnitario": 12.50,
      "estado": "SERVIDO",
      "notas": "Sin cebolla",
      "horaPedido": "2026-03-07T13:05:00Z",
      "horaServido": "2026-03-07T13:15:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "platoId": "550e8400-e29b-41d4-a716-446655440006",
      "nombrePlato": "Filete de Ternera",
      "cantidad": 2,
      "precioUnitario": 18.00,
      "estado": "EN_PREPARACION",
      "notas": "Uno poco hecho",
      "horaPedido": "2026-03-07T13:10:00Z"
    }
  ],
  "resumen": {
    "totalPedidos": 2,
    "pedidosPendientes": 0,
    "pedidosEnPreparacion": 1,
    "pedidosListos": 0,
    "pedidosServidos": 1,
    "tiempoTranscurridoMinutos": 15
  }
}
```

---

### 1.4 Cambiar Estado de Comanda

Actualiza el estado de una comanda según el flujo permitido.

**Endpoint**: `PATCH /comandas/{id}/estado`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Request**:
```json
{
  "estado": "CUENTA",
  "motivo": "Cliente solicita cuenta"
}
```

**Validaciones de transición**:
- `ABIERTA` → `EN_PREPARACION`: Requiere al menos un pedido en preparación
- `EN_PREPARACION` → `SERVIDA`: Todos los pedidos deben estar SERVIDOS
- `SERVIDA` → `CUENTA`: Siempre permitido
- `CUENTA` → `ABIERTA`: Permitido si cliente agrega más pedidos
- Cualquier estado → `CANCELADA`: Solo si no hay pedidos SERVIDOS

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "codigo": "CMD-A7B3",
  "estado": "CUENTA",
  "estadoAnterior": "SERVIDA",
  "fechaActualizacion": "2026-03-07T14:00:00Z"
}
```

**Errores posibles**:
- `422 UNPROCESSABLE`: Transición de estado no permitida

---

### 1.5 Cerrar Comanda (Pedir Cuenta)

Marca la comanda como lista para cobro.

**Endpoint**: `POST /comandas/{id}/cerrar`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Request**:
```json
{
  "tipoPago": "TARJETA"
}
```

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "codigo": "CMD-A7B3",
  "estado": "CUENTA",
  "total": 45.50,
  "descuentoAplicado": 0.00,
  "fechaCierre": "2026-03-07T14:00:00Z"
}
```

---

### 1.6 Cobrar Comanda

Procesa el cobro final y cierra la comanda.

**Endpoint**: `POST /comandas/{id}/cobrar`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Request**:
```json
{
  "tipoPago": "TARJETA",
  "montoRecibido": 50.00,
  "propina": 2.00
}
```

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "codigo": "CMD-A7B3",
  "estado": "COBRADA",
  "estadoAnterior": "CUENTA",
  "total": 45.50,
  "tipoPago": "TARJETA",
  "montoRecibido": 50.00,
  "cambio": 4.50,
  "propina": 2.00,
  "fechaCobro": "2026-03-07T14:05:00Z",
  "duracionTotalMinutos": 65
}
```

---

### 1.7 Cancelar Comanda

Cancela una comanda completamente.

**Endpoint**: `DELETE /comandas/{id}`

**Roles permitidos**: OWNER, MANAGER (WAITER no puede cancelar)

**Query Parameters**:
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `motivo` | String | Sí | Razón de cancelación |

**Response 204**: No content

**Errores posibles**:
- `403 FORBIDDEN`: WAITER intentando cancelar
- `422 UNPROCESSABLE`: Hay pedidos ya servidos

---

## 2. Pedidos

### 2.1 Agregar Pedido

Añade un nuevo pedido a una comanda existente.

**Endpoint**: `POST /comandas/{comandaId}/pedidos`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Request**:
```json
{
  "platoId": "550e8400-e29b-41d4-a716-446655440006",
  "cantidad": 2,
  "notas": "Sin cebolla, uno sin gluten"
}
```

**Validaciones**:
- `comandaId`: Debe existir y estar en estado ABIERTA o EN_PREPARACION
- `platoId`: UUID requerido
- `cantidad`: Entero entre 1 y 99
- `notas`: Opcional, máximo 255 caracteres

**Response 201**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "comandaId": "550e8400-e29b-41d4-a716-446655440002",
  "platoId": "550e8400-e29b-41d4-a716-446655440006",
  "nombrePlato": "Filete de Ternera",
  "cantidad": 2,
  "precioUnitario": 18.00,
  "subtotal": 36.00,
  "estado": "PENDIENTE",
  "notas": "Sin cebolla, uno sin gluten",
  "horaPedido": "2026-03-07T13:10:00Z"
}
```

**Nota**: El `precioUnitario` se obtiene de carta-service y se congela en el momento del pedido.

---

### 2.2 Listar Pedidos de Comanda

Obtiene todos los pedidos de una comanda.

**Endpoint**: `GET /comandas/{comandaId}/pedidos`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Query Parameters**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `estado` | String | Filtrar por estado |
| `incluirCancelados` | Boolean | Incluir pedidos cancelados (default: false) |

**Response 200**:
```json
{
  "comandaId": "550e8400-e29b-41d4-a716-446655440002",
  "pedidos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "platoId": "550e8400-e29b-41d4-a716-446655440004",
      "nombrePlato": "Ensalada Mixta",
      "cantidad": 2,
      "precioUnitario": 12.50,
      "subtotal": 25.00,
      "estado": "SERVIDO",
      "horaPedido": "2026-03-07T13:05:00Z",
      "horaServido": "2026-03-07T13:15:00Z"
    }
  ],
  "totales": {
    "cantidadTotal": 2,
    "subtotal": 25.00
  }
}
```

---

### 2.3 Actualizar Estado de Pedido

Cambia el estado de un pedido individual.

**Endpoint**: `PATCH /pedidos/{id}/estado`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Request**:
```json
{
  "estado": "LISTO",
  "notasCambio": "Plato listo para servir"
}
```

**Transiciones permitidas**:
- `PENDIENTE` → `EN_PREPARACION`: Cocina inicia preparación
- `EN_PREPARACION` → `LISTO`: Plato terminado en cocina
- `LISTO` → `SERVIDO`: Camarero sirve el plato
- Cualquier estado (excepto SERVIDO) → `CANCELADO`: Cancelación

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "estado": "LISTO",
  "estadoAnterior": "EN_PREPARACION",
  "horaListo": "2026-03-07T13:25:00Z",
  "comandaEstadoActualizado": "EN_PREPARACION"
}
```

---

### 2.4 Cancelar Pedido

Cancela un pedido específico.

**Endpoint**: `DELETE /pedidos/{id}`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Query Parameters**:
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `motivo` | String | Sí | Razón de cancelación |

**Response 204**: No content

**Errores posibles**:
- `422 UNPROCESSABLE`: Pedido ya está SERVIDO

---

## 3. Mesas Operativas

### 3.1 Listar Mesas

Obtiene todas las mesas con su estado operativo actual.

**Endpoint**: `GET /mesas`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Query Parameters**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `salaId` | UUID | Filtrar por sala |
| `estado` | String | Filtrar por estado operativo |
| `camareroId` | UUID | Filtrar por camarero asignado |
| `incluirLibres` | Boolean | Incluir mesas libres (default: true) |

**Response 200**:
```json
{
  "mesas": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "numero": 12,
      "salaId": "550e8400-e29b-41d4-a716-446655440007",
      "nombreSala": "Principal",
      "estadoOperativo": "OCUPADA",
      "comandaActivaId": "550e8400-e29b-41d4-a716-446655440002",
      "codigoComanda": "CMD-A7B3",
      "camareroAsignadoId": "550e8400-e29b-41d4-a716-446655440001",
      "nombreCamarero": "Jorge García",
      "reservaActualId": null,
      "nombreClienteReserva": null,
      "totalComandaActual": 45.50,
      "numeroComensales": 4,
      "tiempoOcupadaMinutos": 65
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "numero": 13,
      "salaId": "550e8400-e29b-41d4-a716-446655440007",
      "nombreSala": "Principal",
      "estadoOperativo": "LIBRE",
      "comandaActivaId": null,
      "reservaActualId": "550e8400-e29b-41d4-a716-446655440009",
      "nombreClienteReserva": "Laura Martínez",
      "horaReserva": "14:00"
    }
  ],
  "resumen": {
    "totalMesas": 15,
    "libres": 8,
    "ocupadas": 6,
    "reservadas": 1
  }
}
```

---

### 3.2 Obtener Mesa

Obtiene detalle completo de una mesa operativa.

**Endpoint**: `GET /mesas/{id}`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero": 12,
  "salaId": "550e8400-e29b-41d4-a716-446655440007",
  "nombreSala": "Principal",
  "capacidad": 4,
  "posX": 100,
  "posY": 200,
  "estadoOperativo": "OCUPADA",
  "comandaActiva": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "codigo": "CMD-A7B3",
    "camareroId": "550e8400-e29b-41d4-a716-446655440001",
    "camareroNombre": "Jorge García",
    "estado": "EN_PREPARACION",
    "numeroComensales": 4,
    "total": 45.50,
    "fechaApertura": "2026-03-07T13:00:00Z",
    "pedidosPendientes": 1
  },
  "reservaActual": null,
  "historialHoy": [
    {
      "tipo": "COMANDA_ABIERTA",
      "timestamp": "2026-03-07T13:00:00Z",
      "datos": {
        "comandaId": "550e8400-e29b-41d4-a716-446655440002",
        "camarero": "Jorge García"
      }
    }
  ]
}
```

---

### 3.3 Cambiar Estado de Mesa (Manual)

Permite cambiar manualmente el estado operativo de una mesa.

**Endpoint**: `PATCH /mesas/{id}/estado`

**Roles permitidos**: OWNER, MANAGER (WAITER no puede)

**Request**:
```json
{
  "estadoOperativo": "LIBRE",
  "motivo": "Cliente finalizó y se retiró",
  "forzar": false
}
```

**Validaciones**:
- Si `forzar=true`: Permite cambios que normalmente violarían reglas
- Si hay comanda activa: Requiere confirmación o forzar=true

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero": 12,
  "estadoOperativo": "LIBRE",
  "estadoAnterior": "COBRADA",
  "comandaActivaId": null,
  "fechaActualizacion": "2026-03-07T14:10:00Z"
}
```

---

### 3.4 Asignar Camarero

Asigna un camarero responsable a una mesa.

**Endpoint**: `POST /mesas/{id}/asignar-camarero`

**Roles permitidos**: OWNER, MANAGER

**Request**:
```json
{
  "camareroId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero": 12,
  "camareroAsignadoId": "550e8400-e29b-41d4-a716-446655440001",
  "nombreCamarero": "Jorge García",
  "fechaAsignacion": "2026-03-07T12:55:00Z"
}
```

---

## 4. Cuenta

### 4.1 Ver Cuenta Detallada

Obtiene el desglose completo de la cuenta de una comanda.

**Endpoint**: `GET /comandas/{id}/cuenta`

**Roles permitidos**: OWNER, MANAGER, WAITER

**Response 200**:
```json
{
  "comandaId": "550e8400-e29b-41d4-a716-446655440002",
  "codigo": "CMD-A7B3",
  "mesaNumero": 12,
  "camareroNombre": "Jorge García",
  "fechaApertura": "2026-03-07T13:00:00Z",
  "items": [
    {
      "pedidoId": "550e8400-e29b-41d4-a716-446655440003",
      "nombrePlato": "Ensalada Mixta",
      "cantidad": 2,
      "precioUnitario": 12.50,
      "subtotal": 25.00,
      "horaPedido": "2026-03-07T13:05:00Z",
      "horaServido": "2026-03-07T13:15:00Z"
    },
    {
      "pedidoId": "550e8400-e29b-41d4-a716-446655440005",
      "nombrePlato": "Filete de Ternera",
      "cantidad": 2,
      "precioUnitario": 18.00,
      "subtotal": 36.00,
      "horaPedido": "2026-03-07T13:10:00Z",
      "horaServido": "2026-03-07T13:25:00Z"
    }
  ],
  "subtotal": 61.00,
  "descuentoPorcentaje": 10.00,
  "descuentoMonto": 6.10,
  "impuestos": {
    "tasa": 10.00,
    "monto": 5.49
  },
  "total": 60.39,
  "redondeo": -0.01,
  "tiempoTranscurridoMinutos": 65
}
```

---

### 4.2 Aplicar Descuento

Aplica un descuento porcentual a la comanda.

**Endpoint**: `POST /comandas/{id}/descuento`

**Roles permitidos**: OWNER, MANAGER (WAITER no puede)

**Request**:
```json
{
  "porcentaje": 10.00,
  "motivo": "Cumpleaños del cliente",
  "aplicarA": "TOTAL"
}
```

**Validaciones**:
- `porcentaje`: Entre 0 y 100
- La comanda debe estar en estado `CUENTA` o anterior
- Solo un descuento activo por comanda

**Response 200**:
```json
{
  "comandaId": "550e8400-e29b-41d4-a716-446655440002",
  "descuentoPorcentaje": 10.00,
  "descuentoMonto": 6.10,
  "subtotal": 61.00,
  "totalAnterior": 61.00,
  "totalNuevo": 54.90,
  "motivo": "Cumpleaños del cliente",
  "aplicadoPor": "550e8400-e29b-41d4-a716-446655440010",
  "nombreAplicador": "María López",
  "fechaAplicacion": "2026-03-07T14:00:00Z"
}
```

---

## 5. Estadísticas y Reportes

### 5.1 Resumen del Día

Obtiene estadísticas del día en curso.

**Endpoint**: `GET /estadisticas/dia`

**Roles permitidos**: OWNER, MANAGER

**Query Parameters**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fecha` | Date | Fecha específica (default: hoy) |

**Response 200**:
```json
{
  "fecha": "2026-03-07",
  "comandas": {
    "total": 45,
    "abiertas": 8,
    "cobradas": 35,
    "canceladas": 2
  },
  "ventas": {
    "total": 1250.50,
    "promedioPorComanda": 35.73,
    "metodosPago": {
      "EFECTIVO": 450.00,
      "TARJETA": 800.50
    }
  },
  "mesas": {
    "total": 20,
    "rotacionPromedio": 2.25,
    "tiempoPromedioOcupacionMinutos": 58
  },
  "camareros": [
    {
      "camareroId": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Jorge García",
      "comandasAtendidas": 12,
      "ventasGeneradas": 420.00
    }
  ]
}
```

---

## 6. WebSockets / SSE (Futuro)

### 6.1 Eventos en Tiempo Real

Para escuchar cambios en tiempo real:

**Endpoint**: `GET /sse/mesas`

**Headers**:
```http
Authorization: Bearer <JWT>
Accept: text/event-stream
```

**Eventos emitidos**:
- `mesa.estado-cambiado`: Cuando cambia el estado de una mesa
- `pedido.listo`: Cuando un pedido está listo para servir
- `comanda.cancelada`: Cuando se cancela una comanda

**Ejemplo de evento**:
```
event: pedido.listo
data: {"pedidoId": "...", "mesaNumero": 12, "plato": "Filete de Ternera"}
```

---

## Notas de Implementación

1. **Precios congelados**: Los precios de platos se guardan al momento del pedido para evitar cambios si la carta se actualiza.

2. **Cálculo de totales**: El total se recalcula automáticamente al agregar/cancelar pedidos.

3. **Idempotencia**: Las operaciones de pago deben ser idempotentes usando el `codigo` de comanda como clave.

4. **Validaciones de estado**: Las transiciones de estado están estrictamente controladas para mantener la integridad del flujo.

5. **Auditoría**: Todos los cambios de estado guardan el usuario que realizó la acción.

---

**Versión**: 1.0.0  
**Actualizado**: 2026-03-07
