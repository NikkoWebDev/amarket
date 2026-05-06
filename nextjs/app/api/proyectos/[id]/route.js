import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request, context) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });

    const { id } = await context.params;
    const projResult = await pool.query('SELECT * FROM proyecto WHERE id_proyecto = $1', [id]);
    if (projResult.rows.length === 0) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

    const proyecto = projResult.rows[0];

    if (user.rol === 'cliente' && proyecto.id_cliente !== user.id_usuario) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    if (user.rol === 'empleado') {
      const asignResult = await pool.query(
        'SELECT 1 FROM asignaciones WHERE id_proyecto = $1 AND id_empleado = $2',
        [proyecto.id_proyecto, user.id_usuario]
      );
      if (asignResult.rows.length === 0) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const etapasResult = await pool.query('SELECT * FROM etapa WHERE id_proyecto = $1 ORDER BY num_etapa', [proyecto.id_proyecto]);
    const asignacionesResult = await pool.query(`
      SELECT a.*, u.nombre AS nombre_empleado
      FROM asignaciones a
      JOIN usuarios u ON u.id_usuario = a.id_empleado
      WHERE a.id_proyecto = $1
    `, [proyecto.id_proyecto]);
    const feedbackResult = await pool.query(`
      SELECT f.*, u.nombre AS nombre_autor
      FROM feedback f
      JOIN usuarios u ON u.id_usuario = f.id_autor
      WHERE f.id_proyecto = $1
      ORDER BY f.id_feedback DESC
    `, [proyecto.id_proyecto]);

    return NextResponse.json({ ...proyecto, etapas: etapasResult.rows, asignaciones: asignacionesResult.rows, feedback: feedbackResult.rows });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await context.params;
    const { titulo } = await request.json();
    if (!titulo) return NextResponse.json({ error: 'titulo es obligatorio' }, { status: 400 });

    const result = await pool.query('UPDATE proyecto SET titulo = $1 WHERE id_proyecto = $2', [titulo, id]);
    if (result.rowCount === 0) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

    return NextResponse.json({ message: 'Proyecto actualizado' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await context.params;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM feedback WHERE id_proyecto = $1', [id]);
      await client.query('DELETE FROM asignaciones WHERE id_proyecto = $1', [id]);
      await client.query('DELETE FROM etapa WHERE id_proyecto = $1', [id]);
      const result = await client.query('DELETE FROM proyecto WHERE id_proyecto = $1', [id]);
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
      }
      await client.query('COMMIT');
      return NextResponse.json({ message: 'Proyecto eliminado' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
