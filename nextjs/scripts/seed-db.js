require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Use EXTERNAL_DATABASE_URL for external connections (from local terminal to Render DB)
const connectionString = process.env.EXTERNAL_DATABASE_URL || process.env.INTERNAL_DATABASE_URL;

if (!connectionString) {
  console.error('❌ No se encontró EXTERNAL_DATABASE_URL ni INTERNAL_DATABASE_URL');
  console.error('   Asegúrate de tener el archivo .env configurado o las variables de entorno definidas');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
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
    ('María García', 'maria@empresa.com', $3, 'empleado'),
    ('Carlos López', 'carlos@cliente.com', $4, 'cliente'),
    ('Ana Martínez', 'ana@cliente.com', $5, 'cliente')
    ON CONFLICT (email) DO NOTHING
    RETURNING id_usuario, nombre, email, rol;
  `, [adminPassword, empleadoPassword, empleadoPassword, clientePassword, clientePassword]);

  console.log('👤 Usuarios creados:', usersResult.rowCount);

  // Get user IDs
  const adminResult = await client.query("SELECT id_usuario FROM usuarios WHERE email = 'admin@sistema.com'");
  const empleado1Result = await client.query("SELECT id_usuario FROM usuarios WHERE email = 'juan@empresa.com'");
  const empleado2Result = await client.query("SELECT id_usuario FROM usuarios WHERE email = 'maria@empresa.com'");
  const clienteResult = await client.query("SELECT id_usuario FROM usuarios WHERE email = 'carlos@cliente.com'");

  if (adminResult.rows.length === 0 || empleado1Result.rows.length === 0 || clienteResult.rows.length === 0) {
    console.log('⚠️  No se encontraron usuarios necesarios');
    return;
  }

  const adminId = adminResult.rows[0].id_usuario;
  const empleado1Id = empleado1Result.rows[0].id_usuario;
  const empleado2Id = empleado2Result.rows[0].id_usuario;
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
  const proyectos = await client.query("SELECT id_proyecto, titulo FROM proyecto ORDER BY id_proyecto");
  
  for (const proj of proyectos.rows) {
    // Check if etapas already exist for this project
    const existingEtapas = await client.query(
      'SELECT 1 FROM etapa WHERE id_proyecto = $1 LIMIT 1', [proj.id_proyecto]
    );
    
    if (existingEtapas.rows.length === 0) {
      // Insert etapas
      await client.query(`
        INSERT INTO etapa (id_proyecto, num_etapa, descripcion, estado) VALUES
        ($1, 1, 'Diseño UI/UX', 'completado'),
        ($1, 2, 'Desarrollo Frontend', 'en_proceso'),
        ($1, 3, 'Desarrollo Backend', 'pendiente'),
        ($1, 4, 'Testing y Deploy', 'pendiente')
        ON CONFLICT DO NOTHING;
      `, [proj.id_proyecto]);
      console.log(`📋 Etapas creadas para proyecto: ${proj.titulo}`);
    }
  }

  // Insert asignaciones (Juan al proyecto 1, María al proyecto 1)
  const proyecto1 = await client.query("SELECT id_proyecto FROM proyecto WHERE titulo = 'Sitio Web E-commerce'");
  const proyecto2 = await client.query("SELECT id_proyecto FROM proyecto WHERE titulo = 'App Móvil de Delivery'");

  if (proyecto1.rows.length > 0) {
    await client.query(`
      INSERT INTO asignaciones (id_proyecto, id_empleado) VALUES
      ($1, $2),
      ($1, $3)
      ON CONFLICT DO NOTHING;
    `, [proyecto1.rows[0].id_proyecto, empleado1Id, empleado2Id]);
    console.log('👥 Asignaciones creadas para Sitio Web E-commerce (Juan + María)');
  }

  if (proyecto2.rows.length > 0) {
    await client.query(`
      INSERT INTO asignaciones (id_proyecto, id_empleado) VALUES
      ($1, $2)
      ON CONFLICT DO NOTHING;
    `, [proyecto2.rows[0].id_proyecto, empleado1Id]);
    console.log('👥 Asignación creada para App Móvil de Delivery (Juan)');
  }

  console.log('✅ Datos de demo insertados correctamente');
}

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/init.sql'), 'utf8');
  const client = await pool.connect();
  try {
    console.log('🔗 Conectado a:', connectionString.replace(/:[^:@]*@/, ':***@'));
    console.log('🔧 Creando tablas...');
    await client.query(sql);
    console.log('✅ Tablas creadas correctamente');
    
    console.log('\n🌱 Insertando datos de demo...');
    await seedData(client);
    
    console.log('\n🎉 Base de datos inicializada completamente');
    console.log('\n📧 Credenciales de demo:');
    console.log('   Admin:    admin@sistema.com / admin123');
    console.log('   Empleado: juan@empresa.com / empleado123');
    console.log('   Empleado: maria@empresa.com / empleado123');
    console.log('   Cliente:  carlos@cliente.com / cliente123');
    console.log('   Cliente:  ana@cliente.com / cliente123');
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
