import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCLP, formatCLPCompact, formatMonth, formatPct } from '../format';
import { useChartTheme } from '../hooks/useChartTheme';
import { ChartCard, DataTable } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';

export function MonthlySalesChart({ data }) {
  const t = useChartTheme();
  const axis = { stroke: t['grid'], tick: { fill: t['text-muted'], fontSize: 12 } };

  const table = (
    <DataTable
      rows={data}
      columns={[
        { key: 'month', label: 'Mes', format: formatMonth },
        { key: 'revenue', label: 'Ingresos', numeric: true, format: formatCLP },
        { key: 'orders', label: 'Pedidos', numeric: true },
        { key: 'mom_change_pct', label: 'Var. mensual', numeric: true, format: formatPct },
        { key: 'moving_avg_3m', label: 'Promedio móvil 3m', numeric: true, format: formatCLP },
      ]}
    />
  );

  return (
    <ChartCard
      className="span-2"
      title="Ingresos mensuales"
      subtitle="Ingresos de cada mes y promedio móvil de 3 meses (LAG + ventana ROWS)"
      table={table}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid stroke={t['grid']} vertical={false} />
          <XAxis dataKey="month" tickFormatter={formatMonth} {...axis} />
          <YAxis tickFormatter={formatCLPCompact} width={80} {...axis} />
          <Tooltip
            content={<ChartTooltip labelFormatter={formatMonth} valueFormatter={formatCLP} />}
            cursor={{ stroke: t['text-muted'], strokeDasharray: '3 3' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconType="plainline"
            wrapperStyle={{ color: t['text-secondary'], fontSize: 13 }}
          />
          <Line
            name="Ingresos"
            dataKey="revenue"
            stroke={t['series-1']}
            strokeWidth={2}
            dot={{ r: 3, fill: t['series-1'], stroke: t['surface-1'], strokeWidth: 2 }}
            activeDot={{ r: 5, stroke: t['surface-1'], strokeWidth: 2 }}
          />
          <Line
            name="Promedio móvil 3 meses"
            dataKey="moving_avg_3m"
            stroke={t['series-2']}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 5, stroke: t['surface-1'], strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
