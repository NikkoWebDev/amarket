import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function POST(request) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id_proyecto, id_empleado } = await request.json();
    if (!id_proyecto || !id_empleado) {
      return NextResponse.json({ error: 'id_proyecto e id_empleado son obligatorios' }, { status: 400 });
    }

    const [empRows] = await pool.query(
      'SELECT id_usuario FROM Usuarios WHERE id_usuario = ? AND rol = "empleado"',
      [id_empleado]
    );
    if (empRows.length === 0) {
      return NextResponse.json({ error: 'El id_empleado no corresponde a un usuario con rol empleado' }, { status: 400 });
    }

    const [projRows] = await pool.query('SELECT 1 FROM proyecto WHERE id_proyecto = ?', [id_proyecto]);
    if (projRows.length === 0) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const [existing] = await pool.query(
      'SELECT 1 FROM Asignaciones WHERE id_proyecto = ? AND id_empleado = ?',
      [id_proyecto, id_empleado]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: 'El empleado ya está asignado a este proyecto' }, { status: 409 });
    }

    const [result] = await pool.query(
      'INSERT INTO Asignaciones (id_proyecto, id_empleado) VALUES (?, ?)',
      [id_proyecto, id_empleado]
    );

    return NextResponse.json({ id_asignacion: result.insertId, id_proyecto, id_empleado }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obligatorio' }, { status: 400 });

    const [result] = await pool.query('DELETE FROM Asignaciones WHERE id_asignacion = ?', [id]);
    if (result.affectedRows === 0) return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });

    return NextResponse.json({ message: 'Asignación eliminada' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
