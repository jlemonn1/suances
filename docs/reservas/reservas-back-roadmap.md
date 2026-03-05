# 🚀 Roadmap de Implementación Backend — Micro de Reservas

Este plan divide el delivery del backend en **6 fases consecutivas**. Cada fase la ejecuta un agente especializado y arranca únicamente cuando la anterior ha declarado su _Definition of Done_. Se apoya en la documentación de `docs/reservas` (base funcional, SPEC, esquema SQL y colección Postman).

---

## Fase 1 — Agente de Arquitectura & Domain Blueprint
- **Objetivo**: Consolidar requisitos funcionales en un diseño técnico accionable.
- **Entradas**: `base.md`, `reservas-service-SPEC.md`, decisiones globales de Suances.
- **Entregables**:
  - Diagrama de contexto + límites del micro.
  - Contratos iniciales (REST + eventos) con ejemplos.
  - Lista priorizada de historias técnicas.
- **Checklist DoD**:
  - Riesgos identificados y mitigaciones propuestas.
  - Dependencias externas formalizadas (Sala, Notificaciones, Redis Streams).
- **Trigger siguiente fase**: Handoff del blueprint firmado.

## Fase 2 — Agente de Infra & Scaffold
- **Objetivo**: Preparar la base operativa del servicio.
- **Entradas**: Blueprint fase 1.
- **Entregables**:
  - Repo inicial con árbol `apps/reservas-service` o equivalente.
  - Boilerplate Nest/Fastify (o stack acordada) con linting, tests y Dockerfile.
  - Pipelines mínimos (CI lint + unit) y devcontainer opcional.
- **Checklist DoD**:
  - Comandos `npm test`, `docker compose up reservas-db reservas-service` funcionando.
  - Variables `.env.example` documentadas.
- **Trigger siguiente fase**: Scaffold mergeado en rama develop/main.

## Fase 3 — Agente de Datos & Persistencia
- **Objetivo**: Materializar el modelo relacional y acceso a datos.
- **Entradas**: Esquema SQL de referencia + scaffold.
- **Entregables**:
  - Migraciones iniciales (Sala, Mesa, Franja, Reserva, Bloqueo).
  - ORM mapeado (Prisma/TypeORM) con repositorios y seeds básicos.
  - Pruebas unitarias de repositorio y factories.
- **Checklist DoD**:
  - `npm run test:db` estable y tablas generadas vía migraciones.
  - Documentación de relaciones y constraints críticos.
- **Trigger siguiente fase**: Base de datos versionada y integrada al CI.

## Fase 4 — Agente de Lógica & API Core
- **Objetivo**: Implementar la lógica de reservas y exponer los endpoints prioritarios.
- **Entradas**: Modelos persistentes y SPEC funcional.
- **Entregables**:
  - Casos de uso: CRUD salas/mesas, franjas, creación/modificación/cancelación de reservas.
  - Motor de asignación con reglas de capacidad y bloqueos.
  - Suite de pruebas (unitarias + contract tests vía Postman/Newman).
- **Checklist DoD**:
  - Cobertura lógica crítica ≥ 80%.
  - Documentación OpenAPI/Swagger sincronizada.
- **Trigger siguiente fase**: Pipeline verde + colección Postman actualizada.

## Fase 5 — Agente de Integraciones & Eventos
- **Objetivo**: Conectar el micro con el ecosistema y automatizar flujos inter-micro.
- **Entradas**: API estable fase 4.
- **Entregables**:
  - Publicación/consumo de eventos Redis Streams (p.ej. `ORDER_STARTED`).
  - Webhooks/colas necesarios para Notificaciones.
  - Feature flags para sincronización futura con Micro Sala.
- **Checklist DoD**:
  - Tests de contrato con mocks del micro Sala.
  - Observabilidad mínima (logs estructurados + métricas básicas).
- **Trigger siguiente fase**: Integraciones validadas en entorno staging.

## Fase 6 — Agente de Hardening & Operaciones
- **Objetivo**: Cerrar la release con calidad de producción.
- **Entradas**: Producto funcional con integraciones.
- **Entregables**:
  - Pruebas E2E (reservas happy path + casos límite: overbooking, bloqueos).
  - Chaos/latency tests ligeros y tuning de timeouts/reintentos.
  - Playbook operativo (runbooks, alertas, SLIs/SLOs iniciales).
- **Checklist DoD**:
  - Reporte final con métricas de rendimiento y plan de escalado.
  - Checklist de despliegue firmada + handover a operaciones.
- **Trigger final**: Go-live autorizado y agente de soporte listo.

---

📎 **Coordinación**: Cada agente documenta su output en `docs/reservas/<fase>.md`, registra bloqueos y propone mejoras para fases siguientes. La PMO puede reutilizar este roadmap para lanzar automatizaciones (Agents Ops) o planificar sprints clásicos.
