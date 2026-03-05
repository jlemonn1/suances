# 📗 Playbook Owner — Flujos del Micro de Reservas

Documento operativo para el **Propietario (Owner)** que centraliza cómo debe interactuar con el micro de Reservas desde la app (suances-app) y qué esperar del backend (`rest-reserva-service`). Cada flujo detalla entradas, pasos UI recomendados, APIs implicadas, eventos publicados y métricas a vigilar.

> Referencias técnicas: `docs/reservas/base.md`, `docs/reservas/fase1.md`, `docs/reservas/reservas-service-SPEC.md`, `backend/rest-reserva-service`.

---

## 1. Roles y permisos relevantes

| Acción clave | OWNER | MANAGER | WAITER | CUSTOMER |
| --- | --- | --- | --- | --- |
| Configuración salas/mesas/franjas | ✅ | ❌ | ❌ | ❌ |
| Reservas manuales | ✅ | ✅ | ❌ | ❌ |
| Confirmar llegada / no-show | ✅ | ✅ | ✅ | ❌ |
| Bloqueos manuales | ✅ | ✅ | ❌ | ❌ |
| Waitlist (promociones / notificar) | ✅ | ✅ | ❌ | ❌ |
| Reservas online | ❌ (solo visión) | ❌ | ❌ | ✅ |

La vista de Owner debe exponer controles completos de todos los flujos; Manager verá un subconjunto y Waiter únicamente acciones operativas de reservas en curso.

---

## 2. Mapa de flujos (Owner)

```mermaid
flowchart LR
  A[Configurar Salas/Mesas] --> B[Configurar Franjas]
  B --> C[Reservas Manuales]
  C --> D[Bloqueos Manuales]
  D --> E[Waitlist & Promociones]
  C --> F[Seguimiento Reservas Online]
  F --> E
  G[Eventos Sala (sala.events)] --> D
  D --> H[Métricas & Alertas Owner]
  E --> H
```

Cada bloque se detalla a continuación con pasos concretos para la interfaz Owner.

---

## 3. Flujos detallados

### 3.1 Configuración estructural (Salas & Mesas)

**Objetivo**: definir espacios y mesas antes de abrir reservas.

**Entradas**
- Datos físicos del local (nombres de salas, capacidades, layout/grid básico).
- Información de mesas: número por sala, capacidad, posición y visibilidad online.

**Pasos UI recomendados**
1. Desde la vista Owner → sección “Espacios”.
2. Crear sala (`POST /salas`) con nombre, capacidad máxima y layout (guardar polígonos si existe editor). Mostrar preview del plano.
3. Para cada sala → listado de mesas:
   - botón “Añadir mesa” → formulario (`POST /salas/{salaId}/mesas`).
   - permitir drag&drop para ajustar `posX/posY`, ancho/alto (persistir via `PATCH /mesas/{id}`).
4. Validar numeración única por sala antes de enviar.
5. Mostrar indicadores: #mesas activas, capacidad total, mesas visibles online.

**APIs**
- `POST /salas`, `GET /salas`, `PUT /salas/{id}`, `DELETE /salas/{id}`.
- `POST /salas/{salaId}/mesas`, `GET /salas/{salaId}/mesas`, `PATCH /mesas/{id}`.

**Eventos / efectos**
- No publica eventos externos en esta fase; cambios impactan inmediatamente en asignación.

**Riesgos & métricas**
- Riesgo: layout inconsistente → añadir validaciones UI (mínimo 3 vértices, `hora_inicio < hora_fin`).
- Métrica sugerida: `salas_configuradas_total`, `mesas_visible_online_total`.

### 3.2 Configuración de franjas horarias

**Objetivo**: definir bloques reservables (comida, cena, eventos).

**Entradas**
- Horarios de servicio, tipos (COMIDA/CENA/ESPECIAL), estado activo.

**Pasos UI**
1. Sección “Franjas” → tabla con nombre, tipo, hora inicio/fin, estado.
2. Crear/editar con formulario (`POST /franjas`, `PUT /franjas/{id}`).
3. Permitir activar/desactivar rápidamente (toggle → `PUT`/`DELETE` soft).
4. Mostrar validación en vivo (`hora_inicio < hora_fin`).

**APIs**
- `POST /franjas`, `GET /franjas`, `PUT /franjas/{id}`, `DELETE /franjas/{id}`.

**Riesgos & métricas**
- Si se desactiva una franja activa, advertir impacto en reservas existentes.
- Métrica: `franjas_activas_total` para dashboards.

### 3.3 Reservas manuales (Owner)

**Objetivo**: registrar reservas telefónicas/in situ, modificar datos y cancelar.

**Entradas**
- Datos cliente (nombre, teléfono, email opcional), fecha, franja, #comensales, mesa deseada (opcional), notas.

**Pasos UI**
1. Vista “Reservas manuales”: calendario/agenda por fecha + franja.
2. “Nueva reserva” → formulario con selector de sala/mesa; si no se elige mesa, usar recomendación del motor.
3. Al guardar (`POST /reservas`):
   - Mostrar confirmación con código `RSV-XXXX`.
   - Si se usó `force=true`, exigir motivo en notas.
4. Permitir acciones sobre cada reserva:
   - Editar (mismo formulario, `PATCH` futuro).
   - Confirmar llegada / marcar no-show (`POST /reservas/{id}/confirmar` etc. cuando se implementen).
   - Cancelar (`DELETE /reservas/{id}`) pidiendo motivo.

**APIs**
- `GET /reservas?fecha=...&franjaId=...` para la agenda.
- `POST /reservas` con `force=true|false`.
- `DELETE /reservas/{id}` (en backend actual responde con payload actualizado).

**Eventos**
- `reserva.created`, `reserva.cancelled` publicados a `reservas.events` para Sala/Notificaciones.

**Riesgos & métricas**
- Riesgo: doble asignación → UI debe bloquear botón mientras se confirma respuesta.
- Métricas: `reservas_total{estado}`, `allocation_time_ms` (exponer en dashboard Owner).

### 3.4 Supervisión reservas online

**Objetivo**: dar visibilidad de reservas generadas por clientes y ofrecer herramientas de reacción.

**Entradas**
- Stream de reservas online (`reserva.created` con origen ONLINE), estado `PENDIENTE` hasta confirmación automática/manual.

**Pasos UI**
1. Panel “Reservas online” con filtros por fecha/franja.
2. Mostrar destacadas las reservas en estado `PENDIENTE` que requieren validación (según reglas futuras de confirmación).
3. Notificar al Owner cuando una reserva online no encuentre mesa → crear entrada en waitlist y mostrar banner “Clientes en espera”.
4. Posibilidad de convertir reserva de waitlist en manual (ver sección 3.6).

**APIs**
- `GET /public/reservas/{codigo}` (para búsqueda rápida por código).
- `POST /public/reservas/consultar` (simular vista cliente si es necesario para asistencia telefónica).

**Eventos & métricas**
- Seguir `reserva.created` en `reservas.events` para mostrar feed en tiempo real (opcional vía WebSocket/Redis bridge).
- Métrica: `reservas_online_pendientes`, `waitlist_size`.

### 3.5 Bloqueos (manuales y automáticos)

**Objetivo**: evitar que mesas específicas se reserven por mantenimiento/eventos o por integración con Sala.

**Entradas**
- Peticiones manuales (Owner) con tipo `ONLINE` o `TOTAL`.
- Eventos `sala.order.started` / `sala.order.closed` provenientes del micro Sala.

**Pasos UI**
1. Desde la vista de mesas → acción “Bloquear” que abre modal con:
   - Tipo bloqueo (ONLINE/TOTAL/MANTENIMIENTO/EVENTO).
   - Rango de fechas y franjas afectadas.
   - Motivo.
   - Envío a `POST /mesas/{id}/bloqueos`.
2. Listar bloqueos activos con opciones de liberar (`DELETE /mesas/{id}/bloqueos/{bloqueoId}`).
3. Mostrar alertas cuando el consumer `SalaEventConsumer` cree bloqueos `EVENTO_AUTO` (p.ej. color rojo + badge “Bloqueada por Sala”).

**APIs/Eventos**
- `POST /mesas/{id}/bloqueos`, `DELETE /mesas/{id}/bloqueos/{bloqueoId}`.
- Consumo de `sala.events` (solo backend) → UI debe reflejar cambios vía polling/listado.
- Publicación `mesa.blocked`, `mesa.released` (futuro) para sincronizar Sala.

**Métricas**
- `mesas_bloqueadas_total`, `eventos_sala_lag_ms` (si se detecta retraso en consumer).

### 3.6 Waitlist & promociones

**Objetivo**: gestionar clientes en espera cuando no hay mesas disponibles.

**Entradas**
- Entradas `WAITING` generadas automáticamente por `ReservaPublicaService`.

**Pasos UI**
1. Sección “Lista de espera” con filtros por fecha/franja.
2. Mostrar cada entrada con prioridad (nº comensales) y contacto.
3. Acciones disponibles:
   - `Notificar`/`Promover` (cuando exista endpoint, hoy se podría reutilizar `POST /waitlist/{entryId}/notificar` futuro).
   - Cambiar estado (e.g. a `NOTIFIED`, `CONFIRMED`, `CANCELLED`) vía `POST /waitlist/{entryId}/estado?estado=...` (equivalente a `WaitlistService.actualizarEstado`).
4. Atajos para convertir directamente en reserva manual (crear reserva y asociar `reserva_id`).

**APIs**
- `GET /waitlist?fecha=...&franjaId=...`.
- `POST /waitlist/{entryId}/estado?estado=...` (actualmente `WaitlistService#actualizarEstado`).

**Métricas & alertas**
- `waitlist_size` por franja.
- Alertar si un cliente lleva > X minutos en espera o si la cola supera N entradas.

### 3.7 Observabilidad & panel Owner

**Objetivo**: dar control operativo para detectar incidencias.

**KPI sugeridos**
- `reservas_total{estado}`: gráfico diario (pendientes vs confirmadas vs canceladas).
- `allocation_time_ms`: latencia del motor (alertar si P95 > 500 ms).
- `waitlist_size` por franja.
- `mesas_bloqueadas_total` y detalle por motivo.
- `events_lag_ms`: retraso del consumer `SalaEventConsumer` (alerta si > 2000 ms).

**Panel recomendado**
- Tarjetas con números clave (reservas hoy, mesas libres, clientes en espera).
- Timeline con eventos `reserva.created/updated/cancelled`.
- Alertas automáticas si se detecta: overbooking manual, mesa bloqueada > rango previsto, waitlist sin atención > 15 min.

---

## 4. Recomendaciones operativas (Owner)

| Momento | Checklist |
| --- | --- |
| **Antes de apertura** | Revisar salas/mesas activas, confirmar que las franjas del día están activas, limpiar bloqueos expirados, validar métricas (`events_lag_ms`). |
| **Durante servicio** | Monitorizar reservas PENDIENTES y waitlist, registrar reservas manuales en tiempo real, usar dashboard para ver mesas bloqueadas por Sala. |
| **Cierre** | Marcar no-shows, cancelar reservas pendientes, liberar bloqueos temporales, exportar métricas para reporte diario. |

---

## 5. Backlog / decisiones pendientes
- Integración directa de la app Owner con `reservas.events` para actualizaciones en tiempo real (websockets/SSE o polling optimizado).
- Endpoints específicos para confirmar llegada (`POST /reservas/{id}/confirmar`) y no-show (`POST /reservas/{id}/noshow`) — planificados para fases siguientes.
- Automatizar notificaciones (SMS/WhatsApp) vía Micro Notificaciones cuando una reserva pase de waitlist a confirmada.
- Visualización avanzada del plano (render WebGL) y edición colaborativa de layout.
- Feature flags de sincronización con micro Sala (cuando se habilite join tables / ocupación automática).

---

**Conclusión**: este documento debe servir como guía para el diseño de la vista Owner en `suances-app`, garantizando que cada interacción se corresponde con los contratos del micro de Reservas y que el Owner dispone de métricas accionables para gestionar su sala en tiempo real.
