# Gestión de Proyectos — Next.js

Migración del frontend React+Vite y backend Express a **Next.js App Router** con API Routes, lista para desplegar en **Vercel**.

## Estructura

- `app/api/` — API Routes (auth, proyectos, etapas, asignaciones, feedback)
- `app/page.jsx` — Login
- `app/admin/page.jsx` — Panel de administrador
- `app/proyectos/page.jsx` — Proyectos + Kanban + Feedback
- `lib/db.js` — Conexión MySQL (mysql2/promise)
- `lib/auth.js` — JWT helpers
- `components/` — KanbanBoard, FeedbackPanel, AuthProvider

## Requisitos

- Node.js >= 18
- MySQL >= 8.0 (o un servicio MySQL serverless como PlanetScale, Railway, Aiven)

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password_123
DB_NAME=gestion_proyectos
JWT_SECRET=tu_secreto_jwt_aqui
JWT_EXPIRES_IN=24h
```

> **Nota**: en Vercel configura estas variables en el dashboard de proyecto.

## Base de datos

Asegúrate de que la base de datos y tablas existan. Puedes usar el script del backend original:

```bash
# Desde el repo raíz, si aún tienes el backend original
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gestion_proyectos;"
node backend/src/migrations/run.js
node backend/src/migrations/seed.js
```

## Desarrollo local

```bash
cd nextjs
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en [vercel.com](https://vercel.com).
3. En la configuración de importación, establece **Root Directory** como `nextjs`.
4. Configura las **Environment Variables** del paso anterior.
5. Presiona **Deploy**.

La base de datos MySQL debe ser accesible desde internet. Si usas una DB local, necesitarás un tunnel (no recomendado para producción).

### Opciones de MySQL serverless recomendadas para Vercel

- **PlanetScale** (MySQL serverless)
- **Railway** (MySQL + app)
- **Aiven** (MySQL managed)

Credenciales por defecto (si ejecutaste seed):
- **Admin**: `admin@sistema.com` / `admin123`
