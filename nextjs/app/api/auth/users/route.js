import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const authUser = getUserFromRequest(request);
    const denied = requireRole(authUser, 'admin');
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const result = await pool.query('SELECT id_usuario, nombre, email, rol FROM usuarios');
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
