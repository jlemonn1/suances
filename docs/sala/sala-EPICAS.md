# Épicas e Historias de Usuario - Sala Service

## Resumen del Proyecto

**Microservicio**: rest-sala-service  
**Objetivo**: Gestión operativa de sala (comandas, pedidos, estados de mesas)  
**Área**: Operaciones del restaurante  

---

## Mapa de Épicas

```
┌─────────────────────────────────────────────────────────────────┐
│                     ÉPICAS - SALA SERVICE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   EPIC-01   │  │   EPIC-02   │  │   EPIC-03   │             │
│  │   Comandas  │  │   Pedidos   │  │   Mesas     │             │
│  │   y Cuentas │  │             │  │   y Estados │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐             │
│  │   EPIC-04   │  │   EPIC-05   │  │   EPIC-06   │             │
│  │   Eventos   │  │   Reportes  │  │   Integrac. │             │
│  │   y Sync    │  │   y Stats   │  │   Externas  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## EPIC-01: Gestión de Comandas y Cuentas

**Como** camarero/gerente/propietario  
**Quiero** gestionar comandas de mesa  
**Para** atender a los clientes y procesar sus pedidos

### Historias

#### HU-01.01: Abrir Comanda
**Como** camarero  
**Quiero** abrir una nueva comanda en una mesa  
**Para** empezar a tomar pedidos

**Criterios de Aceptación**:
- [ ] Dado una mesa libre, cuando abro comanda, entonces se crea con código único CMD-XXXX
- [ ] Dado una mesa ocupada, cuando intento abrir comanda, entonces recibo error 409
- [ ] Dado que abro comanda, cuando se crea, entonces estado es ABIERTA
- [ ] Dado que abro comanda, cuando se crea, entonces total inicial es 0
- [ ] Dado que abro comanda, cuando se crea, entonces se asigna camarero automáticamente

**Prioridad**: Alta  
**Estimación**: 5 SP  
**Dependencias**: Ninguna

---

#### HU-01.02: Ver Cuenta Detallada
**Como** camarero  
**Quiero** ver el desglose completo de una cuenta  
**Para** mostrar al cliente antes de cobrar

**Criterios de Aceptación**:
- [ ] Dado una comanda con pedidos, cuando consulto cuenta, entonces veo lista de items
- [ ] Dado una cuenta, cuando la consulto, entonces veo subtotal, descuentos y total
- [ ] Dado una cuenta, cuando la consulto, entonces veo tiempo transcurrido desde apertura
- [ ] Dado pedidos cancelados, cuando veo cuenta, entonces no aparecen en el desglose

**Prioridad**: Alta  
**Estimación**: 3 SP

---

#### HU-01.03: Cerrar Comanda (Pedir Cuenta)
**Como** camarero  
**Quiero** cerrar una comanda para cobro  
**Para** preparar el pago del cliente

**Criterios de Aceptación**:
- [ ] Dado comanda en estado SERVIDA, cuando cierro, entonces pasa a CUENTA
- [ ] Dado comanda en estado CUENTA, cuando intento agregar pedido, entonces recibo advertencia
- [ ] Dado comanda cerrada, cuando consulto, entonces veo resumen final

**Prioridad**: Alta  
**Estimación**: 3 SP

---

#### HU-01.04: Cobrar Comanda
**Como** camarero  
**Quiero** procesar el cobro de una cuenta  
**Para** finalizar la atención al cliente

**Criterios de Aceptación**:
- [ ] Dado comanda en CUENTA, cuando cobro, entonces registro tipo de pago
- [ ] Dado que cobro, cuando proceso pago, entonces calculo cambio correctamente
- [ ] Dado comanda cobrada, cuando consulto, entonces estado es COBRADA
- [ ] Dado comanda cobrada, cuando termina, entonces mesa pasa a LIBRE

**Prioridad**: Alta  
**Estimación**: 5 SP

---

#### HU-01.05: Cancelar Comanda
**Como** gerente  
**Quiero** cancelar una comanda  
**Para** gestionar errores o retiros de clientes

**Criterios de Aceptación**:
- [ ] Dado comanda sin pedidos servidos, cuando cancelo, entonces se libera la mesa
- [ ] Dado comanda con pedidos servidos, cuando intento cancelar, entonces recibo error 422
- [ ] Dado que cancelo comanda, cuando se procesa, entonces se registra motivo
- [ ] Dado que cancelo comanda, cuando es exitoso, entonces se emite evento

**Prioridad**: Media  
**Estimación**: 3 SP  
**Nota**: Solo OWNER y MANAGER pueden cancelar

---

#### HU-01.06: Aplicar Descuento
**Como** gerente  
**Quiero** aplicar un descuento a una cuenta  
**Para** ofertas especiales o cumpleaños

**Criterios de Aceptación**:
- [ ] Dado comanda en estado CUENTA o anterior, cuando aplico descuento, entonces se recalcula total
- [ ] Dado descuento aplicado, cuando veo cuenta, entonces veo desglose con descuento
- [ ] Dado descuento, cuando lo aplico, entonces registro porcentaje y motivo
- [ ] Dado que aplico descuento, entonces registro quien lo aplicó

**Prioridad**: Media  
**Estimación**: 5 SP

---

## EPIC-02: Gestión de Pedidos

**Como** camarero  
**Quiero** gestionar pedidos individuales  
**Para** coordinar con cocina y servicio

### Historias

#### HU-02.01: Agregar Pedido
**Como** camarero  
**Quiero** agregar un pedido a una comanda  
**Para** registrar lo que el cliente ordena

**Criterios de Aceptación**:
- [ ] Dado comanda abierta, cuando agrego pedido, entonces se guarda con precio congelado
- [ ] Dado que agrego pedido, cuando se guarda, entonces estado es PENDIENTE
- [ ] Dado que agrego pedido, cuando se procesa, entonces se emite evento a carta-service
- [ ] Dado notas en pedido, cuando se guarda, entonces son visibles para cocina

**Prioridad**: Alta  
**Estimación**: 5 SP  
**Dependencias**: Integración con carta-service

---

#### HU-02.02: Cambiar Estado de Pedido
**Como** camarero/cocina  
**Quiero** actualizar el estado de un pedido  
**Para** coordinar flujo cocina-servicio

**Criterios de Aceptación**:
- [ ] Dado pedido PENDIENTE, cuando pasa a EN_PREPARACION, entonces notifica mesa
- [ ] Dado pedido EN_PREPARACION, cuando está listo, entonces cambia a LISTO
- [ ] Dado pedido LISTO, cuando se sirve, entonces cambia a SERVIDO
- [ ] Dado cambio de estado, cuando ocurre, entonces se registra timestamp

**Prioridad**: Alta  
**Estimación**: 5 SP

---

#### HU-02.03: Cancelar Pedido
**Como** camarero  
**Quiero** cancelar un pedido específico  
**Para** corregir errores o cambios de cliente

**Criterios de Aceptación**:
- [ ] Dado pedido no servido, cuando cancelo, entonces se marca como CANCELADO
- [ ] Dado pedido servido, cuando intento cancelar, entonces recibo error 422
- [ ] Dado que cancelo pedido, cuando se procesa, entonces se recalcula total de comanda
- [ ] Dado cancelación, cuando se procesa, entonces se registra motivo

**Prioridad**: Media  
**Estimación**: 3 SP

---

#### HU-02.04: Ver Pedidos por Estado
**Como** camarero  
**Quiero** filtrar pedidos por su estado  
**Para** saber qué está pendiente o listo

**Criterios de Aceptación**:
- [ ] Dado comanda con múltiples pedidos, cuando filtro, entonces veo por estado
- [ ] Dado pedidos en diferentes estados, cuando veo comanda, entonces veo resumen por estado
- [ ] Dado filtro activo, cuando cambia estado, entonces lista se actualiza

**Prioridad**: Media  
**Estimación**: 3 SP

---

## EPIC-03: Gestión de Mesas y Estados

**Como** gerente  
**Quiero** gestionar el estado operativo de las mesas  
**Para** optimizar la rotación y atención

### Historias

#### HU-03.01: Ver Estado de Mesas
**Como** camarero  
**Quiero** ver el estado de todas las mesas  
**Para** saber cuáles están disponibles u ocupadas

**Criterios de Aceptación**:
- [ ] Dado mesas configuradas, cuando consulto, entonces veo lista con estado actual
- [ ] Dado mesa ocupada, cuando consulto, entonces veo camarero y comanda activa
- [ ] Dado mesa con reserva, cuando consulto, entonces veo nombre del cliente
- [ ] Dado lista de mesas, cuando aplico filtro, entonces filtra por sala o estado

**Prioridad**: Alta  
**Estimación**: 5 SP  
**Dependencias**: Sincronización con reservas-service

---

#### HU-03.02: Cambiar Estado de Mesa (Manual)
**Como** gerente  
**Quiero** cambiar manualmente el estado de una mesa  
**Para** gestionar situaciones especiales

**Criterios de Aceptación**:
- [ ] Dado mesa ocupada, cuando cambio a LIBRE (forzar), entonces se libera comanda
- [ ] Dado cambio manual, cuando se procesa, entonces se registra motivo
- [ ] Dado camarero sin permisos, cuando intenta cambiar, entonces recibe 403
- [ ] Dado cambio de estado, cuando ocurre, entonces se emite evento

**Prioridad**: Media  
**Estimación**: 3 SP

---

#### HU-03.03: Asignar Camarero a Mesa
**Como** gerente  
**Quiero** asignar un camarero a una mesa  
**Para** distribuir la carga de trabajo

**Criterios de Aceptación**:
- [ ] Dado mesa libre, cuando asigno camarero, entonces queda asignado
- [ ] Dado mesa ocupada, cuando cambio camarero, entonces se actualiza asignación
- [ ] Dado camarero asignado, cuando abre comanda, entonces se asocia automáticamente

**Prioridad**: Baja  
**Estimación**: 3 SP

---

#### HU-03.04: Sincronizar Mesas con Reservas
**Como** sistema  
**Quiero** mantener sincronizada la información de mesas  
**Para** consistencia entre servicios

**Criterios de Aceptación**:
- [ ] Dado evento reserva.created, cuando llega, entonces actualizo mesa operativa
- [ ] Dado evento mesa.blocked, cuando llega, entonces marco mesa como no disponible
- [ ] Dado cambio en reservas-service, cuando ocurre, entonces se refleja en < 5 segundos

**Prioridad**: Alta  
**Estimación**: 8 SP  
**Dependencias**: Configuración de Redis Streams

---

## EPIC-04: Eventos y Sincronización

**Como** sistema  
**Quiero** comunicarme con otros microservicios vía eventos  
**Para** mantener consistencia y notificar cambios

### Historias

#### HU-04.01: Consumir Eventos de Reservas
**Como** desarrollador  
**Quiero** consumir eventos de reservas.events  
**Para** mantener mesas sincronizadas

**Criterios de Aceptación**:
- [ ] Dado evento reserva.created en stream, cuando se recibe, entonces procesa correctamente
- [ ] Dado evento reserva.cancelled, cuando se recibe, entonces libera mesa si aplica
- [ ] Dado evento duplicado, cuando se detecta, entonces se ignora (idempotencia)
- [ ] Dado error de procesamiento, cuando ocurre, entonces se reintenta con backoff

**Prioridad**: Alta  
**Estimación**: 8 SP  
**Dependencias**: Redis Streams configurado

---

#### HU-04.02: Emitir Eventos de Comanda
**Como** desarrollador  
**Quiero** publicar eventos al abrir/cerrar comandas  
**Para** notificar a otros servicios

**Criterios de Aceptación**:
- [ ] Dado que abro comanda, cuando se crea, entonces emito sala.comanda.abierta
- [ ] Dado que cierro cuenta, cuando se procesa, entonces emito sala.cuenta.cerrada
- [ ] Dado que cobro, cuando se confirma, entonces emito sala.comanda.cobrada
- [ ] Dado evento emitido, cuando se publica, entonces incluye traceId

**Prioridad**: Alta  
**Estimación**: 5 SP

---

#### HU-04.03: Emitir Eventos de Pedido
**Como** desarrollador  
**Quiero** publicar eventos de pedidos  
**Para** notificar a carta-service y cocina

**Criterios de Aceptación**:
- [ ] Dado nuevo pedido, cuando se crea, entonces emito sala.pedido.creado
- [ ] Dado cambio de estado, cuando ocurre, entonces emito sala.pedido.estado-cambiado
- [ ] Dado evento a carta, cuando se emite, entonces incluye platoId y cantidad

**Prioridad**: Alta  
**Estimación**: 5 SP

---

#### HU-04.04: Garantizar Idempotencia
**Como** sistema  
**Quiero** evitar procesar eventos duplicados  
**Para** mantener consistencia de datos

**Criterios de Aceptación**:
- [ ] Dado evento ya procesado, cuando llega, entonces se detecta y omite
- [ ] Dado evento nuevo, cuando se procesa, entonces se registra en tabla
- [ ] Dado tabla de eventos, cuando crece, entonces se limpian registros > 7 días

**Prioridad**: Alta  
**Estimación**: 5 SP

---

## EPIC-05: Reportes y Estadísticas

**Como** gerente/propietario  
**Quiero** ver estadísticas de operación  
**Para** tomar decisiones de negocio

### Historias

#### HU-05.01: Resumen del Día
**Como** gerente  
**Quiero** ver estadísticas del día  
**Para** conocer el rendimiento

**Criterios de Aceptación**:
- [ ] Dado consulta de resumen, cuando accedo, entonces veo total de comandas
- [ ] Dado resumen del día, cuando lo consulto, entonces veo ventas totales
- [ ] Dado resumen, cuando lo consulto, entonces veo promedio por comanda
- [ ] Dado resumen, cuando lo consulto, entonces veo rotación de mesas

**Prioridad**: Media  
**Estimación**: 5 SP

---

#### HU-05.02: Rendimiento por Camarero
**Como** propietario  
**Quiero** ver estadísticas por camarero  
**Para** evaluar desempeño

**Criterios de Aceptación**:
- [ ] Dado período de consulta, cuando consulto, entonces veo comandas por camarero
- [ ] Dado camareros activos, cuando filtro, entonces veo ventas generadas
- [ ] Dado estadísticas, cuando consulto, entonces veo tiempo promedio de atención

**Prioridad**: Baja  
**Estimación**: 5 SP

---

#### HU-05.03: Historial de Comandas
**Como** gerente  
**Quiero** consultar historial de comandas  
**Para** auditoría y análisis

**Criterios de Aceptación**:
- [ ] Dado historial, cuando filtro por fecha, entonces veo comandas de ese período
- [ ] Dado comanda histórica, cuando consulto detalle, entonces veo pedidos completos
- [ ] Dado consulta, cuando aplico filtros, entonces puedo buscar por mesa o camarero

**Prioridad**: Media  
**Estimación**: 3 SP

---

## EPIC-06: Integraciones Externas (Futuro)

### Historias Futuras

#### HU-06.01: Integración con TPV
**Prioridad**: Baja  
**Descripción**: Integrar con sistemas de pago externos

#### HU-06.02: Pantallas de Cocina
**Prioridad**: Media  
**Descripción**: Mostrar pedidos en tiempo real en pantallas de cocina

#### HU-06.03: Notificaciones Push
**Prioridad**: Baja  
**Descripción**: Notificar a camareros cuando pedidos están listos

#### HU-06.04: Split de Cuenta
**Prioridad**: Baja  
**Descripción**: Permitir dividir la cuenta entre varios clientes

---

## Roadmap de Implementación

### Sprint 1 (Semanas 1-2): Fundamentos
- HU-01.01: Abrir Comanda
- HU-01.02: Ver Cuenta Detallada
- HU-02.01: Agregar Pedido
- HU-03.01: Ver Estado de Mesas

### Sprint 2 (Semanas 3-4): Flujo Completo
- HU-01.03: Cerrar Comanda
- HU-01.04: Cobrar Comanda
- HU-02.02: Cambiar Estado de Pedido
- HU-02.03: Cancelar Pedido

### Sprint 3 (Semanas 5-6): Eventos
- HU-04.01: Consumir Eventos de Reservas
- HU-04.02: Emitir Eventos de Comanda
- HU-04.03: Emitir Eventos de Pedido
- HU-04.04: Garantizar Idempotencia

### Sprint 4 (Semanas 7-8): Avanzado
- HU-01.05: Cancelar Comanda
- HU-01.06: Aplicar Descuento
- HU-03.02: Cambiar Estado de Mesa (Manual)
- HU-03.04: Sincronizar Mesas con Reservas

### Sprint 5 (Semanas 9-10): Reportes
- HU-05.01: Resumen del Día
- HU-05.02: Rendimiento por Camarero
- HU-05.03: Historial de Comandas

---

## Métricas de Éxito

### KPIs Técnicos
- **Tiempo de respuesta API**: P95 < 200ms
- **Disponibilidad**: 99.5% uptime
- **Procesamiento de eventos**: < 2 segundos de lag
- **Cobertura de tests**: > 80%

### KPIs de Negocio
- **Tiempo promedio de atención**: < 60 minutos
- **Precisión de cuentas**: 100% (sin errores de cálculo)
- **Tiempo de sincronización**: < 5 segundos

---

## Definición de Terminado (DoD)

Para cada historia de usuario:

- [ ] Código implementado y revisado
- [ ] Tests unitarios con cobertura > 80%
- [ ] Tests de integración pasando
- [ ] Documentación API actualizada
- [ ] Eventos implementados (si aplica)
- [ ] Revisión de seguridad completada
- [ ] Desplegado en ambiente de staging

---

**Versión**: 1.0.0  
**Última actualización**: 2026-03-07  
**Autor**: Equipo Suances  
**Total Story Points**: 98 SP
