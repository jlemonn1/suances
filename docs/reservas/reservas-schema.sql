-- ============================================================
-- MICRO SERVICIO RESERVAS - Schema PostgreSQL
-- ============================================================

-- =========================
-- ENUMERACIONES
-- =========================
CREATE TYPE mesa_estado AS ENUM ('LIBRE', 'OCUPADA', 'BLOQUEADA');
CREATE TYPE reserva_estado AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'NO_SHOW', 'FINALIZADA');
CREATE TYPE reserva_origen AS ENUM ('ONLINE', 'MANUAL', 'WALKIN');
CREATE TYPE franja_tipo AS ENUM ('COMIDA', 'CENA', 'ESPECIAL');
CREATE TYPE bloqueo_tipo AS ENUM ('ONLINE', 'TOTAL', 'EVENTO', 'MANTENIMIENTO', 'EVENTO_AUTO');
CREATE TYPE waitlist_estado AS ENUM ('WAITING', 'NOTIFIED', 'CONFIRMED', 'CANCELLED');

-- =========================
-- TABLA: salas
-- =========================
CREATE TABLE salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    capacidad_maxima INTEGER CHECK (capacidad_maxima >= 0),
    layout_json JSONB,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_salas_nombre ON salas(LOWER(nombre));

-- =========================
-- TABLA: mesas
-- =========================
CREATE TABLE mesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sala_id UUID NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    capacidad SMALLINT NOT NULL CHECK (capacidad > 0),
    pos_x INTEGER,
    pos_y INTEGER,
    ancho INTEGER,
    alto INTEGER,
    visible_online BOOLEAN NOT NULL DEFAULT TRUE,
    estado mesa_estado NOT NULL DEFAULT 'LIBRE',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_mesa_numero_por_sala UNIQUE (sala_id, numero)
);

CREATE INDEX idx_mesas_sala ON mesas(sala_id);
CREATE INDEX idx_mesas_estado ON mesas(estado);

-- =========================
-- TABLA: franjas_horarias
-- =========================
CREATE TABLE franjas_horarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(60) NOT NULL,
    tipo franja_tipo NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_franja_horas CHECK (hora_inicio < hora_fin)
);

CREATE UNIQUE INDEX uq_franja_nombre ON franjas_horarias(LOWER(nombre));

-- =========================
-- TABLA: reservas
-- =========================
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(12) NOT NULL UNIQUE,
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE RESTRICT,
    franja_id UUID NOT NULL REFERENCES franjas_horarias(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL,
    estado reserva_estado NOT NULL DEFAULT 'PENDIENTE',
    origen reserva_origen NOT NULL,
    nombre_cliente VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(200),
    comensales SMALLINT NOT NULL CHECK (comensales > 0),
    notas TEXT,
    confirmacion_token VARCHAR(64),
    confirmacion_expira_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reserva_capacidad CHECK (comensales <= 20),
    CONSTRAINT uq_reserva_mesa_horario UNIQUE (mesa_id, fecha, franja_id)
);

CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_cliente ON reservas(LOWER(nombre_cliente));

-- =========================
-- TABLA: bloqueos
-- =========================
CREATE TABLE bloqueos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    tipo bloqueo_tipo NOT NULL,
    motivo TEXT,
    fecha_desde DATE NOT NULL,
    fecha_hasta DATE NOT NULL,
    franjas JSONB, -- lista de IDs de franjas aplicadas
    creado_por UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bloqueo_fechas CHECK (fecha_desde <= fecha_hasta)
);

CREATE INDEX idx_bloqueos_mesa ON bloqueos(mesa_id);
CREATE INDEX idx_bloqueos_rango ON bloqueos(fecha_desde, fecha_hasta);

-- =========================
-- TABLA: mesa_estado_hist
-- =========================
CREATE TABLE mesa_estado_hist (
    id BIGSERIAL PRIMARY KEY,
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    estado mesa_estado NOT NULL,
    motivo VARCHAR(80),
    ref_evento UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mesa_hist_mesa ON mesa_estado_hist(mesa_id);

-- =========================
-- TABLA: waitlist
-- =========================
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    franja_id UUID NOT NULL REFERENCES franjas_horarias(id) ON DELETE CASCADE,
    comensales SMALLINT NOT NULL CHECK (comensales > 0),
    nombre_cliente VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    prioridad SMALLINT NOT NULL DEFAULT 10,
    estado waitlist_estado NOT NULL DEFAULT 'WAITING',
    reserva_id UUID REFERENCES reservas(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_waitlist_fecha_franja ON waitlist(fecha, franja_id);

-- =========================
-- TABLA: reserva_audit
-- =========================
CREATE TABLE reserva_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID REFERENCES reservas(id) ON DELETE CASCADE,
    accion VARCHAR(60) NOT NULL,
    usuario_id UUID,
    payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reserva_audit_reserva ON reserva_audit(reserva_id);

-- =========================
-- TABLA: eventos_procesados
-- =========================
CREATE TABLE eventos_procesados (
    event_id UUID PRIMARY KEY,
    source VARCHAR(60) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FUNCIONES/TRIGGERS PARA updated_at
-- =========================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_salas_updated
    BEFORE UPDATE ON salas
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER trg_mesas_updated
    BEFORE UPDATE ON mesas
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER trg_franjas_updated
    BEFORE UPDATE ON franjas_horarias
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER trg_reservas_updated
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER trg_waitlist_updated
    BEFORE UPDATE ON waitlist
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();

-- =========================
-- VISTAS ÚTILES
-- =========================

-- Disponibilidad por día/franja
CREATE OR REPLACE VIEW vista_disponibilidad AS
SELECT 
    m.sala_id,
    m.id AS mesa_id,
    f.id AS franja_id,
    g.fecha,
    CASE 
        WHEN b.mesa_id IS NOT NULL THEN 'BLOQUEADA'
        WHEN r.id IS NOT NULL THEN r.estado::TEXT
        ELSE 'LIBRE'
    END AS estado,
    m.capacidad
FROM (
    SELECT generate_series(current_date, current_date + INTERVAL '14 day', INTERVAL '1 day')::date AS fecha
    FROM generate_series(1,1)
) g
CROSS JOIN franjas_horarias f
JOIN mesas m ON m.activa = TRUE
LEFT JOIN reservas r ON r.mesa_id = m.id AND r.fecha = g.fecha AND r.franja_id = f.id AND r.estado <> 'CANCELADA'
LEFT JOIN (
    SELECT mesa_id, fecha_desde, fecha_hasta, franjas
    FROM bloqueos
) b ON b.mesa_id = m.id AND g.fecha BETWEEN b.fecha_desde AND b.fecha_hasta;

-- Reservas con datos de sala y franja
CREATE OR REPLACE VIEW vista_reservas_detalle AS
SELECT r.id,
       r.codigo,
        r.fecha,
        r.estado,
        r.origen,
        r.nombre_cliente,
        r.comensales,
        s.nombre AS sala,
        m.numero AS mesa_numero,
        f.nombre AS franja_nombre,
        f.hora_inicio,
        f.hora_fin
FROM reservas r
JOIN mesas m ON m.id = r.mesa_id
JOIN salas s ON s.id = m.sala_id
JOIN franjas_horarias f ON f.id = r.franja_id;

-- =========================
-- SEEDS OPCIONALES
-- =========================

-- INSERT INTO salas (nombre, capacidad_maxima, layout_json) VALUES ('Sala Principal', 60, '{"ancho":500,"alto":300}');
-- INSERT INTO franjas_horarias (nombre, tipo, hora_inicio, hora_fin) VALUES ('Comida 1', 'COMIDA', '13:00', '14:30');

-- =========================
-- CONSULTAS DE SANIDAD
-- =========================
SELECT 'salas' AS tabla, COUNT(*) FROM salas
UNION ALL SELECT 'mesas', COUNT(*) FROM mesas
UNION ALL SELECT 'franjas', COUNT(*) FROM franjas_horarias
UNION ALL SELECT 'reservas', COUNT(*) FROM reservas;
