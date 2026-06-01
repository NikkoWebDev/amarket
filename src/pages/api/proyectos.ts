import type { APIRoute } from 'astro';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });

    const { id_usuario, rol } = user;
    let result;

    if (rol === 'admin') {
      result = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN usuarios u ON u.id_usuario = p.id_cliente
      `);
    } else if (rol === 'cliente') {
      result = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN usuarios u ON u.id_usuario = p.id_cliente
        WHERE p.id_cliente = $1
      `, [id_usuario]);
    } else if (rol === 'empleado') {
      result = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN usuarios u ON u.id_usuario = p.id_cliente
        JOIN asignaciones a ON a.id_proyecto = p.id_proyecto
        WHERE a.id_empleado = $1
      `, [id_usuario]);
    }

    const projects = result.rows;
    for (const proj of projects) {
      const etapasResult = await pool.query(
        'SELECT * FROM etapa WHERE id_proyecto = $1 ORDER BY num_etapa',
        [proj.id_proyecto]
      );
      proj.etapas = etapasResult.rows;
    }

    return new Response(JSON.stringify(projects));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return new Response(JSON.stringify({ error: denied.error }), { status: denied.status });

    const { titulo, id_cliente } = await request.json();
    if (!titulo || !id_cliente) {
      return new Response(JSON.stringify({ error: 'titulo e id_cliente son obligatorios' }), { status: 400 });
    }

    const clienteResult = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = $1 AND rol = \'cliente\'',
      [id_cliente]
    );
    if (clienteResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'El id_cliente no corresponde a un usuario con rol cliente' }), { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'INSERT INTO proyecto (titulo, id_cliente, id_admin) VALUES ($1, $2, $3) RETURNING id_proyecto',
        [titulo, id_cliente, authUser.id_usuario]
      );
      const id_proyecto = result.rows[0].id_proyecto;

      const etapasDefault = [
        { num_etapa: 1, descripcion: 'Etapa 1 - Planificación' },
        { num_etapa: 2, descripcion: 'Etapa 2 - Diseño' },
        { num_etapa: 3, descripcion: 'Etapa 3 - Desarrollo' },
        { num_etapa: 4, descripcion: 'Etapa 4 - Entrega' },
      ];
      for (const etapa of etapasDefault) {
        await client.query(
          'INSERT INTO etapa (id_proyecto, num_etapa, descripcion, estado) VALUES ($1, $2, $3, \'pendiente\')',
          [id_proyecto, etapa.num_etapa, etapa.descripcion]
        );
      }

      await client.query('COMMIT');
      return new Response(JSON.stringify({ id_proyecto, titulo, id_cliente, id_admin: authUser.id_usuario }), { status: 201 });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
