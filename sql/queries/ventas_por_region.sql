-- Ventas por región: ingresos, pedidos, clientes activos y ticket promedio.
-- SUM(SUM(...)) OVER () combina una agregación con una función de ventana.
SELECT region,
       SUM(revenue)                AS revenue,
       COUNT(DISTINCT order_id)    AS orders,
       COUNT(DISTINCT customer_id) AS customers,
       ROUND(SUM(revenue) / COUNT(DISTINCT order_id)) AS avg_ticket,
       ROUND(100.0 * SUM(revenue) / SUM(SUM(revenue)) OVER (), 2) AS share_pct
FROM v_order_lines
WHERE ordered_at >= $1::date
  AND ordered_at <  $2::date + 1
GROUP BY region
ORDER BY revenue DESC;
