import { formatCLP, formatMonth, formatPct, startOfMonthsBack } from '../format';

describe('format', () => {
  it('formatea pesos chilenos sin decimales', () => {
    expect(formatCLP(1234567)).toMatch(/\$\s?1\.234\.567/);
  });

  it('formatea porcentajes y valores nulos', () => {
    expect(formatPct(12.34)).toBe('12,3 %');
    expect(formatPct(null)).toBe('—');
  });

  it('formatea meses YYYY-MM', () => {
    expect(formatMonth('2026-03')).toBe('mar 26');
  });

  it('calcula el inicio de N meses calendario completos', () => {
    expect(startOfMonthsBack('2026-09-29', 3)).toBe('2026-07-01');
    expect(startOfMonthsBack('2026-02-15', 12)).toBe('2025-03-01');
    expect(startOfMonthsBack('2026-03-31', 1)).toBe('2026-03-01');
  });
});
