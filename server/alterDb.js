const { Client } = require('pg');

async function alter() {
  const client = new Client({
    user: 'postgres',
    password: 'Mani@1319',
    host: 'localhost',
    port: 5432,
    database: 'crowdfunding_db',
  });

  try {
    await client.connect();
    console.log('Connected to crowdfunding_db.');
    
    // Check if status exists, if not add it
    await client.query("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'");
    console.log('Added status column to campaigns table successfully.');
    
  } catch (error) {
    console.error('Error altering schema:', error);
  } finally {
    await client.end();
  }
}

alter();
