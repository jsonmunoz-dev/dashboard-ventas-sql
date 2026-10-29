-- KPIs del período [$1, $2] comparados con el período anterior de igual duración.
-- Técnicas: CTE de parámetros, UNION ALL para generar ambos períodos,
-- LEFT JOIN para no perder períodos sin ventas y NULLIF para evitar división por cero.
WITH params AS (
  SELECT $1::date AS from_date,
         $2::date AS to_date,
         ($2::date - $1::date + 1) AS days
),
periods AS (
  SELECT 'actual' AS period, from_date AS start_date, to_date AS end_date FROM params
  UNION ALL
  SELECT 'anterior', from_date - days, from_date - 1 FROM params
),
agg AS (
  SELECT pe.period,
         COALESCE(SUM(l.revenue), 0)   AS revenue,
         COUNT(DISTINCT l.order_id)    AS orders,
         COUNT(DISTINCT l.customer_id) AS customers,
         COALESCE(SUM(l.quantity), 0)  AS units
  FROM periods pe
  LEFT JOIN v_order_lines l
    ON l.ordered_at >= pe.start_date
   AND l.ordered_at <  pe.end_date + 1
  GROUP BY pe.period
)
SELECT cur.revenue,
       cur.orders,
       cur.customers,
       cur.units,
       ROUND(cur.revenue / NULLIF(cur.orders, 0))  AS avg_ticket,
       prev.revenue                                AS prev_revenue,
       prev.orders                                 AS prev_orders,
       ROUND(prev.revenue / NULLIF(prev.orders, 0)) AS prev_avg_ticket,
       ROUND(100.0 * (cur.revenue - prev.revenue) / NULLIF(prev.revenue, 0), 1) AS revenue_change_pct,
       ROUND(100.0 * (cur.orders - prev.orders) / NULLIF(prev.orders, 0), 1)    AS orders_change_pct
FROM agg cur
JOIN agg prev ON prev.period = 'anterior'
WHERE cur.period = 'actual';
