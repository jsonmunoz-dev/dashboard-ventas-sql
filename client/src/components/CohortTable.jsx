import { formatInt, formatPct } from '../format';
import { ChartCard } from './ChartCard';

// Paso de la rampa secuencial azul según el % de retención (más oscuro = más retención).
export function retentionStep(pct) {
  if (pct >= 100) return 7;
  return Math.min(6, Math.floor(pct / 5) + 1); // 0–4.9 → 1 … ≥25 → 6
}

export function CohortTable({ rows, months = 6 }) {
  const cohorts = [];
  const byCohort = new Map();
  for (const r of rows) {
    if (!byCohort.has(r.cohort)) {
      byCohort.set(r.cohort, { size: r.cohort_size, values: {} });
      cohorts.push(r.cohort);
    }
    byCohort.get(r.cohort).values[r.month_offset] = r.retention_pct;
  }
  const offsets = Array.from({ length: months + 1 }, (_, i) => i);

  return (
    <ChartCard
      className="span-2"
      title="Retención de clientes por cohorte"
      subtitle="% de clientes de cada cohorte (mes de primera compra) que vuelve a comprar N meses después"
    >
      {cohorts.length === 0 ? (
        <p className="empty">No hay cohortes que comiencen en este rango.</p>
      ) : (
        <div className="table-wrap">
          <table className="cohort">
            <thead>
              <tr>
                <th>Cohorte</th>
                <th className="num">Clientes</th>
                {offsets.map((o) => (
                  <th key={o} className="num">
                    Mes {o}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => {
                const { size, values } = byCohort.get(c);
                return (
                  <tr key={c}>
                    <th scope="row">{c}</th>
                    <td className="num">{formatInt(size)}</td>
                    {offsets.map((o) =>
                      values[o] === undefined ? (
                        <td key={o} className="num heat-none">
                          —
                        </td>
                      ) : (
                        <td key={o} className={`num heat-${retentionStep(values[o])}`}>
                          {formatPct(values[o], 0)}
                        </td>
                      ),
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
