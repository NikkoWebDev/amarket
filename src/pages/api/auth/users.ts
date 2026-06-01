import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    const denied = requireRole(user, 'admin');
    if (denied) return new Response(JSON.stringify({ error: denied.error }), { status: denied.status });

    const result = await pool.query(
      'SELECT id_usuario, nombre, email, rol FROM usuarios ORDER BY nombre'
    );

    return new Response(JSON.stringify(result.rows));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
