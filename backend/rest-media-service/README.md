# Media Service - Microservicio de Gestión de Archivos

## Descripción
Este microservicio está especializado en la gestión de activos digitales (imágenes, documentos, etc.) para el ecosistema Suances. Su función principal es actuar como un intermediario seguro para la subida de archivos directamente a **Cloudflare R2** (S3 compatible) mediante la generación de **URLs pre-firmadas**.

## Tecnologías Principales
- **Java 21 + Spring Boot 3.5.11**
- **AWS SDK v2 (S3 Client)** para la interacción con Cloudflare R2.
- **Spring Security (OAuth2 Resource Server)** para la validación de tokens JWT.
- **Lombok** para simplificar el código.
- **Microservice context**: Enfocado únicamente en la generación de enlaces transitorios, delegando la transferencia pesada de archivos al proveedor de storage.

## Configuración y Variables de Entorno
El servicio requiere credenciales de acceso a un bucket compatible con S3:

| Variable | Descripción | Valor sugerido |
| --- | --- | --- |
| `S3_ACCESS_KEY` | Clave de acceso (Access Key ID) | *(Ver panel R2)* |
| `S3_SECRET_KEY` | Clave secreta (Secret Access Key) | *(Ver panel R2)* |
| `S3_BUCKET` | Nombre del bucket | `media` |
| `S3_ACCOUNT_ID` | Cloudflare Account ID | *(ID numérico)* |
| `S3_CDN_DOMAIN` | Dominio personalizado para descarga | `cdn.tudominio.com` |
| `JWT_SECRET` | Clave de firma JWT (compartida) | *(Ver Personnel Service)* |

## Endpoints API

### Gestión de Media (`/api/media`)
- **`GET /upload-url`**: Genera una URL pre-firmada para subir un archivo.
    - **Parámetros**:
        - `extension` (ej: `jpg`, `png`): Extensión del archivo deseada.
        - `contentType` (ej: `image/jpeg`): Tipo MIME del archivo.
    - **Respuesta**: Devuelve la `uploadUrl` (donde realizar el `PUT`) y la `fileUrl` (URL pública final del recurso).

## Seguridad
- Todas las peticiones deben incluir un encabezado `Authorization: Bearer <token>`.
- El servicio valida la firma del token contra la clave secreta compartida del ecosistema.

## Ejecución Local
1. Configura tus credenciales reales o un simulador S3 (como LocalStack o MinIO).
2. Ejecuta con Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   El servicio arrancará en el puerto **8080** con el context path `/suances`.

---
© 2026 Equipo Suances - Microservicio de Infraestructura.
