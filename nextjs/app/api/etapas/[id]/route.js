import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function PUT(request, context) {
  try {
    const user = getUserFromRequest(request);
    const denied = requireRole(user, 'empleado', 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await context.params;
    const { estado } = await request.json();
    if (!estado || !['pendiente', 'en_proceso', 'completado'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido. Debe ser: pendiente, en_proceso, completado' }, { status: 400 });
    }

    const etapaResult = await pool.query('SELECT * FROM etapa WHERE id_etapa = $1', [id]);
    if (etapaResult.rows.length === 0) return NextResponse.json({ error: 'Etapa no encontrada' }, { status: 404 });

    const etapa = etapaResult.rows[0];

    if (user.rol === 'empleado') {
      const asignResult = await pool.query(
        'SELECT 1 FROM asignaciones WHERE id_proyecto = $1 AND id_empleado = $2',
        [etapa.id_proyecto, user.id_usuario]
      );
      if (asignResult.rows.length === 0) return NextResponse.json({ error: 'No estás asignado a este proyecto' }, { status: 403 });
    }

    await pool.query('UPDATE etapa SET estado = $1 WHERE id_etapa = $2', [estado, id]);
    await pool.query('UPDATE proyecto SET fecha_modificacion = NOW() WHERE id_proyecto = $1', [etapa.id_proyecto]);

    return NextResponse.json({ message: 'Etapa actualizada', id_etapa: etapa.id_etapa, estado });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
