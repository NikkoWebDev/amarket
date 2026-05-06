const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dbamarket_user:cnLHuHAA6DEDeOOWzeKH0mzZOTVlvLqx@dpg-d7tm4bkm0tmc73ctgo2g-a.virginia-postgres.render.com/dbamarket?sslmode=require',
});

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/init.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
