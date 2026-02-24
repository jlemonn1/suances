# Guía de Infraestructura Docker y Entornos

Este documento explica cómo está estructurada la orquestación de contenedores y la gestión de configuración en el proyecto Saas-Global. 

La arquitectura sigue un modelo de "Infraestructura Base Compartida" combinado con "Contenedores de Microservicios Independientes". Esto permite que todos los microservicios compartan los mismos recursos comunes (como base de datos y caché) durante el desarrollo, manteniendo a la vez aislamiento en su despliegue y configuración.

## 1. Archivos de Configuración (Entornos)

La configuración se gestiona mediante variables de entorno. Los archivos `.env` se encuentran en la raíz del proyecto y **no se suben al control de versiones** (están en `.gitignore` para evitar filtraciones de secretos).

### Tipos de archivos:
- **`.env.example`**: Archivo de **referencia obligatoria**. Todos los desarrolladores deben copiar este archivo, renombrarlo, y rellenar los valores. Siempre que se añada una nueva variable al proyecto, **debe añadirse aquí** para que el resto del equipo sepa que existe.
- **`.env.dev`**: Entorno de desarrollo local. Define credenciales estándar o puertos de prueba.
- **`.env.prod`**: Plantilla/estructura de las credenciales de producción.

### ¿Cómo lo consumen los microservicios?
Cada microservicio utiliza el puente de Spring Boot para inyectar estas variables. En los archivos `application.yml` encontrarás referencias como:
```yaml
datasource:
  url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME_PERSONAL:personal}
```
*Si la variable `DB_HOST` existe se usará su valor, de lo contrario usará `localhost`.*

---

## 2. Infraestructura Base (Root)

En la raíz del proyecto se encuentra el archivo **`docker-compose-infra.yml`**. 

Este orquestador se encarga exclusivamente de levantar los servicios genéricos compartidos que los microservicios necesitan para funcionar.

### Componentes:
1.  **PostgreSQL (Puerto 5432)**: Servidor de base de datos genérico.
    - Se apoya en un script de inicialización ubicado en `docker/postgres/init.sql`.
    - **Importante**: Este script se ejecuta **automáticamente** la primera vez que se crea el volumen de la base de datos y se encarga de lanzar los comandos `CREATE DATABASE <nombre>;` para cada microservicio.
    - Si creas un **nuevo microservicio**, debes añadir su respectiva instrucción `CREATE DATABASE <mi_microservicio>;` en ese archivo `init.sql` antes de levantar la infra.
2.  **Redis (Puerto 6379)**: Servidor genérico de caché y mensajería en memoria.
3.  **Red Compartida (`suances-network`)**: Una red tipo *bridge* aislada pero visible para otros contenedores que pidan conectarse a ella.

### Comandos de Infraestructura:
```bash
# Levantar en segundo plano
docker-compose -f docker-compose-infra.yml up -d

# Detener la infraestructura
docker-compose -f docker-compose-infra.yml down
```

---

## 3. Microservicios

Cada microservicio (`rest-personal-service`, `rest-carta-service`, etc.) es independiente. Cuenta con su propio `Dockerfile` y su propio `docker-compose.yml` ubicados en el directorio del microservicio (ej. `backend/rest-personal-service/`).

### El Dockerfile (Multi-etapa)
Asegura que cualquier desarrollador pueda compilar y ejecutar el proyecto sin tener Maven ni Java preinstalados en su máquina.
- **Etapa 1 (Build)**: Usa una imagen con Maven para descargar dependencias, compilar el código fuente y crear el `.jar`.
- **Etapa 2 (Run)**: Usa una imagen ligera solo con JRE (Java Runtime Environment) para ejecutar el `.jar` resultante, resultando en un contenedor final muy liviano.

### El Docker Compose Específico
El archivo `docker-compose.yml` del microservicio hace tres cosas críticas:
1. Construye o levanta la imagen del microservicio basándose en el `Dockerfile`.
2. Conecta el contenedor a la red `suances-network` (para poder "ver" al PostgreSQL y al Redis de la infraestructura base).
3. Inyecta el archivo de variables de entorno (ej. `env_file: ../../.env.dev`) y sobrescribe las variables de host. 
   - **Nota sobre la resolución DNS de Docker**: Al estar dentro de un contenedor, el servicio no puede usar `localhost` para llegar a la base de datos (localhost apuntaría dentro del propio contenedor del microservicio). Por eso, el `docker-compose.yml` inyecta dinámicamente:
     ```yaml
     environment:
       - DB_HOST=postgres
       - REDIS_HOST=redis
     ```
     Docker resolverá los nombres `postgres` y `redis` hacia los contenedores de la infraestructura base que viven en la misma red `suances-network`.

### Comandos del Microservicio:
Estando situado dentro del directorio del microservicio (ej. `cd backend/rest-personal-service`):

```bash
# Levantar el microservicio (forzando la compilación del código Java)
docker-compose up -d --build

# Ver los logs en tiempo real
docker-compose logs -f

# Bajar el microservicio
docker-compose down
```

---

## 4. Flujo de Trabajo Normal (Resumen)

Si te acabas de clonar el proyecto o vas a empezar a trabajar:

1.  Copia y renombra el `.env.example` a `.env.dev`. Rellena las credenciales.
2.  Ve a la raíz del proyecto y levanta la infraestructura base:
    `docker-compose -f docker-compose-infra.yml up -d`
3.  Ve a la carpeta del microservicio en el que vayas a trabajar y levántalo:
    `cd backend/rest-XXXX-service`
    `docker-compose up -d --build`
4.  (Opcional): Si estás desarrollando y prefieres lanzar la app desde tu IDE (IntelliJ, VSCode, Eclipse), puedes omitir el paso 3. Puedes lanzar el *Run* del IDE apuntando a las variables de entorno locales y tu IDE usará la base de datos (localhost:5432) levantada en el paso 2 de forma natural.
