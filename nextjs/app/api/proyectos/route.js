import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });

    const { id_usuario, rol } = user;
    let rows;

    if (rol === 'admin') {
      [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN Usuarios u ON u.id_usuario = p.id_cliente
      `);
    } else if (rol === 'cliente') {
      [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN Usuarios u ON u.id_usuario = p.id_cliente
        WHERE p.id_cliente = ?
      `, [id_usuario]);
    } else if (rol === 'empleado') {
      [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN Usuarios u ON u.id_usuario = p.id_cliente
        JOIN Asignaciones a ON a.id_proyecto = p.id_proyecto
        WHERE a.id_empleado = ?
      `, [id_usuario]);
    }

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { titulo, id_cliente } = await request.json();
    if (!titulo || !id_cliente) {
      return NextResponse.json({ error: 'titulo e id_cliente son obligatorios' }, { status: 400 });
    }

    const [clienteRows] = await pool.query(
      'SELECT id_usuario FROM Usuarios WHERE id_usuario = ? AND rol = "cliente"',
      [id_cliente]
    );
    if (clienteRows.length === 0) {
      return NextResponse.json({ error: 'El id_cliente no corresponde a un usuario con rol cliente' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO proyecto (titulo, id_cliente, id_admin) VALUES (?, ?, ?)',
      [titulo, id_cliente, authUser.id_usuario]
    );
    const id_proyecto = result.insertId;

    const etapasDefault = [
      { num_etapa: 1, descripcion: 'Etapa 1 - Planificación' },
      { num_etapa: 2, descripcion: 'Etapa 2 - Diseño' },
      { num_etapa: 3, descripcion: 'Etapa 3 - Desarrollo' },
      { num_etapa: 4, descripcion: 'Etapa 4 - Entrega' },
    ];
    for (const etapa of etapasDefault) {
      await conn.query(
        'INSERT INTO Etapa (id_proyecto, num_etapa, descripcion, estado) VALUES (?, ?, ?, "pendiente")',
        [id_proyecto, etapa.num_etapa, etapa.descripcion]
      );
    }

    await conn.commit();
    conn.release();

    return NextResponse.json({ id_proyecto, titulo, id_cliente, id_admin: authUser.id_usuario }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
