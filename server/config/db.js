import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config(); // fallback

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL?.trim();

if (!dbUrl) {
  console.error('\n❌ FATAL: DATABASE_URL is not configured in server/.env.');
  console.error('👉 PostgreSQL/Supabase is strictly required. Please set DATABASE_URL in server/.env.\n');
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err);
});

/**
 * Universal query function for PostgreSQL
 */
export async function query(text, params = []) {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is not configured. Please set your Supabase connection string in server/.env.');
  }
  const res = await pool.query(text, params);
  return { rows: res.rows, rowCount: res.rowCount };
}

/**
 * Execute schema.sql against PostgreSQL / Supabase
 */
export async function initializeDatabase() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schemaSql);
  console.log('✅ PostgreSQL Schema executed successfully on Supabase.');
}

export default { query, initializeDatabase, pool };
