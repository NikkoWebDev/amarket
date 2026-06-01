import pg from 'pg';
const { Pool } = pg;

let pool;

if (process.env.INTERNAL_DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.INTERNAL_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else if (process.env.EXTERNAL_DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.EXTERNAL_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

export default pool;
