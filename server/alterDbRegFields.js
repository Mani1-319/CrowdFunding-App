const { Client } = require('pg');
require('dotenv').config();

async function alter() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to db to add reg fields.');
    
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_privacy BOOLEAN DEFAULT false");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_adult BOOLEAN DEFAULT false");
    console.log('Added new columns to users table successfully.');
    
  } catch (error) {
    console.error('Error altering schema:', error);
  } finally {
    await client.end();
  }

  // Same for NeonDB if it exists here/or just local depending on env.
}

alter();
