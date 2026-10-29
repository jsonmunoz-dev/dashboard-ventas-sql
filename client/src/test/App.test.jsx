import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';

const responses = {
  '/api/rango-fechas': { min_date: '2025-01-01', max_date: '2026-09-29' },
  '/api/kpis': {
    revenue: 5000,
    orders: 20,
    customers: 9,
    avg_ticket: 250,
    prev_revenue: 4000,
    prev_orders: 20,
    prev_avg_ticket: 200,
  },
  '/api/ventas-mensuales': [
    { month: '2026-09', revenue: 5000, orders: 20, mom_change_pct: null, moving_avg_3m: 5000 },
  ],
  '/api/top-productos': [
    { rank: 1, product: 'Mouse', units: 3, revenue: 5000, share_pct: 100, cumulative_pct: 100 },
  ],
  '/api/ventas-por-categoria': [
    { category: 'Accesorios', units: 3, revenue: 5000, share_pct: 100 },
  ],
  '/api/ventas-por-region': [
    { region: 'Valparaíso', orders: 20, customers: 9, revenue: 5000, share_pct: 100 },
  ],
  '/api/cohortes': [],
};

let fetchMock;
beforeEach(() => {
  fetchMock = vi.fn(async (url) => {
    const path = url.split('?')[0];
    return { ok: true, status: 200, json: async () => responses[path] };
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('carga el rango y consulta los últimos 6 meses completos por defecto', async () => {
    render(<App />);
    expect(await screen.findByText('Clientes activos')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/kpis?from=2026-04-01&to=2026-09-29');
    expect(screen.getByRole('button', { name: '6 meses' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('cambia el rango con los presets', async () => {
    render(<App />);
    await screen.findByText('Clientes activos');
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }));
    expect(fetchMock).toHaveBeenCalledWith('/api/kpis?from=2025-01-01&to=2026-09-29');
  });

  it('alterna entre gráfico y tabla', async () => {
    render(<App />);
    await screen.findByText('Clientes activos');
    const [first] = screen.getAllByRole('button', { name: 'Ver tabla' });
    await userEvent.click(first);
    expect(screen.getByRole('columnheader', { name: 'Promedio móvil 3m' })).toBeInTheDocument();
  });

  it('muestra un error si la API falla', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Error interno' }),
    });
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Error interno');
  });
});
