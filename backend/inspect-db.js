require('dotenv').config();
const { query } = require('./src/config/db');

async function inspectDatabase() {
  try {
    console.log('=== TABLAS EN LA BASE DE DATOS ===');
    const [tables] = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(tables.map(t => t.table_name).join('\n'));

    console.log('\n=== ESTRUCTURA DE PROYECTOS ===');
    const [proyectosCols] = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'proyectos'
    `);
    console.log(proyectosCols.map(c => `${c.column_name}: ${c.data_type}`).join('\n'));

    console.log('\n=== PROYECTOS Y SUS ESTADOS ===');
    const [proyectos] = await query(`
      SELECT id_proyecto, titulo, estado, id_cliente, fecha_creacion
      FROM proyectos
      ORDER BY fecha_creacion DESC
      LIMIT 20
    `);
    console.table(proyectos);

    console.log('\n=== USUARIOS Y ROLES ===');
    const [usuarios] = await query(`
      SELECT id, nombre, email, rol
      FROM usuarios
      ORDER BY id
    `);
    console.table(usuarios);

    console.log('\n=== ESTADOS ÚNICOS EN PROYECTOS ===');
    const [estados] = await query(`
      SELECT DISTINCT estado, COUNT(*) as count
      FROM proyectos
      GROUP BY estado
    `);
    console.table(estados);

    console.log('\n=== ASIGNACIONES ===');
    const [asignaciones] = await query(`
      SELECT a.id_asignacion, a.id_proyecto, a.id_empleado, 
             p.titulo as proyecto, u.nombre as empleado
      FROM asignaciones a
      JOIN proyectos p ON a.id_proyecto = p.id_proyecto
      JOIN usuarios u ON a.id_empleado = u.id
      LIMIT 10
    `);
    console.table(asignaciones);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

inspectDatabase();
