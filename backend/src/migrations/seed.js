require('dotenv').config();
const bcrypt = require('bcryptjs');

async function seed() {
  const hash = await bcrypt.hash('admin123', 10);

  if (process.env.INTERNAL_DATABASE_URL || process.env.EXTERNAL_DATABASE_URL) {
    // PostgreSQL (Render)
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.INTERNAL_DATABASE_URL || process.env.EXTERNAL_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        ['Administrador', 'admin@sistema.com', hash, 'admin']
      );
      console.log('Usuario admin creado: admin@sistema.com / admin123');
    } catch (err) {
      console.error('Error en seed (PostgreSQL):', err.message);
    } finally {
      await pool.end();
    }
  } else {
    // MySQL (local development)
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    try {
      await connection.query(
        `INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
        ['Administrador', 'admin@sistema.com', hash, 'admin']
      );
      console.log('Usuario admin creado: admin@sistema.com / admin123');
    } catch (err) {
      console.error('Error en seed (MySQL):', err.message);
    } finally {
      await connection.end();
    }
  }
}

seed();
