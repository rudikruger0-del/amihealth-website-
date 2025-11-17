// api/db.js
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Missing DATABASE_URL environment variable");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

export default pool;
