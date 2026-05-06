require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  const sqlPath = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  try {
    await connection.query(sql);
    console.log('Migraciones ejecutadas correctamente.');
  } catch (err) {
    console.error('Error ejecutando migraciones:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
