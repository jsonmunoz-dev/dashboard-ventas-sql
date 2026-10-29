import { useId, useState } from 'react';

// Tarjeta con título y un botón para alternar entre gráfico y tabla
// (vista accesible y útil para leer los valores exactos).
export function ChartCard({ title, subtitle, table, children, className = '' }) {
  const [showTable, setShowTable] = useState(false);
  const id = useId();
  return (
    <section className={`card chart-card ${className}`} aria-labelledby={id}>
      <header className="chart-header">
        <div>
          <h2 id={id}>{title}</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        {table && (
          <button type="button" className="link" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'Ver gráfico' : 'Ver tabla'}
          </button>
        )}
      </header>
      {showTable ? table : children}
    </section>
  );
}

export function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.numeric ? 'num' : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? 'num' : undefined}>
                  {c.format ? c.format(r[c.key]) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
