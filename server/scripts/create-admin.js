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
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Clear old admins to avoid confusion
    await pool.query("DELETE FROM admins");

    // Insert new admin
    await pool.query("INSERT INTO admins (email, password_hash) VALUES ($1, $2)", [email, password_hash]);
    console.log(`Admin created/updated: ${email} / ${password}`);
  } catch(e) {
    console.error("Error creating admin:", e);
  }
  process.exit();
}
run();
