const { Client } = require('pg');

async function patchDb() {
  const client = new Client({
    user: 'postgres',
    password: 'Mani@1319',
    host: 'localhost',
    port: 5432,
    database: 'crowdfunding_db',
  });

  try {
    await client.connect();
    
    // Ensure reviews table exists precisely
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        review_text TEXT NOT NULL,
        is_flagged BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database Patched successfully. Reviews Table Verified.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await client.end();
  }
}

patchDb();
