const { Pool } = require('pg');
require('dotenv').config();

function sslOptionForUrl() {
  const url = process.env.DATABASE_URL || '';
  if (process.env.DATABASE_SSL === 'true') {
    return { rejectUnauthorized: false };
  }
  // Neon, Supabase, RDS, and many hosts require TLS
  if (
    /neon\.tech|sslmode=require|supabase\.co|amazonaws\.com/i.test(url)
  ) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

const ssl = sslOptionForUrl();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(ssl ? { ssl } : {}),
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
