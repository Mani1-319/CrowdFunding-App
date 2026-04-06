const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/manik/OneDrive/Desktop/Web 2/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const email = 'admin@donte.com';
    const password = 'admin';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Check if exists
    const check = await pool.query("SELECT * FROM admins WHERE email=$1", [email]);
    if (check.rows.length === 0) {
      await pool.query("INSERT INTO admins (email, password_hash) VALUES ($1, $2)", [email, password_hash]);
      console.log("Admin created: admin@donte.com / admin");
    } else {
      await pool.query("UPDATE admins SET password_hash=$1 WHERE email=$2", [password_hash, email]);
      console.log("Admin updated: admin@donte.com / admin");
    }
  } catch(e) {
    console.error("Error creating admin:", e);
  }
  process.exit();
}
run();
