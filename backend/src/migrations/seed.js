require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hash = await bcrypt.hash('admin123', 10);
  try {
    await connection.query(
      `INSERT IGNORE INTO Usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
      ['Administrador', 'admin@sistema.com', hash, 'admin']
    );
    console.log('Usuario admin creado: admin@sistema.com / admin123');
  } catch (err) {
    console.error('Error en seed:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
