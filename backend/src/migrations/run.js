require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const sqlPath = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  if (process.env.INTERNAL_DATABASE_URL) {
    // PostgreSQL (Render)
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.INTERNAL_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      // Split SQL by semicolons and execute each statement
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      for (const statement of statements) {
        await pool.query(statement);
      }
      console.log('Migraciones ejecutadas correctamente (PostgreSQL).');
    } catch (err) {
      console.error('Error ejecutando migraciones:', err.message);
      process.exit(1);
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
      multipleStatements: true,
    });

    try {
      await connection.query(sql);
      console.log('Migraciones ejecutadas correctamente (MySQL).');
    } catch (err) {
      console.error('Error ejecutando migraciones:', err.message);
      process.exit(1);
    } finally {
      await connection.end();
    }
  }
}

runMigrations();
