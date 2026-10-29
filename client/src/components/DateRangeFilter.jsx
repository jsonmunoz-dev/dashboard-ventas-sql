import { startOfMonthsBack } from '../format';

const PRESETS = [
  { label: '3 meses', months: 3 },
  { label: '6 meses', months: 6 },
  { label: '12 meses', months: 12 },
  { label: 'Todo', months: null },
];

export function DateRangeFilter({ bounds, value, onChange }) {
  const presetRange = (months) => ({
    from: months ? startOfMonthsBack(bounds.max_date, months) : bounds.min_date,
    to: bounds.max_date,
  });
  const isActive = (months) => {
    const r = presetRange(months);
    return r.from === value.from && r.to === value.to;
  };

  return (
    <div className="filters" role="group" aria-label="Rango de fechas">
      <div className="segmented">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={isActive(p.months)}
            onClick={() => onChange(presetRange(p.months))}
          >
            {p.label}
          </button>
        ))}
      </div>
      <label>
        Desde
        <input
          type="date"
          value={value.from}
          min={bounds.min_date}
          max={value.to}
          onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })}
        />
      </label>
      <label>
        Hasta
        <input
          type="date"
          value={value.to}
          min={value.from}
          max={bounds.max_date}
          onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })}
        />
      </label>
    </div>
  );
}
