Vale. Esto ya empieza a oler a SaaS serio, no a “agenda con esteroides” 😌
Vamos a bajarlo bien estructurado, en plan documentación funcional clara, separada por **épicas**, **historias**, **roles** e **integraciones con otros micros** dentro de tu proyecto *Suances*.

## 📚 Documentación técnica disponible
- [Especificación técnica (ReservaService)](reservas-service-SPEC.md)
- [Schema PostgreSQL](reservas-schema.sql)
- [Colección Postman](reservas-postman-collection.json)

Cada uno amplía en detalle todo lo descrito en este resumen funcional.

---

# 📌 Microservicio: Gestión de Reservas

## 🎯 Objetivo

Gestionar:

* Configuración estructural de salas y mesas
* Definición de franjas horarias
* Gestión automática y manual de reservas
* Bloqueos operativos
* Sincronización futura con el micro de Sala

---

# 👥 Roles del sistema

(Adaptado a tus roles oficiales)

* **Propietario**
* **Gerente**
* **Camarero**
* **Cliente (reserva online)**

---

# 🧱 ÉPICA 1 — Configuración estructural del espacio

## 1.1 Gestión de Salas

### 🎯 Objetivo

Permitir crear y configurar salas físicas del local.

### Funcionalidades

* Crear sala
* Editar sala
* Eliminar sala
* Activar / desactivar sala
* Asignar nombre
* Definir capacidad máxima opcional
* Definir layout básico

### Layout mínimo requerido

Para poder pintar la sala:

* Sistema de cuadrícula (grid)
* Definición de:

  * Ancho
  * Alto
* Posibilidad de marcar esquinas (polígono simple)
* Almacenamiento de:

  * Lista de coordenadas (x,y)

> Esto permite en el futuro tener visualización tipo plano.

---

## 1.2 Gestión de Mesas

### 🎯 Objetivo

Gestionar mesas asociadas a una sala.

### Propiedades de Mesa

* Número único por sala
* Capacidad (número de comensales)
* Posición en el grid (x,y)
* Ancho / alto (para pintar visualmente)
* Estado:

  * Activa
  * Desactivada
* Disponible para reserva online (boolean)
* Bloqueada manualmente

### Funcionalidades

* Crear mesa
* Editar mesa
* Eliminar mesa
* Cambiar posición
* Cambiar capacidad
* Bloquear para reservas online

---

# 🕒 ÉPICA 2 — Gestión de Franjas Horarias

## 2.1 Configuración de franjas

### 🎯 Objetivo

Definir bloques reservables.

Ejemplo:

* 13:00–14:00
* 14:00–15:00
* 20:00–21:00

### Propiedades

* Hora inicio
* Hora fin
* Activa / inactiva
* Tipo:

  * Comida
  * Cena
  * Especial (evento)

### Funcionalidades

* Crear franja
* Editar franja
* Eliminar franja
* Activar / desactivar

---

# 📅 ÉPICA 3 — Gestión de Reservas

## 3.1 Crear reserva (Cliente online)

### Flujo automático

El sistema:

1. Recibe:

   * Nombre
   * Teléfono
   * Nº comensales
   * Fecha
   * Franja

2. Busca:

   * Mesas activas
   * No bloqueadas
   * No reservadas en esa franja
   * Capacidad suficiente

3. Algoritmo de asignación:

   * Preferencia por mesa más ajustada en capacidad
   * Opcional: agrupación futura

4. Resultado:

   * Reserva confirmada
   * O rechazada si no hay disponibilidad

---

## 3.2 Crear reserva manual (Propietario / Gerente)

Permite:

* Seleccionar mesa específica
* Forzar asignación
* Saltarse bloqueo online
* Bloquear mesa para uso interno

---

## 3.3 Modificar reserva

Se podrá:

* Cambiar comensales
* Cambiar franja
* Cambiar mesa
* Cambiar datos contacto
* Cancelar reserva

El sistema deberá:

* Revalidar disponibilidad
* Liberar mesa anterior si procede

---

## 3.4 Estados de reserva

* Pendiente
* Confirmada
* Cancelada
* No show
* Finalizada

---

# 🔒 ÉPICA 4 — Bloqueos

## 4.1 Bloqueo de mesa

Tipos:

* Bloqueo online (no visible para cliente)
* Bloqueo total (ni online ni manual)

Motivos:

* Avería
* Evento privado
* Uso interno
* Reservada telefónicamente fuera sistema

---

# 🔁 ÉPICA 5 — Sincronización con Micro de Sala (Futuro)

Este punto es importante y muy bien visto por tu parte.

Cuando el micro de **Sala** esté operativo:

## Escenario clave

Si se lanza una comanda en una mesa que:

* No tiene reserva
* Está libre

Entonces:

* Se debe marcar como:

  * Ocupada
  * Bloqueada en sistema de reservas
  * No disponible para esa franja

---

## Comunicación entre micros

### Opción recomendada (siguiendo lo que ya habíamos hablado en tu arquitectura):

👉 Publicación de evento en **Redis Streams**

Ejemplo:

```
ORDER_STARTED
{
  mesaId: 12,
  fecha: 2026-03-03,
  hora: 13:15
}
```

El micro de Reservas:

* Consume el evento
* Marca mesa como bloqueada para esa franja

---

# 📊 ÉPICA 6 — Reglas de Negocio Importantes

1. Una mesa solo puede tener:

   * 1 reserva por franja
2. Una reserva no puede existir sin franja válida
3. Una mesa bloqueada no puede:

   * Ser asignada automáticamente
4. Si cambia el número de comensales:

   * Se debe revalidar mesa

---

# 🧠 Algoritmo de asignación (detallado)

Orden de prioridad:

1. Mesas exactas en capacidad
2. Mesas ligeramente superiores
3. Nunca mesas inferiores a comensales

Opcional futuro:

* Composición de mesas (join tables)
* Inteligencia de ocupación

---

# 🛡️ Control por Rol

| Acción               | Propietario | Gerente | Camarero | Cliente |
| -------------------- | ----------- | ------- | -------- | ------- |
| Crear sala           | ✅           | ❌       | ❌        | ❌       |
| Crear mesa           | ✅           | ❌       | ❌        | ❌       |
| Gestionar franjas    | ✅           | ❌       | ❌        | ❌       |
| Crear reserva manual | ✅           | ✅       | ❌        | ❌       |
| Crear reserva online | ❌           | ❌       | ❌        | ✅       |
| Modificar reserva    | ✅           | ✅       | ❌        | ❌       |
| Bloquear mesa        | ✅           | ✅       | ❌        | ❌       |

---

# 🧩 Integraciones con otros micros

## 🔗 Micro Carta

* No interacción directa

## 🔗 Micro Stock

* No interacción directa

## 🔗 Micro Sala

* Bloqueo automático por comanda
* Actualización de estado ocupación

## 🔗 Micro Notificaciones (si existe)

* SMS confirmación
* WhatsApp
* Recordatorios

---

# 🗃️ Entidades principales

* Sala
* Mesa
* Franja
* Reserva
* Bloqueo

---

# 🧱 Posible Modelo Simplificado

```
Sala
 └── Mesa
       └── Reserva (por fecha + franja)
```

---

# 🧨 Casos límite a contemplar

* Overbooking manual
* Cambio de hora en local
* Evento especial que anula todas las franjas
* Reserva sin mesa (modo lista espera futura)

---

Si quieres, en el siguiente paso podemos:

* 📘 Convertir esto en documento técnico formal estilo RFC
* 🧱 Diseñar el modelo relacional exacto (PostgreSQL)
* 🧠 Diseñar los endpoints REST del micro
* ⚙️ Definir eventos exactos para Redis Streams
* 📊 Diseñar el esquema para Docker + arquitectura final

Tú dime por dónde quieres seguir y lo bajamos al siguiente nivel. Esto ya está cogiendo forma de producto serio.
