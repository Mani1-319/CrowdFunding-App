const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/manik/OneDrive/Desktop/Web 2/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const email = 'manisrinath@donte.com';
    const password = 'Mani@1319';
    const legacyEmail = 'admin@donte.com';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const check = await pool.query("SELECT * FROM admins WHERE email=$1", [email]);
    const legacyCheck = await pool.query("SELECT * FROM admins WHERE email=$1", [legacyEmail]);

    if (check.rows.length === 0 && legacyCheck.rows.length === 0) {
      await pool.query("INSERT INTO admins (email, password_hash) VALUES ($1, $2)", [email, password_hash]);
      console.log(`Admin created: ${email} / ${password}`);
    } else if (check.rows.length === 0 && legacyCheck.rows.length > 0) {
      await pool.query("UPDATE admins SET email=$1, password_hash=$2 WHERE email=$3", [email, password_hash, legacyEmail]);
      console.log(`Admin migrated: ${legacyEmail} -> ${email}`);
    } else {
      await pool.query("UPDATE admins SET password_hash=$1 WHERE email=$2", [password_hash, email]);
      console.log(`Admin updated: ${email} / ${password}`);
    }
  } catch(e) {
    console.error("Error creating admin:", e);
  }
  process.exit();
}
run();
