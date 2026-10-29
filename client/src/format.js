const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});
const clpCompact = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat('es-CL');

export const formatCLP = (v) => clp.format(v ?? 0);
export const formatCLPCompact = (v) => clpCompact.format(v ?? 0);
export const formatInt = (v) => integer.format(v ?? 0);
export const formatPct = (v, digits = 1) =>
  v === null || v === undefined
    ? '—'
    : `${v.toLocaleString('es-CL', { maximumFractionDigits: digits })} %`;

const monthNames = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];
// "2026-03" → "mar 26"
export function formatMonth(ym) {
  const [y, m] = ym.split('-');
  return `${monthNames[Number(m) - 1]} ${y.slice(2)}`;
}

// Primer día del mes que deja `months` meses calendario completos hasta isoDate:
// startOfMonthsBack('2026-09-29', 3) → '2026-07-01'.
export function startOfMonthsBack(isoDate, months) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - (months - 1));
  return d.toISOString().slice(0, 10);
}
