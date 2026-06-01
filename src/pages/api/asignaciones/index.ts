import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return new Response(JSON.stringify({ error: denied.error }), { status: denied.status });

    const { id_proyecto, id_empleado } = await request.json();
    if (!id_proyecto || !id_empleado) {
      return new Response(JSON.stringify({ error: 'id_proyecto e id_empleado son obligatorios' }), { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO asignaciones (id_proyecto, id_empleado) VALUES ($1, $2) RETURNING *',
      [id_proyecto, id_empleado]
    );

    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    let result;
    if (user.rol === 'admin') {
      result = await pool.query(`
        SELECT a.*, u.nombre AS nombre_empleado, p.titulo AS nombre_proyecto
        FROM asignaciones a
        JOIN usuarios u ON u.id_usuario = a.id_empleado
        JOIN proyecto p ON p.id_proyecto = a.id_proyecto
      `);
    } else if (user.rol === 'empleado') {
      result = await pool.query(`
        SELECT a.*, p.titulo AS nombre_proyecto
        FROM asignaciones a
        JOIN proyecto p ON p.id_proyecto = a.id_proyecto
        WHERE a.id_empleado = $1
      `, [user.id_usuario]);
    } else {
      return new Response(JSON.stringify({ error: 'Acceso denegado' }), { status: 403 });
    }

    return new Response(JSON.stringify(result.rows));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
