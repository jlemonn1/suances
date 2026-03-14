# 🍴 Suances - Ecosistema de Gestión de Restaurantes

Suances es una plataforma SaaS integral para la gestión de hostelería, construida sobre una arquitectura de microservicios moderna, escalable y orientada a eventos.

## 🚀 Visión General
El sistema automatiza todo el ciclo de vida del restaurante: desde la planificación de reservas y el control de stock hasta la operativa de sala en tiempo real y la liquidación en caja.

## 🏗️ Arquitectura de Microservicios
El ecosistema se compone de 5 servicios independientes que colaboran mediante una comunicación híbrida (**REST** para operaciones síncronas y **Redis Streams** para eventos de negocio).

### 📦 Servicios Principales
1.  **[Personal Service](file:///c:/miguel/dev/suances/backend/rest-personal-service)**: Gestión de identidades, roles y seguridad transversal mediante **JWT**.
2.  **[Carta Service](file:///c:/miguel/dev/suances/backend/rest-carta-service)**: Gestión económica de productos, escandallos dinámicos y control de **stock real** basado en el consumo.
3.  **[Media Service](file:///c:/miguel/dev/suances/backend/rest-media-service)**: Microservicio especializado en la gestión de imágenes y activos con **Cloudflare R2**.
4.  **[Sala Service](file:///c:/miguel/dev/suances/backend/rest-sala-service)**: Operativa diaria: gestión de mesas, comandas, pedidos y flujo de servicio (Cocina/Sala).
5.  **[Reserva Service](file:///c:/miguel/dev/suances/backend/rest-reserva-service)**: Planificación y previsión. Motor de asignación de mesas, franjas horarias y gestión de listas de espera.

### 📱 Frontend
*   **[Suances App](file:///c:/miguel/dev/suances/suances-app)**: Aplicación multiplataforma (iOS/Android/Web) desarrollada con **React Native (Expo)**.

## 🛠️ Stack Tecnológico
*   **Backend**: Java 21, Spring Boot 3.5.x, Hibernate/JPA, QueryDSL.
*   **Frontend**: React Native, Expo, TypeScript, TanStack Query, Zustand.
*   **Infraestructura**: Docker, PostgreSQL, Redis (Streams/Caché), Cloudflare R2.

## 🔄 Flujo de Datos y Eventos
El sistema utiliza **Redis Streams** para garantizar el desacoplamiento:
1.  **Reservas** notifica la llegada de clientes.
2.  **Sala** monitoriza la ocupación y genera comandas.
3.  **Sala** emite eventos de pedidos que **Carta** procesa para descontar stock en tiempo real.
4.  Al cobrar, se liberan los recursos y se notifican las estadísticas.

## ⚙️ Guía de Inicio Rápido

### 1. Requisitos
*   Docker & Docker Compose.
*   Node.js & JDK 21 (para desarrollo local).

### 2. Infraestructura Base
Levanta la base de datos y el bus de mensajería desde la raíz:
```bash
docker-compose -f docker-compose-infra.yml up -d
```

### 3. Ejecución de Servicios
Puedes levantar cualquier servicio individualmente:
```bash
cd backend/rest-sala-service
docker-compose up -d --build
```

### 4. Lanzamiento de la App
```bash
cd suances-app
npm install
npm start
```

## 📂 Organización del Repositorio
*   `/backend`: Microservicios Spring Boot.
*   `/suances-app`: Cliente móvil y web.
*   `/docs`: Especificaciones detalladas y arquitectura global ([Ver Docs](file:///c:/miguel/dev/suances/docs)).
*   `/docker`: Configuración de infraestructura y contenedores.

---
© 2026 Equipo Suances - Innovación en Gestión Gastronómica.
