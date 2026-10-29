-- Ventas por mes con variación mes a mes (LAG) y promedio móvil de 3 meses.
-- generate_series asegura que los meses sin ventas aparezcan con 0.
WITH months AS (
  SELECT generate_series(
           date_trunc('month', $1::date),
           date_trunc('month', $2::date),
           INTERVAL '1 month'
         )::date AS month
),
monthly AS (
  SELECT date_trunc('month', ordered_at)::date AS month,
         SUM(revenue)             AS revenue,
         COUNT(DISTINCT order_id) AS orders
  FROM v_order_lines
  WHERE ordered_at >= $1::date
    AND ordered_at <  $2::date + 1
  GROUP BY 1
),
filled AS (
  SELECT m.month,
         COALESCE(mo.revenue, 0) AS revenue,
         COALESCE(mo.orders, 0)  AS orders
  FROM months m
  LEFT JOIN monthly mo USING (month)
)
SELECT to_char(month, 'YYYY-MM') AS month,
       revenue,
       orders,
       ROUND(100.0 * (revenue - LAG(revenue) OVER w) / NULLIF(LAG(revenue) OVER w, 0), 1)
         AS mom_change_pct,
       ROUND(AVG(revenue) OVER (w ROWS BETWEEN 2 PRECEDING AND CURRENT ROW))
         AS moving_avg_3m
FROM filled
WINDOW w AS (ORDER BY month)
ORDER BY month;
