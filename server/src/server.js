require('dotenv').config();
const { createPool } = require('./db');
const { loadQueries } = require('./queries');
const { createApp } = require('./app');

if (!process.env.DATABASE_URL) {
  console.error('Falta la variable de entorno DATABASE_URL');
  process.exit(1);
}

const port = Number(process.env.PORT) || 4100;
const pool = createPool(process.env.DATABASE_URL);
const app = createApp({
  db: pool,
  queries: loadQueries(),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
});

const server = app.listen(port, () => console.log(`API en http://localhost:${port}`));

function shutdown() {
  server.close(() => pool.end().then(() => process.exit(0)));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
