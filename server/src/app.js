const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { endpoints } = require('./endpoints');

// db: cualquier objeto con query(sql, params) → { rows } (un Pool de pg o un fake en tests).
function createApp({ db, queries, corsOrigin }) {
  const missing = endpoints.filter((e) => !queries[e.query]).map((e) => e.query);
  if (missing.length) throw new Error(`Faltan consultas SQL: ${missing.join(', ')}`);

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const api = express.Router();
  for (const endpoint of endpoints) {
    api.get(endpoint.path, async (req, res) => {
      const parsed = endpoint.schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Parámetros inválidos',
          details: parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        });
      }
      const { rows } = await db.query(queries[endpoint.query], endpoint.params(parsed.data));
      return res.json(endpoint.single ? rows[0] : rows);
    });
  }
  app.use('/api', api);

  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });
  return app;
}

module.exports = { createApp };
