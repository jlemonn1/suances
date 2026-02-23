MODELO DE DATOS DEFINITIVO
Voy a describírtelo conceptual primero.

Distribuidor

Distribuidor

id (UUID)
nombre (NOT NULL)
email (nullable)
telefono (nullable)
descripcion (nullable)
activo (boolean)
created_at
Constraint:

nombre obligatorio
email OR telefono obligatorio
Ingrediente

Ingrediente

id (UUID)
nombre
unidad_medida (ENUM: GRAMO, ML, UNIDAD)
precio_por_unidad (decimal)
stock_actual (decimal)
umbral_alerta (decimal)
activo (boolean) ← soft delete
created_at
updated_at
Relación:

IngredienteDistribuidor

ingrediente_id
distribuidor_id
precio_personalizado (opcional futuro)
🍽 Plato

Plato

id (UUID)
nombre
descripcion
precio_venta (decimal)
contador_pedidos (long)
activo (boolean)
created_at
Fotos:

PlatoImagen

id
plato_id
url
orden
Escandallo

1:1 con Plato

Escandallo

id
plato_id (unique)
nombre_version (string)
coste_total_snapshot (decimal)
created_at
updated_at
Detalle:

EscandalloDetalle

id
escandallo_id
ingrediente_id
cantidad (decimal)
TipoCarta

TipoCarta

id
nombre
hora_inicio
hora_fin
activo (boolean)
Relación:

TipoCartaPlato

tipo_carta_id
plato_id
Constraint:
Solo un TipoCarta activo.

REGLAS DE NEGOCIO CRÍTICAS
Cambio de precio de ingrediente

Flujo:

Se actualiza precio ingrediente
Backend busca todos los EscandalloDetalle con ese ingrediente
Recalcula coste_total_snapshot de cada Escandallo
Actualiza updated_at
Esto es inmediato (porque máximo 50 platos).

Pedido desde Sala (evento Redis)

Evento:

sala.plato.pedido

{

eventId: UUID,

platoId: UUID,

cantidad: number,

timestamp: ISO

}

Idempotencia

Creamos tabla:

EventosProcesados

event_id (UUID PK)
processed_at
Flujo consumidor:

Llega evento
Si event_id existe → IGNORAR
Si no existe:
o Insertar en EventosProcesados
o Incrementar contador
o Descontar stock ingredientes
o Comprobar cruce umbral
o Emitir alerta si procede
Transacción única.

Descuento de stock

Por cada ingrediente en escandallo:

stock_actual = stock_actual - (cantidad * cantidad_plato)

No hay bloqueo.
Permitimos negativo.

Alerta de stock bajo

Se dispara SOLO cuando:

stock_previo >= umbral

AND

stock_actual < umbral

Emitimos evento:

ingrediente.stock.bajo

{

ingredienteId,

stockActual,

umbral

}

Otro micro gestiona push o email.

Margen

Siempre calculado dinámicamente:

margen = (precio_venta - coste_total_snapshot) / precio_venta

No se almacena.

Seguridad JWT entre micros

Tú planteas:

Todos comparten mismo secret
Personal firma token
Cada micro valida
Token:

{

sub: userId,

name: userName,

role: CAMARERO | GERENTE | COCINA,

iat,

exp

}

Cada micro:

Valida firma
Extrae rol
Aplica autorización
Ejemplo:

Solo GERENTE puede cambiar precio ingrediente
Solo GERENTE puede cambiar precio venta
CAMARERO no puede tocar escandallo
Comunicación Redis

Yo usaría:

Redis Streams + Consumer Groups

Por qué:

Persistencia
Reintentos
Idempotencia
Escalable
Stream:

sala.events

Consumer group:

carta-group

core operativo del micro Carta , con:

Propietario → control total de Carta
Gerente → limitado (definiremos límites después)
🍽 Camarero → solo lectura (realmente interactúa desde Sala)
Vamos con ÉPICAS + HU, bien estructuradas y pensadas para backend real.

ÉPICA 1 — Gestión de Ingredientes (Base Económica y de Stock)

Sin ingredientes no hay coste ni control de inventario.

HU 1.1 — Crear ingrediente

Como Propietario
Quiero crear un ingrediente con unidad, precio, stock y umbral
Para poder usarlo en escandallos y controlar consumo

Criterios

nombre obligatorio
unidad_medida obligatoria (ENUM)
precio_por_unidad ≥ 0
stock_actual puede ser 0
umbral_alerta obligatorio
activo = true por defecto
HU 1.2 — Editar ingrediente

Como Propietario
Quiero modificar precio, stock o umbral
Para mantener coherencia económica

Criterios

Si cambia precio → recalcular todos los escandallos afectados
inmediatamente
Si cambia stock → no dispara alerta retroactiva
Se registra updated_at
HU 1.3 — Desactivar ingrediente (soft delete)

Como Propietario
Quiero desactivar un ingrediente
Para que no pueda usarse en nuevos escandallos

Criterios

activo = false
Si está en escandallos:
o Se muestra advertencia
o Se permite continuar
No se elimina físicamente
HU 1.4 — Detectar cruce de umbral

Como sistema
Quiero emitir evento cuando el stock cruce el umbral hacia abajo
Para avisar reposición

Criterios técnicos

Solo si stock_previo ≥ umbral AND stock_actual < umbral
Emitir evento Redis
No repetir hasta volver a superar umbral
ÉPICA 2 — Gestión de Distribuidores

HU 2.1 — Crear distribuidor

Como Propietario
Quiero registrar distribuidor con datos de contacto
Para asociarlo a ingredientes

Criterios

nombre obligatorio
email OR teléfono obligatorio
activo = true
HU 2.2 — Asociar distribuidor a ingrediente

Como Propietario
Quiero vincular uno o varios distribuidores a un ingrediente
Para tener alternativas

Criterios

Relación N:N
No duplicados
🍽 ÉPICA 3 — Gestión de Platos

Unidad comercial vendible

HU 3.1 — Crear plato

Como Propietario
Quiero crear un plato con precio de venta
Para incluirlo en carta

Criterios

nombre obligatorio
precio_venta obligatorio
contador_pedidos = 0
activo = true
Puede no tener escandallo al crearlo
HU 3.2 — Editar precio de venta

Como Propietario
Quiero modificar precio
Para ajustar estrategia

Criterios

Solo Propietario puede cambiar precio
margen se calcula dinámicamente
No afecta escandallo
HU 3.3 — Desactivar plato

Como Propietario
Quiero ocultarlo
Para que no esté disponible en carta

Criterios

activo = false
No se elimina físicamente
HU 3.4 — Incrementar contador de pedidos

Como sistema
Quiero incrementar contador cuando Sala notifique pedido
Para llevar métricas básicas

Criterios técnicos

Evento incluye eventId único
Se valida idempotencia
Incremento transaccional fuerte
No se duplica aunque Redis reintente
ÉPICA 4 — Escandallo y Coste

Control económico interno

HU 4.1 — Crear escandallo

Como Propietario
Quiero definir ingredientes y cantidades de un plato
Para calcular coste total

Criterios

Solo uno por plato
Lista de ingrediente + cantidad
Solo ingredientes activos al crearlo
Se calcula coste_total_snapshot automáticamente
HU 4.2 — Editar escandallo

Como Propietario
Quiero modificar ingredientes o cantidades
Para ajustar receta

Criterios

Recalcula coste_total_snapshot
Permite eliminar ingredientes
Permite mantener ingredientes soft-deleted ya existentes
HU 4.3 — Recalcular escandallos al cambiar precio ingrediente

Como sistema
Quiero recalcular inmediatamente todos los escandallos afectados
Para mantener coherencia económica

Criterios

Solo los afectados
Snapshot actualizado
No modifica precio_venta
HU 4.4 — Calcular margen dinámico

Como sistema
Quiero calcular margen bajo demanda
Para mostrar rentabilidad

Fórmula:

(precio_venta - coste_total_snapshot) / precio_venta

No se almacena.

ÉPICA 5 — Gestión de Tipos de Carta

Disponibilidad horaria

HU 5.1 — Crear tipo de carta

Como Propietario
Quiero definir una franja horaria
Para activar ciertos platos en ese horario

Criterios

nombre obligatorio
hora_inicio y hora_fin obligatorios
No puede haber solapamientos
Solo una carta activa en un momento dado
HU 5.2 — Asociar platos a tipo de carta

Como Propietario
Quiero seleccionar qué platos pertenecen
Para configurar disponibilidad

Criterios

Relación N:N
Solo platos activos
HU 5.3 — Obtener carta activa

Como sistema
Quiero devolver los platos activos en el horario actual
Para que Sala consulte disponibilidad

Criterios

Evalúa hora actual
Devuelve solo platos activos y pertenecientes al tipo activo
Optimizado para consumo frecuente
ÉPICA 6 — Integración con Sala

Consumo real y coherencia de stock

HU 6.1 — Procesar evento de pedido

Como sistema
Quiero procesar evento Redis de plato pedido
Para actualizar contador y stock

Flujo técnico

Verificar idempotencia (tabla eventos)
Incrementar contador_pedidos
Descontar stock de cada ingrediente
Detectar cruce de umbral
Emitir evento stock bajo si aplica
Registrar evento procesado
Todo en una única transacción.

ÉPICA 7 — Seguridad y Autorización

HU 7.1 — Validar JWT

Como micro Carta
Quiero validar firma y extraer id, nombre y rol
Para autorizar operaciones

HU 7.2 — Autorización por rol

Propietario

Crear/editar ingredientes
Cambiar precios
Gestionar escandallos
Gestionar cartas
Gestionar distribuidores
Gerente

(pendiente definir límites, pero no tocar precios ni escandallos de
momento)
Camarero

Solo lectura (consulta carta)
ÉPICA 8 — Idempotencia y Consistencia

HU 8.1 — Registrar eventos procesados

Como sistema
Quiero evitar duplicar eventos Redis
Para proteger contador y stock

Criterios

eventId único
Si existe → ignorar
Si no existe → procesar y registrar
Transacción atómica
CORE ABSOLUTO DEL MICRO CARTA
Si lo reduces al hueso que hace que todo funcione:

Ingredientes con precio y stock
Escandallo 1:1 con plato
Recalculo inmediato
Evento Redis idempotente
Descuento de stock
Contador fuerte
Una carta activa con lista de platos
JWT validado y autorizado
Perfecto. Vamos a bajar esto a contrato formal.
Te lo estructuro como:

Contrato REST (API HTTP)
Seguridad y cabeceras
Contrato de eventos Redis (Streams)
Códigos de error estándar
DTOs base
Sin ambigüedades. Listo para implementar.

CONTRATO REST — Micro CARTA

Base URL:

/api/carta

Todos los endpoints requieren:

Authorization: Bearer

Content-Type: application/json

INGREDIENTES
POST /ingredientes

Crear ingrediente

Request

{

"nombre": "Tomate",

"unidadMedida": "GRAMO",

"precioPorUnidad": 0.004,

"stockActual": 10000,

"umbralAlerta": 2000

}

Response 201

{

"id": "uuid",

"nombre": "Tomate",

"unidadMedida": "GRAMO",

"precioPorUnidad": 0.004,

"stockActual": 10000,

"umbralAlerta": 2000,

"activo": true

}

PUT /ingredientes/{id}

Editar ingrediente

Permite modificar:

precioPorUnidad
stockActual
umbralAlerta
nombre
Response 200

Devuelve ingrediente actualizado.

Si cambia precio:

Recalcula escandallos automáticamente.
DELETE /ingredientes/{id}

Soft delete

Response 204

GET /ingredientes

Listado

Query params opcionales:

?activo=true

DISTRIBUIDORES
POST /distribuidores

{

"nombre": "Proveedor Norte",

"email": "contacto@proveedor.com",

"telefono": null,

"descripcion": "Proveedor principal"

}

Validación:

nombre obligatorio
email OR telefono obligatorio
POST /ingredientes/{id}/distribuidores

Asociar distribuidor

{

"distribuidorId": "uuid"

}

🍽 PLATOS
POST /platos

{

"nombre": "Ensalada Mixta",

"descripcion": "Lechuga, tomate y cebolla",

"precioVenta": 12.

}

Response

{

"id": "uuid",

"nombre": "Ensalada Mixta",

"precioVenta": 12.50,

"contadorPedidos": 0,

"activo": true

}

PUT /platos/{id}

Permite modificar:

nombre
descripcion
precioVenta
activo
GET /platos/{id}

Incluye margen calculado:

{

"id": "uuid",

"nombre": "Ensalada",

"precioVenta": 12.50,

"costeTotal": 3.40,

"margen": 0.728,

"contadorPedidos": 45

}

ESCANDALLO
POST /platos/{platoId}/escandallo

Crear o reemplazar escandallo

{

"nombreVersion": "Base 2026",

"ingredientes": [

{

"ingredienteId": "uuid1",

"cantidad": 150

},

{

"ingredienteId": "uuid2",

"cantidad": 20

}

]
}
Response

{

"platoId": "uuid",

"costeTotal": 3.40,

"ingredientes": [...]

}

GET /platos/{platoId}/escandallo

Devuelve snapshot actual.

TIPOS DE CARTA
POST /tipos-carta

{

"nombre": "Carta Comida",

"horaInicio": "12:00",

"horaFin": "16:00"

}

Validación:

No solapamiento
Solo una activa por franja
POST /tipos-carta/{id}/platos

{

"platoIds": ["uuid1", "uuid2"]

}

Reemplaza lista completa.

GET /carta/activa

Devuelve platos según hora actual.

{

"tipoCarta": "Carta Comida",

"platos": [...]

}

SEGURIDAD JWT
Todos los endpoints validan:

{

"sub": "userId",

"name": "Nombre",

"role": "PROPIETARIO | GERENTE | CAMARERO"

}

Reglas:

PROPIETARIO → acceso total
GERENTE → lectura y gestión básica (sin precios ni escandallos)
CAMARERO → solo GET
Error 403 si no autorizado.

CONTRATO REDIS (Streams)

Stream principal:

sala.events

Consumer group:

carta-group

Evento: sala.plato.pedido

Payload

{

"eventId": "uuid",

"type": "sala.plato.pedido",

"timestamp": "2026- 02 - 23T21:10:00Z",

"data": {

"platoId": "uuid",

"cantidad": 2

}

}

Procesamiento en Carta

Transacción:

Verificar eventId en tabla eventos_procesados
Si existe → ignorar
Incrementar contadorPedidos
Descontar stock ingredientes
Detectar cruce de umbral
Registrar eventId
Evento emitido: ingrediente.stock.bajo

Stream:

carta.events

Payload:

{

"eventId": "uuid",

"type": "ingrediente.stock.bajo",

"timestamp": "ISO",

"data": {

"ingredienteId": "uuid",

"stockActual": 1500,

"umbral": 2000

}

}

CÓDIGOS DE ERROR
Estándar:

400 → Validación
401 → No autenticado
403 → No autorizado
404 → No encontrado
409 → Conflicto (ej. solapamiento horario)
422 → Regla de negocio incumplida
Formato:

{

"error": "TIPO_ERROR",

"message": "Descripción clara",

"timestamp": "ISO"

}

IDPOTENCIA
Tabla:

eventos_procesados

event_id (PK)
processed_at
Constraint:

event_id UNIQUE
ESTE CONTRATO YA PERMITE
✔ Crear ingredientes

✔ Gestionar stock
✔ Calcular costes

✔ Gestionar platos

✔ Definir carta horaria

✔ Procesar pedidos desde Sala

✔ Emitir alertas

✔ Seguridad por roles

✔ Idempotencia real

Si quieres ahora podemos:

Formalizarlo en estilo OpenAPI
Diseñar esquema SQL exacto
O documentar flujo completo Sala → Carta → Notificación
Tú eliges el siguiente nivel.