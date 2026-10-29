// Crea el esquema, genera los datos y crea las vistas (equivale a ejecutar los .sql con psql).
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { createPool } = require('../src/db');

const SQL_ROOT = process.env.SQL_ROOT || path.resolve(__dirname, '../../sql');
const FILES = ['01_schema.sql', '02_seed.sql', '03_views.sql'];

async function setupDatabase(pool, root = SQL_ROOT) {
  for (const file of FILES) {
    await pool.query(fs.readFileSync(path.join(root, file), 'utf8'));
    console.log(`Ejecutado ${file}`);
  }
}

if (require.main === module) {
  const pool = createPool(process.env.DATABASE_URL);
  setupDatabase(pool)
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
