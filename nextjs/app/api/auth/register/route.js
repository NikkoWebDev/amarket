import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function POST(request) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { nombre, email, password, rol } = await request.json();
    if (!nombre || !email || !password || !rol) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }
    if (!['admin', 'empleado', 'cliente'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    const [existing] = await pool.query('SELECT id_usuario FROM Usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO Usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rol]
    );

    return NextResponse.json({ id_usuario: result.insertId, nombre, email, rol }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
