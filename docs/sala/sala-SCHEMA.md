# Esquema de Base de Datos - Sala Service

## Resumen

Base de datos PostgreSQL para el microservicio de Sala. Gestiona comandas, pedidos, estados operativos de mesas y auditoría de eventos.

---

## Índice de Tablas

1. [Tipos ENUM](#tipos-enum)
2. [comandas](#tabla-comandas)
3. [pedidos](#tabla-pedidos)
4. [mesas_operativas](#tabla-mesas-operativas)
5. [eventos_procesados](#tabla-eventos-procesados)
6. [Vistas](#vistas)
7. [Índices](#indices)
8. [Constraints](#constraints)

---

## Tipos ENUM

```sql
-- Estados de comanda
CREATE TYPE comanda_estado AS ENUM (
    'ABIERTA',
    'EN_PREPARACION',
    'SERVIDA',
    'CUENTA',
    'COBRADA',
    'CANCELADA'
);

-- Estados de pedido individual
CREATE TYPE pedido_estado AS ENUM (
    'PENDIENTE',
    'EN_PREPARACION',
    'LISTO',
    'SERVIDO',
    'CANCELADO'
);

-- Estados operativos de mesa
CREATE TYPE mesa_estado_operativo AS ENUM (
    'LIBRE',
    'OCUPADA',
    'PIDIENDO',
    'SERVIDA',
    'CUENTA',
    'COBRADA'
);

-- Tipos de pago (para futura implementación)
CREATE TYPE tipo_pago AS ENUM (
    'EFECTIVO',
    'TARJETA',
    'BIZUM',
    'MIXTO'
);
```

---

## Tabla: comandas

Almacena las comandas (pedidos de mesa) abiertas en el restaurante.

```sql
CREATE TABLE comandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referencias externas
    mesa_id UUID NOT NULL,
    camarero_id UUID NOT NULL,
    
    -- Identificación
    codigo VARCHAR(20) NOT NULL UNIQUE,
    
    -- Estado y datos
    estado comanda_estado NOT NULL DEFAULT 'ABIERTA',
    numero_comensales SMALLINT NOT NULL DEFAULT 1,
    notas TEXT,
    
    -- Totales y descuentos
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    
    -- Tiempos
    fecha_apertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios
COMMENT ON TABLE comandas IS 'Comandas/pedidos de mesa activos e históricos';
COMMENT ON COLUMN comandas.mesa_id IS 'Referencia a mesa en reservas-service';
COMMENT ON COLUMN comandas.camarero_id IS 'Referencia a usuario en personnel-service';
COMMENT ON COLUMN comandas.codigo IS 'Código legible de comanda (CMD-XXXX)';
```

**Constraints adicionales**:
```sql
-- Solo una comanda abierta por mesa
CREATE UNIQUE INDEX idx_comanda_unica_abierta 
ON comandas(mesa_id) 
WHERE estado IN ('ABIERTA', 'EN_PREPARACION', 'SERVIDA', 'CUENTA');

-- Validaciones
ALTER TABLE comandas 
ADD CONSTRAINT chk_numero_comensales 
CHECK (numero_comensales > 0 AND numero_comensales <= 50);

ALTER TABLE comandas 
ADD CONSTRAINT chk_descuento_valido 
CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100);

ALTER TABLE comandas 
ADD CONSTRAINT chk_total_no_negativo 
CHECK (total >= 0);

ALTER TABLE comandas 
ADD CONSTRAINT chk_fechas_cierre 
CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_apertura);
```

---

## Tabla: pedidos

Líneas individuales dentro de una comanda.

```sql
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referencias
    comanda_id UUID NOT NULL REFERENCES comandas(id) ON DELETE CASCADE,
    plato_id UUID NOT NULL,  -- Referencia a carta-service
    
    -- Datos del pedido
    cantidad SMALLINT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    estado pedido_estado NOT NULL DEFAULT 'PENDIENTE',
    notas TEXT,
    
    -- Tiempos del flujo
    hora_pedido TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hora_listo TIMESTAMP WITH TIME ZONE,
    hora_servido TIMESTAMP WITH TIME ZONE,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios
COMMENT ON TABLE pedidos IS 'Líneas individuales de pedido dentro de una comanda';
COMMENT ON COLUMN pedidos.plato_id IS 'Referencia a plato en carta-service';
COMMENT ON COLUMN pedidos.precio_unitario IS 'Precio congelado al momento del pedido';
```

**Constraints adicionales**:
```sql
-- Validaciones
ALTER TABLE pedidos 
ADD CONSTRAINT chk_cantidad_positiva 
CHECK (cantidad > 0);

ALTER TABLE pedidos 
ADD CONSTRAINT chk_precio_no_negativo 
CHECK (precio_unitario >= 0);

-- Tiempos lógicos
ALTER TABLE pedidos 
ADD CONSTRAINT chk_tiempos_pedido 
CHECK (
    (hora_listo IS NULL OR hora_listo >= hora_pedido) AND
    (hora_servido IS NULL OR hora_servido >= hora_listo)
);
```

---

## Tabla: mesas_operativas

Vista operativa sincronizada de las mesas desde reservas-service.

```sql
CREATE TABLE mesas_operativas (
    id UUID PRIMARY KEY,  -- Mismo ID que en reservas-service
    
    -- Datos de mesa (duplicados para consistencia)
    numero INTEGER NOT NULL,
    sala_id UUID NOT NULL,
    
    -- Estado operativo
    estado_operativo mesa_estado_operativo NOT NULL DEFAULT 'LIBRE',
    
    -- Referencias actuales
    comanda_activa_id UUID REFERENCES comandas(id),
    camarero_asignado_id UUID,  -- Referencia a personnel-service
    
    -- Sincronización
    ultima_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Datos de reserva (si aplica)
    reserva_actual_id UUID,  -- Referencia a reserva en reservas-service
    nombre_cliente_reserva VARCHAR(120),
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios
COMMENT ON TABLE mesas_operativas IS 'Estado operativo de mesas sincronizado con reservas-service';
COMMENT ON COLUMN mesas_operativas.id IS 'ID compartido con reservas-service.mesas';
```

**Constraints y validaciones**:
```sql
-- Número único por sala
ALTER TABLE mesas_operativas 
ADD CONSTRAINT uq_mesa_numero_sala 
UNIQUE (sala_id, numero);

-- Si hay comanda activa, la mesa no puede estar LIBRE
ALTER TABLE mesas_operativas 
ADD CONSTRAINT chk_estado_comanda 
CHECK (
    (comanda_activa_id IS NULL AND estado_operativo = 'LIBRE') OR
    (comanda_activa_id IS NOT NULL AND estado_operativo != 'LIBRE')
);
```

---

## Tabla: eventos_procesados

Para garantizar idempotencia en el procesamiento de eventos de Redis.

```sql
CREATE TABLE eventos_procesados (
    event_id UUID PRIMARY KEY,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_evento VARCHAR(50) NOT NULL,
    origen VARCHAR(50) NOT NULL  -- 'reservas', 'carta', etc.
);

-- Comentarios
COMMENT ON TABLE eventos_procesados IS 'Registro de eventos procesados para idempotencia';

-- Índice para búsquedas por tipo
CREATE INDEX idx_eventos_tipo ON eventos_procesados(tipo_evento);

-- Limpiar eventos antiguos (más de 7 días) - opcional
-- DELETE FROM eventos_procesados WHERE processed_at < NOW() - INTERVAL '7 days';
```

---

## Vistas

### Vista: resumen_comandas_activas

```sql
CREATE VIEW resumen_comandas_activas AS
SELECT 
    c.id,
    c.codigo,
    c.mesa_id,
    mo.numero as mesa_numero,
    c.camarero_id,
    c.estado,
    c.numero_comensales,
    c.total,
    c.fecha_apertura,
    COUNT(p.id) as total_pedidos,
    COUNT(CASE WHEN p.estado = 'PENDIENTE' THEN 1 END) as pedidos_pendientes,
    COUNT(CASE WHEN p.estado = 'EN_PREPARACION' THEN 1 END) as pedidos_preparacion,
    COUNT(CASE WHEN p.estado = 'LISTO' THEN 1 END) as pedidos_listos,
    COUNT(CASE WHEN p.estado = 'SERVIDO' THEN 1 END) as pedidos_servidos,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - c.fecha_apertura))/60 as minutos_abierta
FROM comandas c
LEFT JOIN pedidos p ON p.comanda_id = c.id AND p.estado != 'CANCELADO'
LEFT JOIN mesas_operativas mo ON mo.id = c.mesa_id
WHERE c.estado IN ('ABIERTA', 'EN_PREPARACION', 'SERVIDA', 'CUENTA')
GROUP BY c.id, c.codigo, c.mesa_id, mo.numero, c.camarero_id, 
         c.estado, c.numero_comensales, c.total, c.fecha_apertura;
```

### Vista: mesas_con_estado_completo

```sql
CREATE VIEW mesas_con_estado_completo AS
SELECT 
    mo.id,
    mo.numero,
    mo.sala_id,
    mo.estado_operativo,
    mo.comanda_activa_id,
    c.codigo as codigo_comanda,
    c.estado as estado_comanda,
    c.total as total_comanda,
    mo.camarero_asignado_id,
    mo.reserva_actual_id,
    mo.nombre_cliente_reserva,
    CASE 
        WHEN mo.estado_operativo = 'LIBRE' AND mo.reserva_actual_id IS NOT NULL 
        THEN 'RESERVADA'
        ELSE mo.estado_operativo::TEXT
    END as estado_visual
FROM mesas_operativas mo
LEFT JOIN comandas c ON c.id = mo.comanda_activa_id;
```

---

## Índices

```sql
-- Comandas
CREATE INDEX idx_comandas_mesa ON comandas(mesa_id);
CREATE INDEX idx_comandas_camarero ON comandas(camarero_id);
CREATE INDEX idx_comandas_estado ON comandas(estado);
CREATE INDEX idx_comandas_fecha ON comandas(fecha_aperture);
CREATE INDEX idx_comandas_codigo ON comandas(codigo);

-- Pedidos
CREATE INDEX idx_pedidos_comanda ON pedidos(comanda_id);
CREATE INDEX idx_pedidos_plato ON pedidos(plato_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_hora ON pedidos(hora_pedido);

-- Mesas operativas
CREATE INDEX idx_mesas_sala ON mesas_operativas(sala_id);
CREATE INDEX idx_mesas_estado ON mesas_operativas(estado_operativo);
CREATE INDEX idx_mesas_comanda ON mesas_operativas(comanda_activa_id);
CREATE INDEX idx_mesas_camarero ON mesas_operativas(camarero_asignado_id);
```

---

## Funciones y Triggers

### Trigger: Actualizar updated_at automáticamente

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a tablas
CREATE TRIGGER update_comandas_updated_at 
    BEFORE UPDATE ON comandas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesas_operativas_updated_at 
    BEFORE UPDATE ON mesas_operativas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Función: Calcular total de comanda

```sql
CREATE OR REPLACE FUNCTION calcular_total_comanda(p_comanda_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total DECIMAL(10,2);
    v_descuento DECIMAL(5,2);
BEGIN
    -- Sumar pedidos no cancelados
    SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
    INTO v_total
    FROM pedidos
    WHERE comanda_id = p_comanda_id 
    AND estado != 'CANCELADO';
    
    -- Aplicar descuento si existe
    SELECT descuento_porcentaje 
    INTO v_descuento
    FROM comandas 
    WHERE id = p_comanda_id;
    
    RETURN v_total * (1 - v_descuento / 100);
END;
$$ LANGUAGE plpgsql;
```

### Trigger: Actualizar total automáticamente al cambiar pedido

```sql
CREATE OR REPLACE FUNCTION actualizar_total_comanda()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE comandas
    SET total = calcular_total_comanda(NEW.comanda_id)
    WHERE id = NEW.comanda_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_total_pedido
    AFTER INSERT OR UPDATE OR DELETE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_total_comanda();
```

---

## Seed Data (Datos iniciales)

```sql
-- Insertar mesas operativas iniciales (ejemplo)
-- Estas deben sincronizarse con reservas-service
INSERT INTO mesas_operativas (id, numero, sala_id, estado_operativo) VALUES
    ('11111111-1111-1111-1111-111111111111', 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LIBRE'),
    ('22222222-2222-2222-2222-222222222222', 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LIBRE'),
    ('33333333-3333-3333-3333-333333333333', 3, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LIBRE');
```

---

## Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐
│  comandas       │       │  pedidos        │
├─────────────────┤       ├─────────────────┤
│ PK id           │◄──────┤ FK comanda_id   │
│    mesa_id      │       │    plato_id     │
│    camarero_id  │       │    cantidad     │
│    codigo       │       │    precio_unit  │
│    estado       │       │    estado       │
│    total        │       │    hora_pedido  │
│    fecha_apert  │       └─────────────────┘
└─────────────────┘              │
         │                       │
         │    ┌─────────────────┘
         │    │
         ▼    ▼
┌─────────────────┐
│ mesas_operativas│
├─────────────────┤
│ PK id           │
│    numero       │
│    sala_id      │
│    estado_op    │
│ FK comanda_id   │
│    camarero_id  │
└─────────────────┘
```

---

**Versión**: 1.0.0  
**Compatibilidad**: PostgreSQL 14+  
**Actualizado**: 2026-03-07
