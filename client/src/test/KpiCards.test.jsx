import { render, screen } from '@testing-library/react';
import { KpiCards } from '../components/KpiCards';

const kpis = {
  revenue: 1200,
  orders: 10,
  customers: 7,
  avg_ticket: 120,
  prev_revenue: 1000,
  prev_orders: 12,
  prev_avg_ticket: 120,
};

describe('KpiCards', () => {
  it('muestra los valores y la variación con flecha y signo (no solo color)', () => {
    render(<KpiCards kpis={kpis} />);
    expect(screen.getByText('Ingresos')).toBeInTheDocument();
    expect(screen.getByText(/\+20 % vs período anterior/)).toHaveClass('delta-up');
    expect(screen.getByText(/-16,7 % vs período anterior/)).toHaveClass('delta-down');
    expect(screen.getByText(/^\s*0 % vs período anterior/)).toHaveClass('delta-flat');
  });

  it('indica cuando no hay datos del período anterior', () => {
    render(<KpiCards kpis={{ ...kpis, prev_revenue: 0, prev_orders: 0, prev_avg_ticket: null }} />);
    expect(screen.getAllByText('Sin período anterior')).toHaveLength(3);
  });
});
