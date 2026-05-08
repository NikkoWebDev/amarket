-- PostgreSQL compatible schema (aligned with Next.js schema)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'empleado', 'cliente'))
);

CREATE TABLE IF NOT EXISTS proyecto (
    id_proyecto SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    id_cliente INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_admin INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS etapa (
    id_etapa SERIAL PRIMARY KEY,
    id_proyecto INTEGER NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    num_etapa INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado'))
);

CREATE TABLE IF NOT EXISTS asignaciones (
    id_asignacion SERIAL PRIMARY KEY,
    id_proyecto INTEGER NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    id_empleado INTEGER NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS feedback (
    id_feedback SERIAL PRIMARY KEY,
    id_proyecto INTEGER NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
    id_autor INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    comentario TEXT NOT NULL,
    aprobado BOOLEAN NOT NULL DEFAULT FALSE
);

-- Trigger para actualizar fecha_modificacion en proyecto
CREATE OR REPLACE FUNCTION update_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_proyecto_fecha_modificacion ON proyecto;
CREATE TRIGGER trigger_update_proyecto_fecha_modificacion
BEFORE UPDATE ON proyecto
FOR EACH ROW
EXECUTE FUNCTION update_fecha_modificacion();
