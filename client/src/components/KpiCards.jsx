import { formatCLP, formatInt, formatPct } from '../format';

function Delta({ current, previous }) {
  if (!previous) return <span className="delta">Sin período anterior</span>;
  const pct = Math.round((1000 * (current - previous)) / previous) / 10;
  const dir = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
  const arrow = { up: '▲', down: '▼', flat: '■' }[dir];
  // La flecha y el signo comunican la dirección; el color solo la refuerza.
  return (
    <span className={`delta delta-${dir}`}>
      <span aria-hidden="true">{arrow}</span> {pct > 0 ? '+' : ''}
      {formatPct(pct)} vs período anterior
    </span>
  );
}

export function KpiCards({ kpis }) {
  const cards = [
    {
      label: 'Ingresos',
      value: formatCLP(kpis.revenue),
      cur: kpis.revenue,
      prev: kpis.prev_revenue,
    },
    { label: 'Pedidos', value: formatInt(kpis.orders), cur: kpis.orders, prev: kpis.prev_orders },
    {
      label: 'Ticket promedio',
      value: formatCLP(kpis.avg_ticket),
      cur: kpis.avg_ticket,
      prev: kpis.prev_avg_ticket,
    },
    { label: 'Clientes activos', value: formatInt(kpis.customers) },
  ];

  return (
    <section className="kpis" aria-label="Indicadores principales">
      {cards.map((c) => (
        <article key={c.label} className="card kpi">
          <h2>{c.label}</h2>
          <p className="kpi-value">{c.value}</p>
          {c.prev !== undefined && <Delta current={c.cur} previous={c.prev} />}
        </article>
      ))}
    </section>
  );
}
