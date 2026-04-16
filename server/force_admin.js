require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function populateAdmin() {
  console.log("Starting...");
  try {
    const email = 'manisrinath@donte.com';
    const password = 'Mani@1319';
    const hash = await bcrypt.hash(password, 10);
    
    // Clear old admins to avoid confusion
    await pool.query("DELETE FROM admins");

    // Insert new admin
    const res = await pool.query("INSERT INTO admins (id, email, password_hash) VALUES (1, $1, $2)", [email, hash]);
    console.log("Insert result:", res.rowCount);
    
    // verify
    const verify = await pool.query("SELECT * FROM admins");
    console.log("Admins:", verify.rows.length);

    console.log(`Admin created/updated: ${email} / ${password}`);
  } catch (err) {
    console.error("Error populating:", err);
  } finally {
    await pool.end(); // IMPORTANT!
  }
}

populateAdmin();
