import { render, screen, within } from '@testing-library/react';
import { CohortTable, retentionStep } from '../components/CohortTable';

const rows = [
  { cohort: '2026-01', month_offset: 0, customers: 10, cohort_size: 10, retention_pct: 100 },
  { cohort: '2026-01', month_offset: 2, customers: 3, cohort_size: 10, retention_pct: 30 },
  { cohort: '2026-02', month_offset: 0, customers: 4, cohort_size: 4, retention_pct: 100 },
];

describe('CohortTable', () => {
  it('pivotea las filas en una matriz cohorte × mes', () => {
    render(<CohortTable rows={rows} months={2} />);
    const row = screen.getByRole('row', { name: /2026-01/ });
    const cells = within(row)
      .getAllByRole('cell')
      .map((c) => c.textContent);
    expect(cells).toEqual(['10', '100 %', '—', '30 %']);
  });

  it('muestra un mensaje si no hay cohortes', () => {
    render(<CohortTable rows={[]} />);
    expect(screen.getByText(/No hay cohortes/)).toBeInTheDocument();
  });

  it('asigna pasos de la rampa según la retención', () => {
    expect(retentionStep(100)).toBe(7);
    expect(retentionStep(0)).toBe(1);
    expect(retentionStep(12)).toBe(3);
    expect(retentionStep(80)).toBe(6);
  });
});
