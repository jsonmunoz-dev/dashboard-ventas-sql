-- Ranking de productos por ingresos, con participación y porcentaje acumulado
-- (análisis de Pareto: ¿cuántos productos explican el 80 % de las ventas?).
-- $3 = cantidad de productos a devolver.
WITH product_sales AS (
  SELECT product,
         category,
         SUM(quantity) AS units,
         SUM(revenue)  AS revenue
  FROM v_order_lines
  WHERE ordered_at >= $1::date
    AND ordered_at <  $2::date + 1
  GROUP BY product, category
),
ranked AS (
  SELECT product,
         category,
         units,
         revenue,
         RANK() OVER (ORDER BY revenue DESC) AS rank,
         ROUND(100.0 * revenue / SUM(revenue) OVER (), 2) AS share_pct,
         ROUND(
           100.0 * SUM(revenue) OVER (ORDER BY revenue DESC, product ROWS UNBOUNDED PRECEDING)
                 / SUM(revenue) OVER (),
           2
         ) AS cumulative_pct
  FROM product_sales
)
SELECT *
FROM ranked
ORDER BY rank, product
LIMIT $3;
