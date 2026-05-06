CREATE TABLE IF NOT EXISTS `Usuarios` (
    `id_usuario` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `rol` ENUM('admin', 'empleado', 'cliente') NOT NULL
);

CREATE TABLE IF NOT EXISTS `proyecto` (
    `id_proyecto` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `titulo` VARCHAR(255) NOT NULL,
    `id_cliente` INT UNSIGNED NOT NULL,
    `id_admin` INT UNSIGNED NOT NULL,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_modificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `Etapa` (
    `id_etapa` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_proyecto` INT UNSIGNED NOT NULL,
    `num_etapa` INT NOT NULL,
    `descripcion` TEXT NOT NULL,
    `estado` ENUM('pendiente', 'en_proceso', 'completado') NOT NULL DEFAULT 'pendiente'
);

CREATE TABLE IF NOT EXISTS `Asignaciones` (
    `id_asignacion` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_proyecto` INT UNSIGNED NOT NULL,
    `id_empleado` INT UNSIGNED NOT NULL
);

CREATE TABLE IF NOT EXISTS `Feedback` (
    `id_feedback` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_proyecto` INT UNSIGNED NOT NULL,
    `id_autor` INT UNSIGNED NOT NULL,
    `comentario` TEXT NOT NULL,
    `aprobado` BOOLEAN NOT NULL DEFAULT FALSE
);

-- Relaciones de Proyecto
ALTER TABLE `proyecto` ADD CONSTRAINT `proyecto_id_admin_foreign` FOREIGN KEY(`id_admin`) REFERENCES `Usuarios`(`id_usuario`);
ALTER TABLE `proyecto` ADD CONSTRAINT `proyecto_id_cliente_foreign` FOREIGN KEY(`id_cliente`) REFERENCES `Usuarios`(`id_usuario`);

-- Relaciones de Etapa
ALTER TABLE `Etapa` ADD CONSTRAINT `etapa_id_proyectos_foreign` FOREIGN KEY(`id_proyecto`) REFERENCES `proyecto`(`id_proyecto`);

-- Relaciones de Asignaciones
ALTER TABLE `Asignaciones` ADD CONSTRAINT `asignaciones_id_proyecto_foreign` FOREIGN KEY(`id_proyecto`) REFERENCES `proyecto`(`id_proyecto`);
ALTER TABLE `Asignaciones` ADD CONSTRAINT `asignaciones_id_empleado_foreign` FOREIGN KEY(`id_empleado`) REFERENCES `Usuarios`(`id_usuario`);

-- Relaciones de Feedback
ALTER TABLE `Feedback` ADD CONSTRAINT `feedback_id_proyecto_foreign` FOREIGN KEY(`id_proyecto`) REFERENCES `proyecto`(`id_proyecto`);
ALTER TABLE `Feedback` ADD CONSTRAINT `feedback_id_autor_foreign` FOREIGN KEY(`id_autor`) REFERENCES `Usuarios`(`id_usuario`);
