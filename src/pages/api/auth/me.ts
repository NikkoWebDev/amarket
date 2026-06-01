import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });
    }

    const result = await pool.query(
      'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE id_usuario = $1',
      [user.id_usuario]
    );

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(result.rows[0]));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
