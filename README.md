# Sistema de Gestión de Proyectos y Comunicación con Clientes

MVP de un sistema que permite a un Administrador registrar Empleados y Clientes, asignar empleados a proyectos y que el Cliente vea el progreso de su trabajo en un tablero de 4 etapas tipo Kanban.

## Arquitectura

- **Backend**: Node.js + Express + MySQL + JWT
- **Frontend**: React + Vite + React Router

## Requisitos

- Node.js >= 18
- MySQL >= 8.0

## Instalación y Ejecución

### 1. Base de Datos

```bash
# Crear la base de datos y usuario en MySQL
mysql -u root -p -e "
  CREATE DATABASE IF NOT EXISTS gestion_proyectos;
  CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'app_password_123';
  GRANT ALL PRIVILEGES ON gestion_proyectos.* TO 'app_user'@'localhost';
  FLUSH PRIVILEGES;
"
```

### 2. Backend

```bash
cd backend

# Copiar el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de DB y JWT secret

# Instalar dependencias
npm install

# Ejecutar migraciones (crea las tablas)
npm run migrate

# Crear usuario admin inicial (admin@sistema.com / admin123)
node src/migrations/seed.js

# Iniciar el servidor
npm run dev
```

El servidor corre en `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend

# Copiar el archivo de variables de entorno
cp .env.example .env

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend corre en `http://localhost:5173`.

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `app_user` |
| `DB_PASSWORD` | Contraseña de MySQL | `app_password_123` |
| `DB_NAME` | Nombre de la base de datos | `gestion_proyectos` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `tu_secreto_aqui` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `24h` |
| `PORT` | Puerto del servidor | `4000` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL de la API backend | `http://localhost:4000/api` |

## Migraciones

Las migraciones se encuentran en `backend/src/migrations/init.sql`. Para ejecutarlas:

```bash
cd backend
npm run migrate
```

Esto creará las siguientes tablas:
- `Usuarios` — Usuarios del sistema (admin, empleado, cliente)
- `proyecto` — Proyectos gestionados
- `Etapa` — 4 etapas por proyecto (Planificación, Diseño, Desarrollo, Entrega)
- `Asignaciones` — Relación empleado-proyecto
- `Feedback` — Comentarios y aprobaciones del cliente

## API Endpoints

### Autenticación
- `POST /api/auth/login` — Login (retorna JWT)
- `POST /api/auth/register` — Registrar usuario (solo admin)
- `GET /api/auth/users` — Listar usuarios (solo admin)
- `GET /api/auth/me` — Perfil del usuario autenticado

### Proyectos
- `GET /api/proyectos` — Listar proyectos (filtrado por rol)
- `GET /api/proyectos/:id` — Detalle de proyecto con etapas, asignaciones y feedback
- `POST /api/proyectos` — Crear proyecto (solo admin, crea 4 etapas automáticamente)
- `PUT /api/proyectos/:id` — Actualizar proyecto (solo admin)
- `DELETE /api/proyectos/:id` — Eliminar proyecto (solo admin)

### Etapas
- `GET /api/etapas/:id_proyecto` — Listar etapas de un proyecto
- `PUT /api/etapas/:id_etapa` — Actualizar estado de etapa (empleado/admin)

### Asignaciones
- `POST /api/asignaciones` — Asignar empleado a proyecto (solo admin)
- `DELETE /api/asignaciones/:id` — Eliminar asignación (solo admin)

### Feedback
- `GET /api/feedback/:id_proyecto` — Listar feedback de un proyecto
- `POST /api/feedback` — Crear feedback (solo cliente)
- `PUT /api/feedback/:id` — Actualizar feedback (solo el autor)

## Roles y Permisos

| Acción | Admin | Empleado | Cliente |
|---|---|---|---|
| Crear usuarios | Si | No | No |
| Crear proyectos | Si | No | No |
| Asignar empleados | Si | No | No |
| Ver todos los proyectos | Si | Solo asignados | Solo propios |
| Actualizar etapas | Si | Si (asignados) | No |
| Crear feedback | No | No | Si |
| Ver feedback | Si | Si | Si |

## Credenciales por Defecto

Después de ejecutar el seed:
- **Admin**: `admin@sistema.com` / `admin123`

## Reglas de Negocio

1. Un cliente solo puede ver los proyectos donde su `id_cliente` coincida con su ID de usuario.
2. El sistema actualiza automáticamente `fecha_modificacion` cada vez que se cambia el estado de una etapa.
3. Al crear un proyecto, se generan automáticamente 4 etapas (Planificación, Diseño, Desarrollo, Entrega).
4. Los empleados solo pueden actualizar etapas de proyectos a los que están asignados.
5. El feedback incluye un campo `aprobado` (booleano) para confirmar la entrega.
