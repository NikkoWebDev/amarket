import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const { id } = params;
    const result = await pool.query(`
      SELECT p.*, u.nombre AS nombre_cliente
      FROM proyecto p
      JOIN usuarios u ON u.id_usuario = p.id_cliente
      WHERE p.id_proyecto = $1
    `, [id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), { status: 404 });
    }

    const proyecto = result.rows[0];

    const etapasResult = await pool.query(
      'SELECT * FROM etapa WHERE id_proyecto = $1 ORDER BY num_etapa', [id]
    );
    proyecto.etapas = etapasResult.rows;

    const feedbackResult = await pool.query(
      'SELECT f.*, u.nombre AS nombre_autor FROM feedback f JOIN usuarios u ON u.id_usuario = f.id_autor WHERE f.id_proyecto = $1 ORDER BY f.fecha',
      [id]
    );
    proyecto.feedback = feedbackResult.rows;

    const asignacionesResult = await pool.query(
      'SELECT a.*, u.nombre AS nombre_empleado FROM asignaciones a JOIN usuarios u ON u.id_usuario = a.id_empleado WHERE a.id_proyecto = $1',
      [id]
    );
    proyecto.asignaciones = asignacionesResult.rows;

    return new Response(JSON.stringify(proyecto));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return new Response(JSON.stringify({ error: denied.error }), { status: denied.status });

    const { id } = params;
    const { titulo } = await request.json();

    const result = await pool.query(
      'UPDATE proyecto SET titulo = $1 WHERE id_proyecto = $2 RETURNING *',
      [titulo, id]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(result.rows[0]));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return new Response(JSON.stringify({ error: denied.error }), { status: denied.status });

    const { id } = params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM feedback WHERE id_proyecto = $1', [id]);
      await client.query('DELETE FROM asignaciones WHERE id_proyecto = $1', [id]);
      await client.query('DELETE FROM etapa WHERE id_proyecto = $1', [id]);
      const result = await client.query('DELETE FROM proyecto WHERE id_proyecto = $1 RETURNING id_proyecto', [id]);
      await client.query('COMMIT');

      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), { status: 404 });
      }

      return new Response(JSON.stringify({ message: 'Proyecto eliminado' }));
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
