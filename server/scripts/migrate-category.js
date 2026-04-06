const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/manik/OneDrive/Desktop/Web 2/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query(`ALTER TABLE campaigns ADD COLUMN category VARCHAR(100) DEFAULT 'Other'`);
    console.log("Migration successful: added category column.");
  } catch (err) {
    if (err.code === '42701') {
       console.log("Column category already exists.");
    } else {
       console.error("Migration error:", err);
    }
  }
  process.exit();
}
run();
