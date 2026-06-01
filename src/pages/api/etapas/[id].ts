import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const { id } = params;
    const { estado } = await request.json();

    const etapaResult = await pool.query('SELECT * FROM etapa WHERE id_etapa = $1', [id]);
    if (etapaResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Etapa no encontrada' }), { status: 404 });
    }

    const etapa = etapaResult.rows[0];

    if (user.rol !== 'admin') {
      const asignacion = await pool.query(
        'SELECT * FROM asignaciones WHERE id_proyecto = $1 AND id_empleado = $2',
        [etapa.id_proyecto, user.id_usuario]
      );
      if (asignacion.rows.length === 0 && user.rol !== 'admin') {
        return new Response(JSON.stringify({ error: 'No tienes acceso a este proyecto' }), { status: 403 });
      }
    }

    const result = await pool.query(
      'UPDATE etapa SET estado = $1, fecha_modificacion = NOW() WHERE id_etapa = $2 RETURNING *',
      [estado, id]
    );

    return new Response(JSON.stringify(result.rows[0]));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const { id } = params;
    const result = await pool.query(
      'SELECT * FROM etapa WHERE id_proyecto = $1 ORDER BY num_etapa', [id]
    );

    return new Response(JSON.stringify(result.rows));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
