# Contrato de Eventos Redis - Sala Service

## Resumen

El microservicio de Sala utiliza **Redis Streams** para comunicación asíncrona con otros microservicios:

- **Stream Entrada**: `reservas.events` - Eventos del servicio de reservas
- **Stream Salida**: `sala.events` - Eventos emitidos por este servicio

---

## Arquitectura de Eventos

```
┌─────────────────────────────────────────────────────────────────┐
│                        REDIS STREAMS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐        ┌──────────────────────────┐  │
│  │   reservas.events    │        │      sala.events         │  │
│  │   (Stream Entrada)   │        │    (Stream Salida)       │  │
│  └──────────┬───────────┘        └──────────┬───────────────┘  │
│             │                               │                   │
└─────────────┼───────────────────────────────┼───────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐        ┌──────────────────────────┐
│   ReservasEventConsumer │        │    SalaEventProducer     │
│   (Sala Service)        │        │    (Sala Service)        │
└────────────┬────────────┘        └──────────┬───────────────┘
             │                                │
             │                                │
             ▼                                ▼
┌─────────────────────────┐        ┌──────────────────────────┐
│   rest-reserva-service  │        │   rest-reserva-service   │
│   (Productor)           │        │   (Consumidor)           │
└─────────────────────────┘        ├──────────────────────────┤
                                   │   rest-carta-service     │
                                   │   (Consumidor)           │
                                   └──────────────────────────┘
```

---

## Formato General de Eventos

Todos los eventos siguen este formato JSON:

```json
{
  "eventId": "uuid-v4",
  "type": "nombre.evento",
  "timestamp": "2026-03-07T13:00:00.000Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    // Payload específico del evento
  },
  "metadata": {
    "traceId": "uuid-v4",
    "userId": "uuid-v4",
    "clientIp": "192.168.1.100"
  }
}
```

### Campos del Evento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `eventId` | UUID | Identificador único del evento (idempotencia) |
| `type` | String | Tipo de evento (formato: dominio.entidad.accion) |
| `timestamp` | ISO-8601 | Momento de generación del evento |
| `source` | String | Origen del evento (sala-service) |
| `version` | String | Versión del esquema del evento |
| `data` | Object | Payload específico del evento |
| `metadata` | Object | Información adicional de trazabilidad |

---

## Eventos Entrantes (reservas.events)

Consumidos por: `ReservasEventConsumer`  
Consumer Group: `sala-group`

### 1. reserva.created

**Descripción**: Se ha creado una nueva reserva confirmada.

**Acción en Sala**: Pre-bloquear mesa, preparar información para llegada del cliente.

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "reserva.created",
  "timestamp": "2026-03-07T13:00:00Z",
  "source": "reservas-service",
  "version": "1.0",
  "data": {
    "reservaId": "550e8400-e29b-41d4-a716-446655440001",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "codigo": "RSV-9F3A",
    "estado": "CONFIRMADA",
    "fecha": "2026-03-07",
    "franjaId": "550e8400-e29b-41d4-a716-446655440003",
    "franjaNombre": "Comida",
    "horaInicio": "13:00",
    "horaFin": "15:00",
    "comensales": 4,
    "nombreCliente": "Laura Martínez",
    "telefono": "+34 600123456",
    "email": "laura@ejemplo.com",
    "notas": "Silla para bebé",
    "origen": "ONLINE"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440004"
  }
}
```

**Procesamiento**:
1. Verificar si evento ya fue procesado (idempotencia)
2. Actualizar mesa_operativas:
   - Marcar `reserva_actual_id`
   - Guardar `nombre_cliente_reserva`
   - Estado visual: "RESERVADA"
3. Notificar a camareros si es necesario

---

### 2. reserva.updated

**Descripción**: Se ha actualizado una reserva existente.

**Acción en Sala**: Actualizar información de la reserva en la mesa.

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440005",
  "type": "reserva.updated",
  "timestamp": "2026-03-07T14:00:00Z",
  "source": "reservas-service",
  "version": "1.0",
  "data": {
    "reservaId": "550e8400-e29b-41d4-a716-446655440001",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "codigo": "RSV-9F3A",
    "cambios": {
      "comensales": {
        "anterior": 4,
        "nuevo": 6
      },
      "notas": {
        "anterior": "Silla para bebé",
        "nuevo": "Silla para bebé, alergia a frutos secos"
      }
    },
    "reservaCompleta": {
      "reservaId": "550e8400-e29b-41d4-a716-446655440001",
      "mesaId": "550e8400-e29b-41d4-a716-446655440002",
      "comensales": 6,
      "notas": "Silla para bebé, alergia a frutos secos"
    }
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440006"
  }
}
```

**Procesamiento**:
1. Actualizar datos de reserva en mesa_operativas
2. Si cambió número de comensales, actualizar en comanda activa (si existe)

---

### 3. reserva.cancelled

**Descripción**: Se ha cancelado una reserva.

**Acción en Sala**: Liberar mesa si no hay comanda activa.

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440007",
  "type": "reserva.cancelled",
  "timestamp": "2026-03-07T13:30:00Z",
  "source": "reservas-service",
  "version": "1.0",
  "data": {
    "reservaId": "550e8400-e29b-41d4-a716-446655440001",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "codigo": "RSV-9F3A",
    "motivo": "CLIENTE",
    "motivoDescripcion": "Cancelado por el cliente",
    "fechaCancelacion": "2026-03-07T13:30:00Z"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440008"
  }
}
```

**Procesamiento**:
1. Verificar si hay comanda activa en la mesa
2. Si NO hay comanda: Limpiar reserva_actual_id, estado → LIBRE
3. Si hay comanda: Mantener estado, limpiar solo reserva_actual_id

---

### 4. reserva.confirmada-llegada

**Descripción**: Cliente con reserva ha llegado al restaurante.

**Acción en Sala**: Permitir apertura de comanda para esta mesa.

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440009",
  "type": "reserva.confirmada-llegada",
  "timestamp": "2026-03-07T13:15:00Z",
  "source": "reservas-service",
  "version": "1.0",
  "data": {
    "reservaId": "550e8400-e29b-41d4-a716-446655440001",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "codigo": "RSV-9F3A",
    "nombreCliente": "Laura Martínez",
    "comensales": 4,
    "horaLlegada": "2026-03-07T13:15:00Z"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

**Procesamiento**:
1. Cambiar estado de mesa a "OCUPADA" (si estaba en "RESERVADA")
2. Permitir al camarero abrir comanda

---

### 5. mesa.blocked

**Descripción**: Una mesa ha sido bloqueada desde reservas.

**Acción en Sala**: Marcar mesa como no disponible para nuevas comandas.

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440011",
  "type": "mesa.blocked",
  "timestamp": "2026-03-07T10:00:00Z",
  "source": "reservas-service",
  "version": "1.0",
  "data": {
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "tipo": "TOTAL",
    "motivo": "Mantenimiento",
    "fechaDesde": "2026-03-07",
    "fechaHasta": "2026-03-08",
    "franjasAfectadas": ["550e8400-e29b-41d4-a716-446655440003"],
    "bloqueadoPor": "550e8400-e29b-41d4-a716-446655440012"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440013"
  }
}
```

**Tipos de bloqueo**:
- `ONLINE`: Solo afecta reservas online, permitido uso manual
- `TOTAL`: Mes completamente bloqueada
- `EVENTO`: Bloqueo por evento especial
- `MANTENIMIENTO`: Mesa en mantenimiento

---

### 6. mesa.released

**Descripción**: Se ha liberado un bloqueo de mesa.

**Acción en Sala**: Marcar mesa como disponible.

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440014",
  "type": "mesa.released",
  "timestamp": "2026-03-08T10:00:00Z",
  "source": "reservas-service",
  "version": "1.0",
  "data": {
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "bloqueoId": "550e8400-e29b-41d4-a716-446655440015",
    "tipo": "MANTENIMIENTO",
    "liberadoPor": "550e8400-e29b-41d4-a716-446655440016"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440017"
  }
}
```

---

## Eventos Salientes (sala.events)

Producidos por: `SalaEventProducer`

### 1. sala.comanda.abierta

**Descripción**: Se ha abierto una nueva comanda en una mesa.

**Consumidores**: Reservas, Notificaciones, Analytics

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440018",
  "type": "sala.comanda.abierta",
  "timestamp": "2026-03-07T13:00:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "codigo": "CMD-A7B3",
    "camareroId": "550e8400-e29b-41d4-a716-446655440020",
    "camareroNombre": "Jorge García",
    "numeroComensales": 4,
    "horaApertura": "2026-03-07T13:00:00Z",
    "tieneReserva": true,
    "reservaId": "550e8400-e29b-41d4-a716-446655440001",
    "nombreCliente": "Laura Martínez"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440021",
    "userId": "550e8400-e29b-41d4-a716-446655440020"
  }
}
```

**Cuándo se emite**:
- Camarero abre comanda manualmente
- Cliente con reserva llega y se confirma

---

### 2. sala.pedido.creado

**Descripción**: Se ha agregado un nuevo pedido a una comanda.

**Consumidores**: Carta (para actualizar stock), Cocina, Notificaciones

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440022",
  "type": "sala.pedido.creado",
  "timestamp": "2026-03-07T13:05:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "pedidoId": "550e8400-e29b-41d4-a716-446655440023",
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "mesaNumero": 12,
    "platoId": "550e8400-e29b-41d4-a716-446655440024",
    "nombrePlato": "Ensalada Mixta",
    "cantidad": 2,
    "precioUnitario": 12.50,
    "horaPedido": "2026-03-07T13:05:00Z",
    "notas": "Sin cebolla"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440025",
    "userId": "550e8400-e29b-41d4-a716-446655440020"
  }
}
```

**Importante**: Carta-service consume este evento para descontar stock de ingredientes.

---

### 3. sala.pedido.estado-cambiado

**Descripción**: El estado de un pedido ha cambiado.

**Consumidores**: Cocina, Mesas, Notificaciones

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440026",
  "type": "sala.pedido.estado-cambiado",
  "timestamp": "2026-03-07T13:15:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "pedidoId": "550e8400-e29b-41d4-a716-446655440023",
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "mesaNumero": 12,
    "platoId": "550e8400-e29b-41d4-a716-446655440024",
    "nombrePlato": "Ensalada Mixta",
    "estadoAnterior": "EN_PREPARACION",
    "estadoNuevo": "LISTO",
    "horaCambio": "2026-03-07T13:15:00Z",
    "tiempoPreparacionMinutos": 10
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440027",
    "userId": "550e8400-e29b-41d4-a716-446655440028"
  }
}
```

**Casos especiales**:
- `LISTO`: Cocina notifica que plato está listo
- `SERVIDO`: Camarero confirma que sirvió el plato

---

### 4. sala.mesa.estado-cambiado

**Descripción**: El estado operativo de una mesa ha cambiado.

**Consumidores**: Reservas, Dashboards, Notificaciones

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440029",
  "type": "sala.mesa.estado-cambiado",
  "timestamp": "2026-03-07T13:00:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "mesaNumero": 12,
    "salaId": "550e8400-e29b-41d4-a716-446655440030",
    "estadoAnterior": "LIBRE",
    "estadoNuevo": "OCUPADA",
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "camareroId": "550e8400-e29b-41d4-a716-446655440020",
    "horaCambio": "2026-03-07T13:00:00Z",
    "motivo": "Nueva comanda"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440031"
  }
}
```

**Cambios de estado que generan evento**:
- LIBRE → OCUPADA
- OCUPADA → PIDIENDO
- PIDIENDO → SERVIDA
- SERVIDA → CUENTA
- CUENTA → COBRADA
- COBRADA → LIBRE

---

### 5. sala.cuenta.cerrada

**Descripción**: Una comanda ha pasado a estado CUENTA (listo para cobrar).

**Consumidores**: Reservas, Notificaciones, Analytics

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440032",
  "type": "sala.cuenta.cerrada",
  "timestamp": "2026-03-07T14:00:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "mesaNumero": 12,
    "codigo": "CMD-A7B3",
    "camareroId": "550e8400-e29b-41d4-a716-446655440020",
    "camareroNombre": "Jorge García",
    "total": 45.50,
    "descuento": 0.00,
    "subtotal": 45.50,
    "numeroPedidos": 3,
    "horaApertura": "2026-03-07T13:00:00Z",
    "horaCierre": "2026-03-07T14:00:00Z",
    "duracionMinutos": 60
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440033",
    "userId": "550e8400-e29b-41d4-a716-446655440020"
  }
}
```

---

### 6. sala.comanda.cobrada

**Descripción**: Una comanda ha sido cobrada completamente.

**Consumidores**: Analytics, Contabilidad, Notificaciones

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440034",
  "type": "sala.comanda.cobrada",
  "timestamp": "2026-03-07T14:05:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "mesaNumero": 12,
    "codigo": "CMD-A7B3",
    "camareroId": "550e8400-e29b-41d4-a716-446655440020",
    "camareroNombre": "Jorge García",
    "total": 45.50,
    "descuento": 0.00,
    "tipoPago": "TARJETA",
    "montoRecibido": 50.00,
    "cambio": 4.50,
    "propina": 2.00,
    "horaApertura": "2026-03-07T13:00:00Z",
    "horaCierre": "2026-03-07T14:05:00Z",
    "horaCobro": "2026-03-07T14:05:00Z",
    "duracionTotalMinutos": 65
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440035",
    "userId": "550e8400-e29b-41d4-a716-446655440020"
  }
}
```

---

### 7. sala.comanda.cancelada

**Descripción**: Una comanda ha sido cancelada.

**Consumidores**: Reservas, Notificaciones, Analytics

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440036",
  "type": "sala.comanda.cancelada",
  "timestamp": "2026-03-07T13:10:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "mesaId": "550e8400-e29b-41d4-a716-446655440002",
    "mesaNumero": 12,
    "codigo": "CMD-A7B3",
    "camareroId": "550e8400-e29b-41d4-a716-446655440020",
    "horaApertura": "2026-03-07T13:00:00Z",
    "horaCancelacion": "2026-03-07T13:10:00Z",
    "motivo": "Cliente se retiró",
    "canceladoPor": "550e8400-e29b-41d4-a716-446655440037",
    "nombreCancelador": "María López",
    "pedidosCancelados": 2,
    "totalPedidos": 0
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440038",
    "userId": "550e8400-e29b-41d4-a716-446655440037"
  }
}
```

---

### 8. sala.descuento.aplicado

**Descripción**: Se ha aplicado un descuento a una comanda.

**Consumidores**: Analytics, Auditoría

**Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440039",
  "type": "sala.descuento.aplicado",
  "timestamp": "2026-03-07T14:00:00Z",
  "source": "sala-service",
  "version": "1.0",
  "data": {
    "comandaId": "550e8400-e29b-41d4-a716-446655440019",
    "codigo": "CMD-A7B3",
    "porcentaje": 10.00,
    "monto": 4.55,
    "totalAnterior": 45.50,
    "totalNuevo": 40.95,
    "motivo": "Cumpleaños del cliente",
    "aplicadoPor": "550e8400-e29b-41d4-a716-446655440037",
    "nombreAplicador": "María López"
  },
  "metadata": {
    "traceId": "550e8400-e29b-41d4-a716-446655440040",
    "userId": "550e8400-e29b-41d4-a716-446655440037"
  }
}
```

---

## Manejo de Idempotencia

### Tabla de Eventos Procesados

```sql
CREATE TABLE eventos_procesados (
    event_id UUID PRIMARY KEY,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_evento VARCHAR(50) NOT NULL,
    origen VARCHAR(50) NOT NULL
);
```

### Lógica de Procesamiento

```java
public void procesarEvento(Evento evento) {
    // 1. Verificar si ya fue procesado
    if (eventoRepository.existsById(evento.getEventId())) {
        log.info("Evento {} ya procesado, ignorando", evento.getEventId());
        return;
    }
    
    // 2. Procesar evento según tipo
    switch (evento.getType()) {
        case "reserva.created":
            procesarReservaCreada(evento);
            break;
        // ... otros casos
    }
    
    // 3. Marcar como procesado
    eventoRepository.save(new EventoProcesado(
        evento.getEventId(),
        evento.getType(),
        evento.getSource()
    ));
    
    // 4. ACK a Redis
    redisTemplate.opsForStream().acknowledge(
        streamInput, 
        consumerGroup, 
        evento.getRedisId()
    );
}
```

---

## Configuración Redis

### application.yml

```yaml
app:
  redis:
    stream-input: reservas.events
    stream-output: sala.events
    consumer-group: sala-group
```

### Java Config

```java
@Configuration
public class RedisConfig {
    
    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> 
            streamContainer(RedisConnectionFactory factory) {
        
        StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> 
            options = StreamMessageListenerContainerOptions.builder()
                .pollTimeout(Duration.ofSeconds(2))
                .build();
        
        StreamMessageListenerContainer<String, MapRecord<String, String, String>> 
            container = StreamMessageListenerContainer.create(factory, options);
        
        // Crear consumer group si no existe
        try {
            redisTemplate.opsForStream()
                .createGroup(streamInput, ReadOffset.latest(), consumerGroup);
        } catch (Exception e) {
            // Grupo ya existe
        }
        
        // Suscribir consumer
        container.receiveAutoAck(
            Consumer.from(consumerGroup, "sala-consumer-" + UUID.randomUUID()),
            StreamOffset.create(streamInput, ReadOffset.lastConsumed()),
            this::handleMessage
        );
        
        return container;
    }
}
```

---

## Flujos de Eventos Completos

### Flujo 1: Cliente con Reserva Llega y Come

```
1. reservas-service  → reserva.created          → sala-service
2. sala-service      → sala.comanda.abierta     → reservas-service
3. sala-service      → sala.mesa.estado-cambiada→ reservas-service
4. sala-service      → sala.pedido.creado       → carta-service
5. carta-service     → ingrediente.stock.bajo   → sala-service (alerta)
6. sala-service      → sala.pedido.estado-cambiado → [cocina, mesas]
7. sala-service      → sala.cuenta.cerrada      → reservas-service
8. sala-service      → sala.comanda.cobrada     → analytics
9. sala-service      → sala.mesa.estado-cambiada→ reservas-service (LIBRE)
```

### Flujo 2: Cliente Sin Reserva (Walk-in)

```
1. sala-service      → sala.comanda.abierta     → reservas-service
2. reservas-service  → mesa.blocked             → sala-service (bloqueo temporal)
3. sala-service      → sala.pedido.creado       → carta-service
4. ... (igual que flujo 1)
```

---

**Versión**: 1.0.0  
**Actualizado**: 2026-03-07  
**Autor**: Equipo Suances
