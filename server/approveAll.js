const { Client } = require('pg');

async function approveAll() {
  const client = new Client({
    user: 'postgres',
    password: 'Mani@1319',
    host: 'localhost',
    port: 5432,
    database: 'crowdfunding_db',
  });

  try {
    await client.connect();
    await client.query("UPDATE campaigns SET status = 'approved'");
    console.log('All existing campaigns approved successfully.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await client.end();
  }
}

approveAll();
