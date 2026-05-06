import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id_proyecto, id_empleado } = await request.json();
    if (!id_proyecto || !id_empleado) {
      return NextResponse.json({ error: 'id_proyecto e id_empleado son obligatorios' }, { status: 400 });
    }

    const empResult = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = $1 AND rol = \'empleado\'',
      [id_empleado]
    );
    if (empResult.rows.length === 0) {
      return NextResponse.json({ error: 'El id_empleado no corresponde a un usuario con rol empleado' }, { status: 400 });
    }

    const projResult = await pool.query('SELECT 1 FROM proyecto WHERE id_proyecto = $1', [id_proyecto]);
    if (projResult.rows.length === 0) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const existingResult = await pool.query(
      'SELECT 1 FROM asignaciones WHERE id_proyecto = $1 AND id_empleado = $2',
      [id_proyecto, id_empleado]
    );
    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'El empleado ya está asignado a este proyecto' }, { status: 409 });
    }

    const result = await pool.query(
      'INSERT INTO asignaciones (id_proyecto, id_empleado) VALUES ($1, $2) RETURNING id_asignacion',
      [id_proyecto, id_empleado]
    );

    return NextResponse.json({ id_asignacion: result.rows[0].id_asignacion, id_proyecto, id_empleado }, { status: 201 });
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

    const result = await pool.query('DELETE FROM asignaciones WHERE id_asignacion = $1', [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });

    return NextResponse.json({ message: 'Asignación eliminada' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
