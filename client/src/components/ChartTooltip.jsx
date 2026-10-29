// Tooltip de Recharts con estilo propio: el texto usa tokens de texto,
// el color de la serie va solo en la muestra junto a la etiqueta.
export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <p className="tooltip-label">{labelFormatter ? labelFormatter(label) : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="tooltip-row">
          <span className="swatch" style={{ background: p.color }} aria-hidden="true" />
          <span>{p.name}</span>
          <strong>{valueFormatter ? valueFormatter(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}
