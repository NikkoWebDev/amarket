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

    const [rows] = await pool.query(`
      SELECT f.*, u.nombre AS nombre_autor
      FROM Feedback f
      JOIN Usuarios u ON u.id_usuario = f.id_autor
      WHERE f.id_proyecto = ?
      ORDER BY f.id_feedback DESC
    `, [id_proyecto]);

    return NextResponse.json(rows);
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

    const [projRows] = await pool.query(
      'SELECT 1 FROM proyecto WHERE id_proyecto = ? AND id_cliente = ?',
      [id_proyecto, user.id_usuario]
    );
    if (projRows.length === 0) {
      return NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 });
    }

    const [result] = await pool.query(
      'INSERT INTO Feedback (id_proyecto, id_autor, comentario, aprobado) VALUES (?, ?, ?, ?)',
      [id_proyecto, user.id_usuario, comentario, aprobado ? 1 : 0]
    );

    return NextResponse.json({ id_feedback: result.insertId, id_proyecto, comentario, aprobado }, { status: 201 });
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

    const [fbRows] = await pool.query('SELECT * FROM Feedback WHERE id_feedback = ?', [id]);
    if (fbRows.length === 0) return NextResponse.json({ error: 'Feedback no encontrado' }, { status: 404 });

    const fb = fbRows[0];
    if (fb.id_autor !== user.id_usuario) {
      return NextResponse.json({ error: 'Solo el autor puede modificar este feedback' }, { status: 403 });
    }

    const updates = [];
    const values = [];
    if (aprobado !== undefined) { updates.push('aprobado = ?'); values.push(aprobado ? 1 : 0); }
    if (comentario) { updates.push('comentario = ?'); values.push(comentario); }
    if (updates.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    values.push(id);
    await pool.query(`UPDATE Feedback SET ${updates.join(', ')} WHERE id_feedback = ?`, values);

    return NextResponse.json({ message: 'Feedback actualizado' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
