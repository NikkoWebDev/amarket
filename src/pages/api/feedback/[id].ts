import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const { id } = params;
    const { comentario, aprobado } = await request.json();

    if (aprobado !== undefined) {
      if (user.rol !== 'cliente') {
        return new Response(JSON.stringify({ error: 'Solo los clientes pueden aprobar feedback' }), { status: 403 });
      }

      const result = await pool.query(
        'UPDATE feedback SET aprobado = $1 WHERE id_feedback = $2 RETURNING *',
        [aprobado, id]
      );

      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Feedback no encontrado' }), { status: 404 });
      }

      return new Response(JSON.stringify(result.rows[0]));
    }

    const feedbackResult = await pool.query(
      'SELECT * FROM feedback WHERE id_feedback = $1', [id]
    );
    if (feedbackResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Feedback no encontrado' }), { status: 404 });
    }

    if (feedbackResult.rows[0].id_autor !== user.id_usuario) {
      return new Response(JSON.stringify({ error: 'No puedes editar este feedback' }), { status: 403 });
    }

    const result = await pool.query(
      'UPDATE feedback SET comentario = $1 WHERE id_feedback = $2 RETURNING *',
      [comentario, id]
    );

    return new Response(JSON.stringify(result.rows[0]));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
