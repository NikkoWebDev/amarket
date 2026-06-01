import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const { searchParams } = new URL(request.url);
    const idProyecto = searchParams.get('id_proyecto');

    let query = `
      SELECT f.*, u.nombre AS nombre_autor
      FROM feedback f
      JOIN usuarios u ON u.id_usuario = f.id_autor
    `;
    const params = [];

    if (idProyecto) {
      query += ' WHERE f.id_proyecto = $1';
      params.push(idProyecto);
    }

    query += ' ORDER BY f.fecha DESC';

    const result = await pool.query(query, params);
    return new Response(JSON.stringify(result.rows));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const body = await request.json();
    const { id_proyecto, comentario, mensaje, autor, rol, aprobado } = body;

    const text = comentario || mensaje;
    if (!id_proyecto || !text) {
      return new Response(JSON.stringify({ error: 'id_proyecto y comentario/mensaje son obligatorios' }), { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO feedback (id_proyecto, id_autor, comentario, aprobado) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_proyecto, user.id_usuario, text, aprobado || false]
    );

    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const { id, aprobado, comentario } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'id es obligatorio' }), { status: 400 });
    }

    if (aprobado !== undefined && user.rol === 'cliente') {
      const result = await pool.query(
        'UPDATE feedback SET aprobado = $1 WHERE id_feedback = $2 RETURNING *',
        [aprobado, id]
      );
      return new Response(JSON.stringify(result.rows[0]));
    }

    if (comentario) {
      const feedbackResult = await pool.query(
        'SELECT * FROM feedback WHERE id_feedback = $1', [id]
      );
      if (feedbackResult.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Feedback no encontrado' }), { status: 404 });
      }
      if (feedbackResult.rows[0].id_autor !== user.id_usuario) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
      }
      const result = await pool.query(
        'UPDATE feedback SET comentario = $1 WHERE id_feedback = $2 RETURNING *',
        [comentario, id]
      );
      return new Response(JSON.stringify(result.rows[0]));
    }

    return new Response(JSON.stringify({ error: 'No hay campos para actualizar' }), { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
