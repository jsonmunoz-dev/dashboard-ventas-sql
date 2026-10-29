import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCLP, formatCLPCompact, formatPct } from '../format';
import { useChartTheme } from '../hooks/useChartTheme';
import { ChartCard, DataTable } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';

// Barras horizontales ordenadas (una sola serie): sirve para productos, categorías y regiones.
export function RankedBarChart({ title, subtitle, data, labelKey, tableColumns, className }) {
  const t = useChartTheme();
  const height = Math.max(160, data.length * 36 + 24);

  return (
    <ChartCard
      className={className}
      title={title}
      subtitle={subtitle}
      table={<DataTable rows={data} columns={tableColumns} />}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 72, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={t['grid']} horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey={labelKey}
            width={200}
            tickLine={false}
            axisLine={false}
            tick={{ fill: t['text-secondary'], fontSize: 12 }}
          />
          <Tooltip
            content={<ChartTooltip valueFormatter={formatCLP} />}
            cursor={{ fill: t['grid'], fillOpacity: 0.5 }}
          />
          <Bar
            name="Ingresos"
            dataKey="revenue"
            fill={t['series-1']}
            radius={[0, 4, 4, 0]}
            barSize={18}
          >
            <LabelList
              dataKey="revenue"
              position="right"
              formatter={formatCLPCompact}
              style={{ fill: t['text-secondary'], fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export const shareColumn = {
  key: 'share_pct',
  label: '% del total',
  numeric: true,
  format: formatPct,
};
export const revenueColumn = {
  key: 'revenue',
  label: 'Ingresos',
  numeric: true,
  format: formatCLP,
};
