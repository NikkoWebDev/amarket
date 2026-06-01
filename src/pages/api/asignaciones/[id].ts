import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const prerender = false;

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return new Response(JSON.stringify({ error: denied.error }), { status: denied.status });

    const { id } = params;
    const result = await pool.query(
      'DELETE FROM asignaciones WHERE id_asignacion = $1 RETURNING id_asignacion', [id]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Asignación no encontrada' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Asignación eliminada' }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
