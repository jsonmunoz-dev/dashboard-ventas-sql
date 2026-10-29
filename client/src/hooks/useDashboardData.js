import { useEffect, useState } from 'react';
import { getJson } from '../api';

// Carga en paralelo todas las consultas del dashboard para el rango elegido.
export function useDashboardData(range) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!range) return undefined;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const params = { from: range.from, to: range.to };
    Promise.all([
      getJson('/kpis', params),
      getJson('/ventas-mensuales', params),
      getJson('/top-productos', { ...params, limit: 8 }),
      getJson('/ventas-por-categoria', params),
      getJson('/ventas-por-region', params),
      getJson('/cohortes', { ...params, months: 6 }),
    ])
      .then(([kpis, monthly, topProducts, categories, regions, cohorts]) => {
        if (!cancelled) {
          setState({
            data: { kpis, monthly, topProducts, categories, regions, cohorts },
            loading: false,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  return state;
}
