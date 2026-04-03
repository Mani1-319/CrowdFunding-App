const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_5qmEQY0BWpkd@ep-old-flower-ancidnzo-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    const hash = await bcrypt.hash('Mani@1319', 10);
    await pool.query('UPDATE admins SET password_hash = $1 WHERE email = $2', [hash, 'adminsrinath@donte.com']);
    console.log('Password updated successfully');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
