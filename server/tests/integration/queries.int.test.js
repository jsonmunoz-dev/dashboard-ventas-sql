// Ejecuta las consultas reales contra PostgreSQL con los datos generados
// y verifica invariantes de negocio (las cifras deben cuadrar entre sí).
const { createPool } = require('../../src/db');
const { loadQueries } = require('../../src/queries');
const { setupDatabase } = require('../../scripts/db-setup');

const pool = createPool(process.env.DATABASE_URL);
const queries = loadQueries();
const run = async (name, params = []) => (await pool.query(queries[name], params)).rows;

const FROM = '2025-01-01';
const TO = '2026-09-30';

beforeAll(async () => {
  await setupDatabase(pool);
}, 60_000);

afterAll(() => pool.end());

const sum = (rows, key) => rows.reduce((acc, r) => acc + r[key], 0);

describe('datos generados', () => {
  it('el seed es determinista y tiene alrededor de 5.000 pedidos', async () => {
    const [{ n }] = (await pool.query('SELECT COUNT(*)::int AS n FROM orders')).rows;
    expect(n).toBeGreaterThan(4500);
    expect(n).toBeLessThan(5500);
  });

  it('rango_fechas cubre el período generado', async () => {
    const [r] = await run('rango_fechas');
    expect(r.min_date).toBe('2025-01-01');
    expect(r.max_date >= '2026-09-01').toBe(true);
  });
});

describe('consistencia entre consultas', () => {
  it('la suma de ventas mensuales, por categoría y por región es igual a los ingresos del KPI', async () => {
    const [kpis] = await run('kpis', [FROM, TO]);
    expect(kpis.revenue).toBeGreaterThan(0);
    expect(sum(await run('ventas_mensuales', [FROM, TO]), 'revenue')).toBe(kpis.revenue);
    expect(sum(await run('ventas_por_categoria', [FROM, TO]), 'revenue')).toBe(kpis.revenue);
    expect(sum(await run('ventas_por_region', [FROM, TO]), 'revenue')).toBe(kpis.revenue);
  });

  it('las participaciones suman ~100 %', async () => {
    for (const name of ['ventas_por_categoria', 'ventas_por_region']) {
      expect(sum(await run(name, [FROM, TO]), 'share_pct')).toBeCloseTo(100, 0);
    }
  });

  it('el período anterior del KPI coincide con calcular ese período directamente', async () => {
    // Abril–junio son 91 días, así que el período anterior es 31-dic → 31-mar.
    const [actual] = await run('kpis', ['2026-04-01', '2026-06-30']);
    const [anterior] = await run('kpis', ['2025-12-31', '2026-03-31']);
    expect(actual.prev_revenue).toBe(anterior.revenue);
    expect(actual.prev_orders).toBe(anterior.orders);
  });
});

describe('ventas_mensuales', () => {
  it('rellena con 0 los meses sin ventas y calcula LAG y promedio móvil', async () => {
    const rows = await run('ventas_mensuales', ['2024-11-01', '2025-03-31']);
    expect(rows.map((r) => r.month)).toEqual([
      '2024-11',
      '2024-12',
      '2025-01',
      '2025-02',
      '2025-03',
    ]);
    expect(rows[0]).toMatchObject({ revenue: 0, orders: 0, mom_change_pct: null });
    const [, , jan, feb, mar] = rows;
    expect(mar.moving_avg_3m).toBe(Math.round((jan.revenue + feb.revenue + mar.revenue) / 3));
    expect(feb.mom_change_pct).toBeCloseTo((100 * (feb.revenue - jan.revenue)) / jan.revenue, 1);
  });

  it('refleja la estacionalidad de fin de año', async () => {
    const rows = await run('ventas_mensuales', ['2025-01-01', '2025-12-31']);
    const avg = sum(rows, 'orders') / rows.length;
    const nov = rows.find((r) => r.month === '2025-11');
    expect(nov.orders).toBeGreaterThan(avg);
  });
});

describe('top_productos', () => {
  it('ordena por ingresos con ranking y acumulado creciente', async () => {
    const rows = await run('top_productos', [FROM, TO, 5]);
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4, 5]);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].revenue).toBeLessThanOrEqual(rows[i - 1].revenue);
      expect(rows[i].cumulative_pct).toBeGreaterThan(rows[i - 1].cumulative_pct);
    }
    expect(rows[0].cumulative_pct).toBe(rows[0].share_pct);
  });

  it('el acumulado del último producto es 100 %', async () => {
    const rows = await run('top_productos', [FROM, TO, 50]);
    expect(rows.at(-1).cumulative_pct).toBeCloseTo(100, 1);
  });
});

describe('cohortes', () => {
  it('el mes 0 de cada cohorte es 100 % y nunca se supera', async () => {
    const rows = await run('cohortes', ['2025-01-01', '2025-06-30', 6]);
    const cohorts = new Set(rows.map((r) => r.cohort));
    expect([...cohorts]).toEqual([
      '2025-01',
      '2025-02',
      '2025-03',
      '2025-04',
      '2025-05',
      '2025-06',
    ]);
    for (const r of rows) {
      expect(r.month_offset).toBeLessThanOrEqual(6);
      expect(r.retention_pct).toBeLessThanOrEqual(100);
      if (r.month_offset === 0) expect(r.retention_pct).toBe(100);
    }
  });

  it('la suma de clientes de mes 0 coincide con los clientes nuevos', async () => {
    const rows = await run('cohortes', [FROM, TO, 0]);
    const [{ n }] = (
      await pool.query(
        "SELECT COUNT(DISTINCT customer_id)::int AS n FROM orders WHERE status = 'completed'",
      )
    ).rows;
    expect(sum(rows, 'customers')).toBe(n);
  });
});
