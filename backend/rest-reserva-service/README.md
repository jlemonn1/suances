# Reservas Service

Microservicio Spring Boot encargado de la gestión estructural y operativa de reservas para Suances: salas, mesas, franjas horarias, reservas (online y manuales), bloqueos y waitlist.

## Stack principal

- Java 21 + Spring Boot 3.5.11
- Arquitectura hexagonal (puertos/adaptadores)
- PostgreSQL para persistencia
- Redis Streams para publicación/consumo de eventos
- Spring Security + JWT (tokens emitidos por `personnel-service`)
- OpenAPI (springdoc) para documentación interactiva

## Requisitos locales

| Herramienta | Versión recomendada |
| --- | --- |
| Java JDK | 21 |
| Maven | 3.9.x |
| Docker / Docker Compose | 26+ |

## Configuración

1. Copia el archivo `.env.example` como `.env` y ajusta credenciales (PostgreSQL, Redis, JWT, etc.).
2. Levanta dependencias locales:
   ```bash
   docker compose up -d reservas-db reservas-redis
   ```
3. Ejecuta la aplicación:
   ```bash
   ./mvnw spring-boot:run
   ```

Los endpoints privados están bajo `/api/reservas/**` y requieren token JWT válido. Los públicos están bajo `/api/reservas/public/**`.

## Carpetas relevantes

- `src/main/java/com/suances/reservas/config`: configuración (OpenAPI, Redis, seguridad, etc.).
- `src/main/java/com/suances/reservas/domain`: entidades del dominio y enums.
- `src/main/java/com/suances/reservas/repository`: repositorios Spring Data JPA.
- `src/main/java/com/suances/reservas/service`: casos de uso + motor de asignación.
- `src/main/java/com/suances/reservas/controller`: endpoints REST privados/públicos.

## Próximos pasos

- Completar lógica del motor de asignación y waitlist.
- Implementar consumer/productor de eventos Redis Streams.
- Añadir migraciones y tests de integración.
