// Punto de entrada que usa Vercel: exporta la app de Express ya configurada.
require('dotenv').config();
const { attachDatabasePool } = require('@vercel/functions');
const { createPool } = require('./db');
const { loadQueries } = require('./queries');
const { createApp } = require('./app');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta la variable de entorno DATABASE_URL');
}

const pool = createPool(process.env.DATABASE_URL);
// En Vercel, libera las conexiones inactivas antes de que la función se suspenda.
attachDatabasePool(pool);

module.exports = createApp({
  db: pool,
  queries: loadQueries(),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
});
