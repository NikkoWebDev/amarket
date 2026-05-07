-- PostgreSQL compatible schema
CREATE TABLE IF NOT EXISTS "Usuarios" (
    "id_usuario" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(20) NOT NULL CHECK ("rol" IN ('admin', 'empleado', 'cliente'))
);

CREATE TABLE IF NOT EXISTS "proyecto" (
    "id_proyecto" SERIAL PRIMARY KEY,
    "titulo" VARCHAR(255) NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Etapa" (
    "id_etapa" SERIAL PRIMARY KEY,
    "id_proyecto" INTEGER NOT NULL,
    "num_etapa" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK ("estado" IN ('pendiente', 'en_proceso', 'completado'))
);

CREATE TABLE IF NOT EXISTS "Asignaciones" (
    "id_asignacion" SERIAL PRIMARY KEY,
    "id_proyecto" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "Feedback" (
    "id_feedback" SERIAL PRIMARY KEY,
    "id_proyecto" INTEGER NOT NULL,
    "id_autor" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Relaciones de Proyecto
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_id_admin_foreign" FOREIGN KEY ("id_admin") REFERENCES "Usuarios" ("id_usuario");
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_id_cliente_foreign" FOREIGN KEY ("id_cliente") REFERENCES "Usuarios" ("id_usuario");

-- Relaciones de Etapa
ALTER TABLE "Etapa" ADD CONSTRAINT "etapa_id_proyectos_foreign" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto" ("id_proyecto");

-- Relaciones de Asignaciones
ALTER TABLE "Asignaciones" ADD CONSTRAINT "asignaciones_id_proyecto_foreign" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto" ("id_proyecto");
ALTER TABLE "Asignaciones" ADD CONSTRAINT "asignaciones_id_empleado_foreign" FOREIGN KEY ("id_empleado") REFERENCES "Usuarios" ("id_usuario");

-- Relaciones de Feedback
ALTER TABLE "Feedback" ADD CONSTRAINT "feedback_id_proyecto_foreign" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto" ("id_proyecto");
ALTER TABLE "Feedback" ADD CONSTRAINT "feedback_id_autor_foreign" FOREIGN KEY ("id_autor") REFERENCES "Usuarios" ("id_usuario");
