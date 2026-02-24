-- ============================================================
-- MICRO SERVICIO CARTA - Schema PostgreSQL
-- ============================================================

-- Enum Types
CREATE TYPE unidad_medida AS ENUM ('GRAMO', 'ML', 'UNIDAD');
CREATE TYPE rol_usuario AS ENUM ('PROPIETARIO', 'GERENTE', 'CAMARERO');

-- ============================================================
-- TABLA: distribuidores
-- ============================================================
CREATE TABLE distribuidores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_contacto_obligatorio 
        CHECK (email IS NOT NULL OR telefono IS NOT NULL)
);

CREATE INDEX idx_distribuidores_activo ON distribuidores(activo);
CREATE INDEX idx_distribuidores_nombre ON distribuidores(nombre);

-- ============================================================
-- TABLA: ingredientes
-- ============================================================
CREATE TABLE ingredientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    unidad_medida unidad_medida NOT NULL,
    precio_por_unidad DECIMAL(10,4) NOT NULL CHECK (precio_por_unidad >= 0),
    stock_actual DECIMAL(10,4) DEFAULT 0 CHECK (stock_actual >= 0),
    umbral_alerta DECIMAL(10,4) NOT NULL CHECK (umbral_alerta >= 0),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingredientes_activo ON ingredientes(activo);
CREATE INDEX idx_ingredientes_nombre ON ingredientes(nombre);

-- ============================================================
-- TABLA: ingrediente_distribuidor (N:N)
-- ============================================================
CREATE TABLE ingrediente_distribuidor (
    ingrediente_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
    distribuidor_id UUID NOT NULL REFERENCES distribuidores(id) ON DELETE CASCADE,
    precio_personalizado DECIMAL(10,4),
    PRIMARY KEY (ingrediente_id, distribuidor_id)
);

CREATE INDEX idx_ing_dist_ingrediente ON ingrediente_distribuidor(ingrediente_id);
CREATE INDEX idx_ing_dist_distribuidor ON ingrediente_distribuidor(distribuidor_id);

-- ============================================================
-- TABLA: platos
-- ============================================================
CREATE TABLE platos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(10,2) NOT NULL CHECK (precio_venta > 0),
    contador_pedidos BIGINT DEFAULT 0 CHECK (contador_pedidos >= 0),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platos_activo ON platos(activo);
CREATE INDEX idx_platos_nombre ON platos(nombre);

-- ============================================================
-- TABLA: platos_imagenes
-- ============================================================
CREATE TABLE platos_imagenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plato_id UUID NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platos_imagenes_plato ON platos_imagenes(plato_id);
CREATE INDEX idx_platos_imagenes_orden ON platos_imagenes(plato_id, orden);

-- ============================================================
-- TABLA: escandallos
-- ============================================================
CREATE TABLE escandallos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plato_id UUID NOT NULL UNIQUE REFERENCES platos(id) ON DELETE CASCADE,
    nombre_version VARCHAR(100) NOT NULL,
    coste_total_snapshot DECIMAL(10,4) NOT NULL DEFAULT 0 CHECK (coste_total_snapshot >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escandallos_plato ON escandallos(plato_id);

-- ============================================================
-- TABLA: escandallo_detalles
-- ============================================================
CREATE TABLE escandallo_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escandallo_id UUID NOT NULL REFERENCES escandallos(id) ON DELETE CASCADE,
    ingrediente_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE RESTRICT,
    cantidad DECIMAL(10,4) NOT NULL CHECK (cantidad > 0),
    
    CONSTRAINT uq_escandallo_ingrediente UNIQUE (escandallo_id, ingrediente_id)
);

CREATE INDEX idx_escandallo_detalles_escandallo ON escandallo_detalles(escandallo_id);
CREATE INDEX idx_escandallo_detalles_ingrediente ON escandallo_detalles(ingrediente_id);

-- ============================================================
-- TABLA: tipos_carta
-- ============================================================
CREATE TABLE tipos_carta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_hora_valida CHECK (hora_inicio < hora_fin)
);

CREATE INDEX idx_tipos_carta_activo ON tipos_carta(activo);
CREATE INDEX idx_tipos_carta_horario ON tipos_carta(hora_inicio, hora_fin);

-- ============================================================
-- TABLA: tipo_carta_plato (N:N)
-- ============================================================
CREATE TABLE tipo_carta_plato (
    tipo_carta_id UUID NOT NULL REFERENCES tipos_carta(id) ON DELETE CASCADE,
    plato_id UUID NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
    PRIMARY KEY (tipo_carta_id, plato_id)
);

CREATE INDEX idx_tipo_carta_plato_tipo ON tipo_carta_plato(tipo_carta_id);
CREATE INDEX idx_tipo_carta_plato_plato ON tipo_carta_plato(plato_id);

-- ============================================================
-- TABLA: eventos_procesados (Idempotencia)
-- ============================================================
CREATE TABLE eventos_procesados (
    event_id UUID PRIMARY KEY,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eventos_procesados_fecha ON eventos_procesados(processed_at);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para ingredientes
CREATE TRIGGER update_ingredientes_updated_at
    BEFORE UPDATE ON ingredientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para escandallos
CREATE TRIGGER update_escandallos_updated_at
    BEFORE UPDATE ON escandallos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: Plato con coste y margen calculado
CREATE OR REPLACE VIEW vista_platos_con_coste AS
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio_venta,
    p.contador_pedidos,
    p.activo,
    COALESCE(e.coste_total_snapshot, 0) AS coste_total,
    CASE 
        WHEN p.precio_venta > 0 
        THEN ROUND((p.precio_venta - COALESCE(e.coste_total_snapshot, 0)) / p.precio_venta, 4)
        ELSE 0 
    END AS margen
FROM platos p
LEFT JOIN escandallos e ON p.id = e.plato_id;

-- Vista: Ingredientes con estado de stock
CREATE OR REPLACE VIEW vista_ingredientes_stock AS
SELECT 
    i.id,
    i.nombre,
    i.unidad_medida,
    i.stock_actual,
    i.umbral_alerta,
    i.activo,
    CASE 
        WHEN i.stock_actual < i.umbral_alerta THEN 'BAJO'
        WHEN i.stock_actual < (i.umbral_alerta * 1.5) THEN 'MEDIO'
        ELSE 'OK'
    END AS estado_stock
FROM ingredientes i;

-- Vista: Carta activa actual
CREATE OR REPLACE VIEW vista_carta_activa AS
SELECT 
    tc.id AS tipo_carta_id,
    tc.nombre AS tipo_carta_nombre,
    tc.hora_inicio,
    tc.hora_fin,
    p.id AS plato_id,
    p.nombre AS plato_nombre,
    p.descripcion AS plato_descripcion,
    p.precio_venta,
    COALESCE(e.coste_total_snapshot, 0) AS coste_total,
    CASE 
        WHEN p.precio_venta > 0 
        THEN ROUND((p.precio_venta - COALESCE(e.coste_total_snapshot, 0)) / p.precio_venta, 4)
        ELSE 0 
    END AS margen
FROM tipos_carta tc
JOIN tipo_carta_plato tcp ON tc.id = tcp.tipo_carta_id
JOIN platos p ON tcp.plato_id = p.id
LEFT JOIN escandallos e ON p.id = e.plato_id
WHERE tc.activo = true AND p.activo = true;

-- ============================================================
-- SEEDS INICIALES (Opcional)
-- ============================================================

-- Insertar tipo de carta inicial
-- INSERT INTO tipos_carta (id, nombre, hora_inicio, hora_fin, activo)
-- VALUES 
--     (gen_random_uuid(), 'Carta Principal', '12:00:00', '16:00:00', true),
--     (gen_random_uuid(), 'Carta Cena', '20:00:00', '23:59:59', false);

-- ============================================================
-- CONSULTA PARA VERIFICAR ESTADO
-- ============================================================

SELECT 
    'distribuidores' AS tabla, COUNT(*) AS registros FROM distribuidores
UNION ALL
SELECT 'ingredientes', COUNT(*) FROM ingredientes
UNION ALL
SELECT 'platos', COUNT(*) FROM platos
UNION ALL
SELECT 'escandallos', COUNT(*) FROM escandallos
UNION ALL
SELECT 'tipos_carta', COUNT(*) FROM tipos_carta
UNION ALL
SELECT 'eventos_procesados', COUNT(*) FROM eventos_procesados;
