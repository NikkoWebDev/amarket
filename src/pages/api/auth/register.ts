import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return new Response(JSON.stringify({ error: denied.error }), { status: denied.status });

    const { nombre, email, password, rol } = await request.json();
    if (!nombre || !email || !password || !rol) {
      return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), { status: 400 });
    }
    if (!['admin', 'empleado', 'cliente'].includes(rol)) {
      return new Response(JSON.stringify({ error: 'Rol inválido' }), { status: 400 });
    }

    const existingResult = await pool.query('SELECT id_usuario FROM usuarios WHERE email = $1', [email]);
    if (existingResult.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'El email ya está registrado' }), { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id_usuario',
      [nombre, email, hash, rol]
    );

    return new Response(JSON.stringify({ id_usuario: result.rows[0].id_usuario, nombre, email, rol }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
