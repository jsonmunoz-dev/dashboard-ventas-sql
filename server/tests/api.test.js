const request = require('supertest');
const { createApp } = require('../src/app');
const { loadQueries } = require('../src/queries');
const { endpoints } = require('../src/endpoints');

const queries = loadQueries();

function buildApp(rows = [{ ok: true }]) {
  const db = { query: jest.fn().mockResolvedValue({ rows }) };
  return { app: createApp({ db, queries, corsOrigin: '*' }), db };
}

const range = 'from=2026-01-01&to=2026-03-31';

describe('consultas SQL', () => {
  it('existe un archivo .sql para cada endpoint', () => {
    for (const e of endpoints) expect(queries[e.query]).toEqual(expect.any(String));
  });

  it('las consultas usan exactamente los parámetros que entrega cada endpoint', () => {
    const sample = { from: '2026-01-01', to: '2026-01-31', limit: 5, months: 3 };
    for (const e of endpoints) {
      const used = new Set(queries[e.query].match(/\$\d+/g) || []);
      expect(used.size).toBe(e.params(sample).length);
    }
  });

  it('falla al iniciar si falta una consulta', () => {
    expect(() => createApp({ db: {}, queries: {}, corsOrigin: '*' })).toThrow(/Faltan consultas/);
  });
});

describe('endpoints', () => {
  it.each([
    ['/api/kpis', ['2026-01-01', '2026-03-31']],
    ['/api/ventas-mensuales', ['2026-01-01', '2026-03-31']],
    ['/api/ventas-por-categoria', ['2026-01-01', '2026-03-31']],
    ['/api/ventas-por-region', ['2026-01-01', '2026-03-31']],
    ['/api/top-productos', ['2026-01-01', '2026-03-31', 10]],
    ['/api/cohortes', ['2026-01-01', '2026-03-31', 6]],
  ])('%s ejecuta su consulta con los parámetros en orden', async (path, params) => {
    const { app, db } = buildApp();
    const res = await request(app).get(`${path}?${range}`);
    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), params);
  });

  it('kpis y rango-fechas devuelven un objeto; el resto, un arreglo', async () => {
    const { app } = buildApp([{ a: 1 }, { a: 2 }]);
    expect((await request(app).get(`/api/kpis?${range}`)).body).toEqual({ a: 1 });
    expect((await request(app).get('/api/rango-fechas')).body).toEqual({ a: 1 });
    expect((await request(app).get(`/api/ventas-por-region?${range}`)).body).toHaveLength(2);
  });

  it('acepta limit y months personalizados', async () => {
    const { app, db } = buildApp();
    await request(app).get(`/api/top-productos?${range}&limit=3`);
    expect(db.query).toHaveBeenLastCalledWith(expect.any(String), ['2026-01-01', '2026-03-31', 3]);
    await request(app).get(`/api/cohortes?${range}&months=12`);
    expect(db.query).toHaveBeenLastCalledWith(expect.any(String), ['2026-01-01', '2026-03-31', 12]);
  });
});

describe('validación de parámetros', () => {
  it.each([
    ['', 'from'],
    ['from=2026-01-01', 'to'],
    ['from=01-01-2026&to=2026-02-01', 'from'],
    ['from=2026-02-30&to=2026-03-01', 'from'],
    ['from=2026-03-01&to=2026-01-01', 'from'],
    ['from=2020-01-01&to=2026-01-01', 'to'],
  ])('/api/kpis?%s → 400 (%s)', async (qs, field) => {
    const { app, db } = buildApp();
    const res = await request(app).get(`/api/kpis?${qs}`);
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toContain(field);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('valida limit y months', async () => {
    const { app } = buildApp();
    expect((await request(app).get(`/api/top-productos?${range}&limit=0`)).status).toBe(400);
    expect((await request(app).get(`/api/top-productos?${range}&limit=51`)).status).toBe(400);
    expect((await request(app).get(`/api/cohortes?${range}&months=13`)).status).toBe(400);
    expect((await request(app).get('/api/cohortes?from=2026-03-01&to=2026-01-01')).status).toBe(
      400,
    );
  });
});

describe('errores', () => {
  it('responde 500 sin filtrar detalles si falla la base de datos', async () => {
    const db = { query: jest.fn().mockRejectedValue(new Error('connection refused')) };
    const app = createApp({ db, queries, corsOrigin: '*' });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get(`/api/kpis?${range}`);
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('connection refused');
  });

  it('responde 404 en rutas desconocidas', async () => {
    const { app } = buildApp();
    expect((await request(app).get('/api/nada')).status).toBe(404);
  });
});
