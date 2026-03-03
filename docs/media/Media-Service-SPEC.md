# AI AGENT CONTEXT: Microservicio "Media" (rest-media-service)

**Rol del Agente:** Eres un Arquitecto de Software Java Senior y Experto en Spring Boot 3.2.x.
**Objetivo:** Generar código de producción para el microservicio de "Media" del ecosistema SaaS del Restaurante.
**Restricción Crítica:** Adhiérete estrictamente a este documento. Escribe código limpio (SOLID) utilizando una **Arquitectura de Capas Clásica (N-Tier)**. NO generes endpoints de carga de archivos (`MultipartFile`). Este microservicio solo genera firmas (Pre-signed URLs) para un CDN (Cloudflare R2 / AWS S3).

---

## 1. Contexto del Ecosistema y Seguridad

Este microservicio no es el proveedor de identidad. La autenticación la maneja el microservicio de Personal, el cual emite un JWT simétrico (HS256).

**Reglas de Seguridad (Spring Security 6):**
1.  **Resource Server:** Este microservicio actúa como un *OAuth2 Resource Server*.
2.  **Validación JWT:** Debe validar la firma del JWT usando la clave secreta compartida (`app.jwt.secret`).
3.  **Autorización:** El endpoint principal requiere que el usuario esté autenticado. Cualquier rol (`OWNER`, `MANAGER`, `WAITER`) es válido para solicitar una firma de subida.
4.  **Claims:** El JWT contiene los claims `sub` (ID), `name` y `role`.

---

## 2. Stack Tecnológico (Estricto)

* **Lenguaje:** Java 21 (Usa Records para DTOs).
* **Framework:** Spring Boot 3.5.11.
* **Dependencias Clave:**
    * `spring-boot-starter-web`
    * `spring-boot-starter-oauth2-resource-server` (Para validar el JWT automáticamente).
    * `software.amazon.awssdk:s3` y `software.amazon.awssdk:s3-presigner` (Versión 2.x, NO la v1).
* **Lombok:** Permitido para inyección de dependencias (`@RequiredArgsConstructor`) y constructores.

---

## 3. Arquitectura: Capas (N-Tier)

Genera la estructura de carpetas siguiendo **estrictamente** este árbol para mantener la consistencia con el resto del ecosistema:

```text
src/main/java/com/suances/media
├── config                      # Beans de configuración (S3Config, CorsConfig)
├── controller                  # Controladores REST (@RestController)
├── domain                      # Modelos de dominio internos (si aplican)
├── dto                         # Data Transfer Objects (Records: ej. PresignedUrlResponse)
├── exception                   # Excepciones personalizadas y GlobalExceptionHandler (@ControllerAdvice)
├── security                    # SecurityConfig (Configuración del Resource Server)
├── service                     # Lógica de negocio (@Service)
│   └── CloudflareS3Service.java # Servicio que integra el SDK de AWS/Cloudflare
└── MediaApplication.java
```
(Nota: No se incluye repository ni base de datos porque este microservicio no guarda estado).

---

## 4. Especificación del Contrato (API)

### Endpoint: GET /api/media/upload-url

**Query Params Requeridos:**

| Parámetro    | Tipo   | Descripción                              | Ejemplo         |
|--------------|--------|------------------------------------------|-----------------|
| extension    | String | Extensión del archivo                    | jpg, png, webp, pdf |
| contentType  | String | Tipo MIME del contenido                  | image/jpeg, application/pdf |

**Respuesta Esperada (200 OK):**

```json
{
  "uploadUrl": "https://[account][.r2.cloudflarestorage.com/bucket/uuid-file.jpg?X-Amz-Signature=](https://.r2.cloudflarestorage.com/bucket/uuid-file.jpg?X-Amz-Signature=)...",
  "publicUrl": "[https://cdn.tudominio.com/uuid-file.jpg](https://cdn.tudominio.com/uuid-file.jpg)",
  "expiresInSeconds": 300
}
```

---

## 5. Instrucciones Técnicas y Snippets Clave

### 5.1 Configuración de Cloudflare R2 (S3Config.java)

El bean del S3Presigner debe configurarse engañando al SDK de AWS para que apunte a Cloudflare:

```java
// Ejemplo conceptual para el agente
S3Presigner.builder()
    .region(Region.of("auto"))
    .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
    .endpointOverride(URI.create("https://" + accountId + ".r2.cloudflarestorage.com"))
    .build();
```

### 5.2 Lógica del Servicio (CloudflareS3Service.java)

- Validar que la extension y el contentType sean seguros (solo permitir imágenes y PDFs). Lanzar excepción personalizada si no lo son.
- Generar un UUID aleatorio para el nombre del archivo para evitar colisiones (ej. `[UUID].[extension]`).
- Usar S3Presigner para generar una petición PutObjectPresignRequest válida por 5 minutos (300 segundos).
- Retornar un DTO con la URL pre-firmada (PUT) y la URL pública final pre-calculada.

### 5.3 Configuración de Seguridad (SecurityConfig.java)

```java
// Configura SecurityFilterChain para que /api/media/** requiera autenticación.
// Configura oauth2ResourceServer().jwt() usando un NimbusJwtDecoder configurado
// con la clave secreta simétrica leída desde @Value("${app.jwt.secret}").
```

---

## 6. Pasos de Ejecución para el Agente

**Paso 1:** Genera el `pom.xml` con las dependencias exactas (Web, Security, AWS SDK v2).

**Paso 2:** Crea las clases de configuración (`config/S3Config.java` y `security/SecurityConfig.java`).

**Paso 3:** Crea los Records en el paquete `dto`.

**Paso 4:** Implementa el servicio principal en `service/CloudflareS3Service.java`.

**Paso 5:** Crea el Controlador `controller/MediaController.java` inyectando el servicio.

**Paso 6:** Crea el manejo de errores en `exception`.

---

## 7. Configuration (application.yml)

```yaml
server:
  port: 8080

spring:
  application:
    name: rest-media-service
  security:
    oauth2:
      resourceserver:
        jwt:
          secret-key: ${APP_JWT_SECRET:default-secret-key-change-in-production}

app:
  jwt:
    secret: ${APP_JWT_SECRET:default-secret-key-change-in-production}
  s3:
    access-key: ${S3_ACCESS_KEY:}
    secret-key: ${S3_SECRET_KEY:}
    bucket: ${S3_BUCKET:media}
    account-id: ${S3_ACCOUNT_ID:}
    cdn-domain: ${S3_CDN_DOMAIN:cdn.tudominio.com}
```

---

## 8. Excepciones Personalizadas

### InvalidFileTypeException

Lanzada cuando el tipo de archivo o extensión no es válido (no es imagen ni PDF).

### PresignedUrlGenerationException

Lanzada cuando ocurre un error al generar la URL pre-firmada.

---

## 9. Consideraciones Adicionales

1. **Seguridad:** Validar siempre el JWT antes de permitir generar URLs.
2. **Logging:** Agregar logs en puntos clave para debugging.
3. **Manejo de Errores:** Responder con códigos HTTP apropiados (400 para bad request, 401 para no autorizado, 500 para errores internos).
4. **Extensibilidad:** Diseñar el servicio para que pueda soportar otros proveedores de almacenamiento (S3, GCS) sin cambios mayores en el código.
