const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/manik/OneDrive/Desktop/Web 2/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const res = await pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'reviews' OR table_name = 'campaigns'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
run();
