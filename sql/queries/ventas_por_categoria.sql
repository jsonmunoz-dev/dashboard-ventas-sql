-- Ventas por categoría con participación sobre el total del período.
SELECT category,
       SUM(revenue)             AS revenue,
       SUM(quantity)            AS units,
       COUNT(DISTINCT order_id) AS orders,
       ROUND(100.0 * SUM(revenue) / SUM(SUM(revenue)) OVER (), 2) AS share_pct
FROM v_order_lines
WHERE ordered_at >= $1::date
  AND ordered_at <  $2::date + 1
GROUP BY category
ORDER BY revenue DESC;
