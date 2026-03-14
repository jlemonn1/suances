# Personnel Service - Microservicio de Seguridad y Personal

## Descripción
Este microservicio es el núcleo de seguridad y gestión de usuarios del ecosistema Suances. Se encarga de la autenticación de usuarios, la gestión de roles y la firma de tokens JWT utilizados por el resto de los servicios para validar la identidad y los permisos de las peticiones.

## Tecnologías Principales
- **Java 21 + Spring Boot 3.5.11**
- **Spring Security** para autenticación y autorización.
- **JJWT (Java JWT)** para la generación y firma de tokens.
- **Spring Data JPA + PostgreSQL** para la persistencia de usuarios y auditoría.
- **Redis** para soporte de sesiones o caché (opcional).
- **Lombok** para reducir el código boilerplate.

## Configuración y Variables de Entorno
El servicio utiliza `java-dotenv` para cargar variables de entorno. Asegúrate de configurar las siguientes variables en un archivo `.env` o en tu entorno:

| Variable | Descripción | Valor por Defecto |
| --- | --- | --- |
| `DB_HOST` | Host de la base de datos PostgreSQL | `localhost` |
| `DB_NAME_PERSONAL` | Nombre de la base de datos | `personal` |
| `JWT_SECRET` | Clave secreta para firmar tokens | *(Ver application.yml)* |
| `ADMIN_USERNAME` | Usuario administrador creado al inicio | `admin` |
| `ADMIN_PASSWORD` | Contraseña del administrador | `admin123` |

## Roles Disponibles
El sistema utiliza los siguientes roles de usuario:
- **OWNER**: Acceso total a la gestión de personal y configuración.
- **MANAGER**: Gestión operativa y visualización de personal.
- **WAITER**: Acceso a operaciones de servicio y creación de anotaciones.
- **CUSTOMER**: Rol para clientes (reservas online).

## Endpoints Principales

### Autenticación (`/auth`)
- `POST /login`: Inicia sesión y devuelve un token JWT con el rol del usuario.
- `GET /hash?password={pwd}`: Utilidad para generar un hash BCrypt de una contraseña.

### Gestión de Personal (`/personnel`)
- `POST /`: Crea un nuevo miembro del personal (Requiere `OWNER`).
- `GET /`: Lista a todos los usuarios (Requiere `OWNER` o `MANAGER`).
- `GET /{id}`: Obtiene detalles de un usuario.
- `PUT /{id}`: Actualiza la información de un usuario.
- `PATCH /{id}/role`: Cambia el rol de un usuario (Requiere `OWNER`).
- `DELETE /{id}`: Desactiva a un usuario.
- `PATCH /{id}/modo-espia`: Activa/Desactiva el seguimiento detallado de acciones para un usuario.

### Anotaciones de Personal
- `POST /anotaciones`: Crea una nueva anotación sobre un miembro del personal.
- `GET /anotaciones`: Lista todas las anotaciones (Requiere `OWNER`).

## Ejecución Local
1. Asegúrate de tener PostgreSQL y Redis activos (puedes usar la infraestructura base del proyecto).
2. Configura tu archivo `.env`.
3. Ejecuta con Maven:
   ```bash
   mvn spring-boot:run
   ```
   El servicio arrancará en el puerto **8085** bajo el contexto path `/suances` (o `/api/personal` según configuración activa).

---
© 2026 Equipo Suances
