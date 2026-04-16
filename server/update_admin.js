const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_5qmEQY0BWpkd@ep-old-flower-ancidnzo-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    const email = 'manisrinath@donte.com';
    const password = 'Mani@1319';
    const hash = await bcrypt.hash(password, 10);
    
    // Clear old admins to avoid confusion
    await pool.query("DELETE FROM admins");

    // Insert new admin
    await pool.query("INSERT INTO admins (email, password_hash) VALUES ($1, $2)", [email, hash]);
    console.log(`Admin created/updated: ${email} / ${password} on production DB`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
