const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
  // Connect to default 'postgres' database to create the new one
  const client = new Client({
    user: 'postgres',
    password: 'Mani@1319',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to default postgres database.');
    
    // Check if db exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'crowdfunding_db'");
    if (res.rowCount === 0) {
      console.log('Creating database crowdfunding_db...');
      await client.query('CREATE DATABASE crowdfunding_db');
      console.log('Database created successfully.');
    } else {
      console.log('Database crowdfunding_db already exists.');
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
  }

  // Now connect to the new database to run the schema
  const dbClient = new Client({
    user: 'postgres',
    password: 'Mani@1319',
    host: 'localhost',
    port: 5432,
    database: 'crowdfunding_db',
  });

  try {
    await dbClient.connect();
    console.log('Connected to crowdfunding_db.');
    
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running schema.sql...');
    await dbClient.query(schemaSql);
    console.log('Schema executed successfully.');
    
  } catch (error) {
    console.error('Error running schema:', error);
  } finally {
    await dbClient.end();
  }
}

setup();
