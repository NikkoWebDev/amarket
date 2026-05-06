import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id_proyecto = searchParams.get('id_proyecto');
    if (!id_proyecto) return NextResponse.json({ error: 'id_proyecto es obligatorio' }, { status: 400 });

    const result = await pool.query(`
      SELECT f.*, u.nombre AS nombre_autor
      FROM feedback f
      JOIN usuarios u ON u.id_usuario = f.id_autor
      WHERE f.id_proyecto = $1
      ORDER BY f.id_feedback DESC
    `, [id_proyecto]);

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    const denied = requireRole(user, 'cliente');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id_proyecto, comentario, aprobado } = await request.json();
    if (!id_proyecto || !comentario || aprobado === undefined) {
      return NextResponse.json({ error: 'id_proyecto, comentario y aprobado son obligatorios' }, { status: 400 });
    }

    const projResult = await pool.query(
      'SELECT 1 FROM proyecto WHERE id_proyecto = $1 AND id_cliente = $2',
      [id_proyecto, user.id_usuario]
    );
    if (projResult.rows.length === 0) {
      return NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 });
    }

    const result = await pool.query(
      'INSERT INTO feedback (id_proyecto, id_autor, comentario, aprobado) VALUES ($1, $2, $3, $4) RETURNING id_feedback',
      [id_proyecto, user.id_usuario, comentario, aprobado]
    );

    return NextResponse.json({ id_feedback: result.rows[0].id_feedback, id_proyecto, comentario, aprobado }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromRequest(request);
    const denied = requireRole(user, 'cliente');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id, aprobado, comentario } = await request.json();
    if (!id) return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 });

    const fbResult = await pool.query('SELECT * FROM feedback WHERE id_feedback = $1', [id]);
    if (fbResult.rows.length === 0) return NextResponse.json({ error: 'Feedback no encontrado' }, { status: 404 });

    const fb = fbResult.rows[0];
    if (fb.id_autor !== user.id_usuario) {
      return NextResponse.json({ error: 'Solo el autor puede modificar este feedback' }, { status: 403 });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (aprobado !== undefined) { updates.push(`aprobado = $${paramIndex++}`); values.push(aprobado); }
    if (comentario) { updates.push(`comentario = $${paramIndex++}`); values.push(comentario); }
    if (updates.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    values.push(id);
    await pool.query(`UPDATE feedback SET ${updates.join(', ')} WHERE id_feedback = $${paramIndex}`, values);

    return NextResponse.json({ message: 'Feedback actualizado' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
