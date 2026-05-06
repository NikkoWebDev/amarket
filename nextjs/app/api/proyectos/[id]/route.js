import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request, context) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });

    const { id } = await context.params;
    const [rows] = await pool.query('SELECT * FROM proyecto WHERE id_proyecto = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

    const proyecto = rows[0];

    if (user.rol === 'cliente' && proyecto.id_cliente !== user.id_usuario) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    if (user.rol === 'empleado') {
      const [asign] = await pool.query(
        'SELECT 1 FROM Asignaciones WHERE id_proyecto = ? AND id_empleado = ?',
        [proyecto.id_proyecto, user.id_usuario]
      );
      if (asign.length === 0) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const [etapas] = await pool.query('SELECT * FROM Etapa WHERE id_proyecto = ? ORDER BY num_etapa', [proyecto.id_proyecto]);
    const [asignaciones] = await pool.query(`
      SELECT a.*, u.nombre AS nombre_empleado
      FROM Asignaciones a
      JOIN Usuarios u ON u.id_usuario = a.id_empleado
      WHERE a.id_proyecto = ?
    `, [proyecto.id_proyecto]);
    const [feedback] = await pool.query(`
      SELECT f.*, u.nombre AS nombre_autor
      FROM Feedback f
      JOIN Usuarios u ON u.id_usuario = f.id_autor
      WHERE f.id_proyecto = ?
      ORDER BY f.id_feedback DESC
    `, [proyecto.id_proyecto]);

    return NextResponse.json({ ...proyecto, etapas, asignaciones, feedback });
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

    const [result] = await pool.query('UPDATE proyecto SET titulo = ? WHERE id_proyecto = ?', [titulo, id]);
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

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
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query('DELETE FROM Feedback WHERE id_proyecto = ?', [id]);
    await conn.query('DELETE FROM Asignaciones WHERE id_proyecto = ?', [id]);
    await conn.query('DELETE FROM Etapa WHERE id_proyecto = ?', [id]);
    const [result] = await conn.query('DELETE FROM proyecto WHERE id_proyecto = ?', [id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    await conn.commit();
    conn.release();

    return NextResponse.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
