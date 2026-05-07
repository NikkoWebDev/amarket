const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Use EXTERNAL_DATABASE_URL for external connections (from local terminal to Render DB)
const pool = new Pool({
  connectionString: process.env.EXTERNAL_DATABASE_URL || 
    'postgresql://dbamarket_user:cnLHuHAA6DEDeOOWzeKH0mzZOTVlvLqx@dpg-d7tm4bkm0tmc73ctgo2g-a.virginia-postgres.render.com/dbamarket?sslmode=require',
});

async function seedData(client) {
  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const empleadoPassword = await bcrypt.hash('empleado123', 10);
  const clientePassword = await bcrypt.hash('cliente123', 10);

  // Insert users
  const usersResult = await client.query(`
    INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Administrador', 'admin@sistema.com', $1, 'admin'),
    ('Juan Pérez', 'juan@empresa.com', $2, 'empleado'),
    ('María García', 'maria@empresa.com', $2, 'empleado'),
    ('Carlos López', 'carlos@cliente.com', $3, 'cliente'),
    ('Ana Martínez', 'ana@cliente.com', $3, 'cliente')
    ON CONFLICT (email) DO NOTHING
    RETURNING id_usuario, nombre, email, rol;
  `, [adminPassword, empleadoPassword, clientePassword]);

  console.log('👤 Usuarios creados:', usersResult.rowCount);

  // Get user IDs
  const adminResult = await client.query("SELECT id_usuario FROM usuarios WHERE email = 'admin@sistema.com'");
  const empleadoResult = await client.query("SELECT id_usuario FROM usuarios WHERE email = 'juan@empresa.com'");
  const clienteResult = await client.query("SELECT id_usuario FROM usuarios WHERE email = 'carlos@cliente.com'");

  if (adminResult.rows.length === 0 || empleadoResult.rows.length === 0 || clienteResult.rows.length === 0) {
    console.log('⚠️  Algunos usuarios ya existen, omitiendo proyectos de demo');
    return;
  }

  const adminId = adminResult.rows[0].id_usuario;
  const empleadoId = empleadoResult.rows[0].id_usuario;
  const clienteId = clienteResult.rows[0].id_usuario;

  // Insert projects
  const proyectosResult = await client.query(`
    INSERT INTO proyecto (titulo, id_cliente, id_admin) VALUES
    ('Sitio Web E-commerce', $1, $2),
    ('App Móvil de Delivery', $1, $2),
    ('Sistema de Gestión', $3, $2)
    ON CONFLICT DO NOTHING
    RETURNING id_proyecto, titulo;
  `, [clienteId, adminId, clienteId]);

  console.log('📁 Proyectos creados:', proyectosResult.rowCount);

  // Get project IDs for etapas
  const proyectoResult = await client.query("SELECT id_proyecto FROM proyecto WHERE titulo = 'Sitio Web E-commerce'");
  if (proyectoResult.rows.length > 0) {
    const proyectoId = proyectoResult.rows[0].id_proyecto;

    // Insert etapas
    await client.query(`
      INSERT INTO etapa (id_proyecto, num_etapa, descripcion, estado) VALUES
      ($1, 1, 'Diseño UI/UX', 'completado'),
      ($1, 2, 'Desarrollo Frontend', 'en_proceso'),
      ($1, 3, 'Desarrollo Backend', 'pendiente'),
      ($1, 4, 'Testing y Deploy', 'pendiente')
      ON CONFLICT DO NOTHING;
    `, [proyectoId]);

    console.log('📋 Etapas creadas para proyecto 1');

    // Insert asignaciones
    await client.query(`
      INSERT INTO asignaciones (id_proyecto, id_empleado) VALUES
      ($1, $2),
      ($1, $3)
      ON CONFLICT DO NOTHING;
    `, [proyectoId, empleadoId, empleadoId]);

    console.log('👥 Asignaciones creadas');
  }

  console.log('✅ Datos de demo insertados correctamente');
}

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/init.sql'), 'utf8');
  const client = await pool.connect();
  try {
    console.log('🔧 Creando tablas...');
    await client.query(sql);
    console.log('✅ Tablas creadas correctamente');
    
    console.log('\n🌱 Insertando datos de demo...');
    await seedData(client);
    
    console.log('\n🎉 Base de datos inicializada completamente');
    console.log('\n📧 Credenciales de demo:');
    console.log('   Admin: admin@sistema.com / admin123');
    console.log('   Empleado: juan@empresa.com / empleado123');
    console.log('   Cliente: carlos@cliente.com / cliente123');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
