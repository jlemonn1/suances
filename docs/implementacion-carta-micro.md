# Roadmap Implementación - Micro Carta

## Fases de Implementación (Vertical Ascendente)

---

## FASE 1: Infraestructura Base
**Objetivo**: Configurar el entorno técnico mínimo para funcionar

### 1.1 Proyecto Maven + Spring Boot
- [ ] Crear pom.xml con todas las dependencias
- [ ] Crear clase main `CartaApplication.java`
- [ ] Crear application.yml con configuración base
- [ ] Verificar que compila (`mvn compile`)

### 1.2 Base de Datos
- [ ] Crear database `carta` en PostgreSQL
- [ ] Ejecutar schema.sql (todas las tablas)
- [ ] Verificar conexión desde Spring

### 1.3 Configuración Redis
- [ ] Configurar RedisConnectionFactory
- [ ] Probar conectividad básica

---

## FASE 2: Seguridad JWT
**Objetivo**: Autenticación y autorización funcionando

### 2.1 Componentes JWT
- [ ] JwtTokenProvider (generar/validar tokens)
- [ ] JwtAuthenticationFilter
- [ ] JwtAuthenticationEntryPoint
- [ ] SecurityConfig

### 2.2 Roles y Permisos
- [ ] Definir enum Rol (PROPIETARIO, GERENTE, CAMARERO)
- [ ] Configurar reglas de acceso por endpoint
- [ ] Probar con token falso → 401
- [ ] Probar con token válido → acceso según rol

---

## FASE 3: Entidades y Repositorios
**Objetivo**: Mapeo ORM operativo

### 3.1 Entidades Base
- [ ] UnidadMedida (enum)
- [ ] Distribuidor
- [ ] Ingrediente

### 3.2 Repositorios
- [ ] DistribuidorRepository
- [ ] IngredienteRepository (con filtros por activo)

### 3.3 Validación
- [ ] Probar que Hibernate crea las tablas correctamente
- [ ] Verificar constraints (nombre NOT NULL, email OR telefono)

---

## FASE 4: CRUD Ingredientes
**Objetivo**: Gestionar ingredientes con recalculo de escandallos

### 4.1 DTOs Ingrediente
- [ ] IngredienteRequest
- [ ] IngredienteResponse

### 4.2 Servicio Ingrediente
- [ ] crear()
- [ ] listar(activo)
- [ ] obtener(id)
- [ ] actualizar(id) ← recalcula escandallos si cambia precio
- [ ] desactivar(id) ← soft delete

### 4.3 Controlador
- [ ] POST /ingredientes
- [ ] GET /ingredientes
- [ ] GET /ingredientes/{id}
- [ ] PUT /ingredientes/{id}
- [ ] DELETE /ingredientes/{id}

### 4.4 Regla de Negocio
- [ ] Al cambiar precio → buscar escandallos afectados → recalcular coste_total_snapshot

---

## FASE 5: CRUD Distribuidores
**Objetivo**: Gestionar distribuidores

### 5.1 DTOs
- [ ] DistribuidorRequest
- [ ] DistribuidorResponse

### 5.2 Servicio
- [ ] crear()
- [ ] listar()
- [ ] obtener(id)
- [ ] actualizar(id)
- [ ] desactivar(id)

### 5.3 Controlador
- [ ] POST /distribuidores
- [ ] GET /distribuidores
- [ ] GET /distribuidores/{id}
- [ ] PUT /distribuidores/{id}
- [ ] DELETE /distribuidores/{id}

### 5.4 Relación N:M
- [ ] POST /ingredientes/{id}/distribuidores
- [ ] DELETE /ingredientes/{id}/distribuidores/{distId}

---

## FASE 6: Platos
**Objetivo**: Gestión de platos con cálculo de margen

### 6.1 Entidad + Repo
- [ ] Plato
- [ ] PlatoRepository

### 6.2 DTOs
- [ ] PlatoRequest
- [ ] PlatoResponse (con margen calculado)

### 6.3 Servicio
- [ ] crear()
- [ ] listar()
- [ ] obtener(id) ← calcula margen dinámico
- [ ] actualizar(id)
- [ ] desactivar(id)

### 6.4 Controlador
- [ ] POST /platos
- [ ] GET /platos
- [ ] GET /platos/{id}
- [ ] PUT /platos/{id}
- [ ] DELETE /platos/{id}

### 6.5 Margen
- [ ] Fórmula: (precioVenta - costeTotal) / precioVenta
- [ ] Se calcula en tiempo de consulta, NO se almacena

---

## FASE 7: Escandallos
**Objetivo**: Control de costes por plato

### 7.1 Entidades
- [ ] Escandallo
- [ ] EscandalloDetalle
- [ ] EscandalloRepository

### 7.2 DTOs
- [ ] EscandalloRequest
- [ ] EscandalloResponse

### 7.3 Servicio
- [ ] crearOActualizar(platoId, request)
  - Validar que ingredientes existen y están activos
  - Calcular coste_total = SUM(cantidad * precioPorUnidad)
  - Guardar Escandallo + EscandalloDetalle
- [ ] obtener(platoId)
- [ ] eliminar(platoId)

### 7.4 Controlador
- [ ] POST /platos/{platoId}/escandallo
- [ ] GET /platos/{platoId}/escandallo
- [ ] DELETE /platos/{platoId}/escandallo

### 7.5 Recálculo Automático
- [ ] Método público recalcularPorIngrediente(ingredienteId)
- [ ] Llamar desde servicio Ingrediente al cambiar precio

---

## FASE 8: Tipos de Carta
**Objetivo**: Carta por franjas horarias

### 8.1 Entidad + Repo
- [ ] TipoCarta
- [ ] TipoCartaRepository

### 8.2 DTOs
- [ ] TipoCartaRequest
- [ ] TipoCartaResponse

### 8.3 Servicio
- [ ] crear() ← validar no solapamiento
- [ ] actualizar() ← validar no solapamiento
- [ ] desactivar()
- [ ] asociarPlatos(tipoCartaId, platoIds) ← reemplaza lista
- [ ] obtenerCartaActiva() ← según hora actual

### 8.4 Controlador
- [ ] POST /tipos-carta
- [ ] GET /tipos-carta
- [ ] GET /tipos-carta/{id}
- [ ] PUT /tipos-carta/{id}
- [ ] DELETE /tipos-carta/{id}
- [ ] POST /tipos-carta/{id}/platos
- [ ] GET /carta/activa

### 8.5 Reglas
- [ ] Solo 1 TipoCarta activo por horario
- [ ] Validar hora_inicio < hora_fin
- [ ] GET /carta/activa devuelve solo platos activos

---

## FASE 9: Eventos Redis (Consumidor)
**Objetivo**: Procesar pedidos desde Sala

### 9.1 Modelo de Eventos
- [ ] SalaPedidoEvent (eventId, platoId, cantidad)
- [ ] EventConsumer

### 9.2 Idempotencia
- [ ] EventoProcesadoRepository
- [ ] verificarEventId(eventId) → boolean
- [ ] guardarEventId(eventId)

### 9.3 Procesamiento
- [ ] recibirEvento(SalaPedidoEvent)
- [ ] Verificar idempotencia
- [ ] Incrementar contador_pedidos del plato
- [ ] Descontar stock de ingredientes
- [ ] Detectar cruce de umbral
- [ ] Guardar eventId procesado
- [ ] Todo en @Transactional

### 9.4 Consumer Group
- [ ] Configurar consumer group "carta-group"
- [ ] Leer del stream "sala.events"
- [ ] ACK después de procesar

---

## FASE 10: Eventos Redis (Productor)
**Objetivo**: Emitir alertas de stock bajo

### 10.1 Evento Stock Bajo
- [ ] StockBajoEvent (ingredienteId, stockActual, umbral)
- [ ] EventProducer

### 10.2 Lógica de Emisión
- [ ] En procesamiento de pedido
- [ ] Detectar: stock_previo >= umbral AND stock_actual < umbral
- [ ] Publicar en stream "carta.events"

### 10.3 No repetición
- [ ] Mantener flag "alerta_enviada" en ingrediente
- [ ] Resetear cuando stock >= umbral

---

## FASE 11: Imágenes (Opcional)
**Objetivo**: Gestión de fotos de platos

### 11.1 Entidad
- [ ] PlatoImagen

### 11.2 Endpoints
- [ ] POST /platos/{id}/imagenes
- [ ] GET /platos/{id}/imagenes
- [ ] DELETE /platos/{id}/imagenes/{imgId}

---

## FASE 12: Testing e Integración
**Objetivo**: Sistema robusto

### 12.1 Unit Tests
- [ ] Tests de servicios principales
- [ ] Tests de cálculo de margen
- [ ] Tests de recalculo de escandallos

### 12.2 Integración
- [ ] Test endpoint completo con JWT
- [ ] Test flujo pedido → descuento stock

### 12.3 Validación Final
- [ ] Verificar todos los endpoints
- [ ] Probar flujos completos
- [ ] Revisar logs

---

## Orden de Implementación Recomendado

```
FASE 1 ──────► FASE 2 ──────► FASE 3 ──────► FASE 4
  │              │              │              │
Infraestructura  JWT         Entidades    Ingredientes
                               Base         + Recálculo

    │
    ▼
FASE 5 ──────► FASE 6 ──────► FASE 7 ──────► FASE 8
    │              │              │              │
Distribuidores  Platos      Escandallos   Tipos Carta
                 +Margen      +Coste         +Activa

    │
    ▼
FASE 9 ──────► FASE 10 ─────► FASE 11 ────► FASE 12
    │              │              │              │
Consumidor    Productor      Imágenes      Testing
Redis          Stock Bajo
```

---

## Hitos de Validación

| Hito | Criterio |
|------|----------|
| **M1** | Compila y arranca en puerto 8081 |
| **M2** | JWT funciona (401 sin token, 200 con token válido) |
| **M3** | CRUD Ingredientes operativo |
| **M4** | Cambio precio ingrediente recalcula escandallos |
| **M5** | Plato con margen calculado |
| **M6** | Carta activa devuelve platos correctos por hora |
| **M7** | Evento pedido descuenta stock |
| **M8** | Evento stock bajo se emite correctamente |

---

## Notas

1. **Vertical Ascendente**: Cada fase se apoya en la anterior
2. **Núcleo Firme**: Seguridad y datos base antes de lógica de negocio
3. **Iteraciones**: Cada fase puede completarse en 1-2 días
4. **Validación**: Probar cada fase antes de avanzar
