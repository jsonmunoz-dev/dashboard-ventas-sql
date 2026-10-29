import { useEffect, useState } from 'react';
import { getJson } from './api';
import { formatInt, formatPct, startOfMonthsBack } from './format';
import { useDashboardData } from './hooks/useDashboardData';
import { DateRangeFilter } from './components/DateRangeFilter';
import { KpiCards } from './components/KpiCards';
import { MonthlySalesChart } from './components/MonthlySalesChart';
import { RankedBarChart, revenueColumn, shareColumn } from './components/RankedBarChart';
import { CohortTable } from './components/CohortTable';

export function App() {
  const [bounds, setBounds] = useState(null);
  const [range, setRange] = useState(null);
  const [boundsError, setBoundsError] = useState(null);

  useEffect(() => {
    getJson('/rango-fechas')
      .then((b) => {
        setBounds(b);
        setRange({ from: startOfMonthsBack(b.max_date, 6), to: b.max_date });
      })
      .catch(setBoundsError);
  }, []);

  const { data, loading, error } = useDashboardData(range);
  const failure = boundsError || error;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard de Ventas</h1>
          <p className="subtitle">
            Todas las cifras se calculan con consultas SQL sobre PostgreSQL
          </p>
        </div>
        {bounds && range && <DateRangeFilter bounds={bounds} value={range} onChange={setRange} />}
      </header>

      {failure && (
        <p role="alert" className="error">
          No se pudieron cargar los datos: {failure.message}
        </p>
      )}
      {!failure && !data && <p className="loading">Cargando…</p>}

      {data && (
        <main className={`grid ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
          <KpiCards kpis={data.kpis} />
          <MonthlySalesChart data={data.monthly} />
          <RankedBarChart
            className="span-2"
            title="Top productos por ingresos"
            subtitle="Ranking con RANK() y % acumulado (Pareto)"
            data={data.topProducts}
            labelKey="product"
            tableColumns={[
              { key: 'rank', label: '#', numeric: true },
              { key: 'product', label: 'Producto' },
              { key: 'units', label: 'Unidades', numeric: true, format: formatInt },
              revenueColumn,
              shareColumn,
              { key: 'cumulative_pct', label: '% acumulado', numeric: true, format: formatPct },
            ]}
          />
          <RankedBarChart
            title="Ingresos por categoría"
            data={data.categories}
            labelKey="category"
            tableColumns={[
              { key: 'category', label: 'Categoría' },
              { key: 'units', label: 'Unidades', numeric: true, format: formatInt },
              revenueColumn,
              shareColumn,
            ]}
          />
          <RankedBarChart
            title="Ingresos por región"
            subtitle="Incluye clientes activos y ticket promedio en la vista de tabla"
            data={data.regions}
            labelKey="region"
            tableColumns={[
              { key: 'region', label: 'Región' },
              { key: 'orders', label: 'Pedidos', numeric: true, format: formatInt },
              { key: 'customers', label: 'Clientes', numeric: true, format: formatInt },
              revenueColumn,
              shareColumn,
            ]}
          />
          <CohortTable rows={data.cohorts} months={6} />
        </main>
      )}
    </div>
  );
}
