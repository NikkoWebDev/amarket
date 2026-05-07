// Database configuration supporting both local MySQL and Render PostgreSQL.
// If INTERNAL_DATABASE_URL is defined (Render internal connection), use PostgreSQL via `pg`.
// Otherwise, fall back to the original MySQL configuration using environment variables.

let pool;
let isPostgres = false;
if (process.env.INTERNAL_DATABASE_URL) {
  // PostgreSQL connection using the pg library
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.INTERNAL_DATABASE_URL,
    // Optional: SSL configuration for Render PostgreSQL
    ssl: { rejectUnauthorized: false },
  });
  isPostgres = true;
} else {
  // Local MySQL configuration (unchanged)
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Unified query interface that works with both MySQL (`?` placeholders) and PostgreSQL (`$1,$2...`).
// Returns results in the MySQL format: [rows, fields] for compatibility with existing route files.
async function query(sql, params) {
  if (isPostgres) {
    // Convert MySQL-style '?' placeholders to PostgreSQL $1, $2, ...
    let index = 1;
    const convertedSql = sql.replace(/\?/g, () => `$${index++}`);
    const result = await pool.query(convertedSql, params);
    // pg returns { rows, fields, ... }, convert to [rows, fields] to match mysql2
    return [result.rows, result.fields || []];
  }
  // MySQL: pool.query returns [rows, fields]
  return pool.query(sql, params);
}

module.exports = { query, pool };
