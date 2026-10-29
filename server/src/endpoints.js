const { dateRange, empty, topProducts, cohorts } = require('./schemas');

// Mapa declarativo: ruta → consulta SQL + validación + orden de los parámetros ($1, $2, …).
const endpoints = [
  { path: '/rango-fechas', query: 'rango_fechas', schema: empty, params: () => [], single: true },
  { path: '/kpis', query: 'kpis', schema: dateRange, params: (q) => [q.from, q.to], single: true },
  {
    path: '/ventas-mensuales',
    query: 'ventas_mensuales',
    schema: dateRange,
    params: (q) => [q.from, q.to],
  },
  {
    path: '/top-productos',
    query: 'top_productos',
    schema: topProducts,
    params: (q) => [q.from, q.to, q.limit],
  },
  {
    path: '/ventas-por-categoria',
    query: 'ventas_por_categoria',
    schema: dateRange,
    params: (q) => [q.from, q.to],
  },
  {
    path: '/ventas-por-region',
    query: 'ventas_por_region',
    schema: dateRange,
    params: (q) => [q.from, q.to],
  },
  {
    path: '/cohortes',
    query: 'cohortes',
    schema: cohorts,
    params: (q) => [q.from, q.to, q.months],
  },
];

module.exports = { endpoints };
