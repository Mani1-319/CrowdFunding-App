/**
 * Applies SQL migrations in server/migrations/ (run from repo root: node server/scripts/runMigration.js)
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

async function run() {
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log('Running', file, '...');
    await db.query(sql);
  }
  console.log('Migrations OK.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
