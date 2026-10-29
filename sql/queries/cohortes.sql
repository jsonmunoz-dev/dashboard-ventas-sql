-- Retención de clientes por cohorte (mes de la primera compra).
-- Para cada cohorte iniciada entre $1 y $2: qué % de sus clientes volvió a
-- comprar 0, 1, 2… meses después. $3 = máximo de meses a mostrar.
-- Técnicas: MIN() por cliente, age() para distancia en meses, FIRST_VALUE().
WITH first_purchase AS (
  SELECT customer_id,
         date_trunc('month', MIN(ordered_at))::date AS cohort
  FROM v_order_lines
  GROUP BY customer_id
),
activity AS (
  SELECT DISTINCT customer_id,
         date_trunc('month', ordered_at)::date AS month
  FROM v_order_lines
),
cohort_activity AS (
  SELECT f.cohort,
         (EXTRACT(YEAR FROM age(a.month, f.cohort)) * 12
          + EXTRACT(MONTH FROM age(a.month, f.cohort)))::int AS month_offset,
         COUNT(*) AS customers
  FROM first_purchase f
  JOIN activity a USING (customer_id)
  WHERE f.cohort BETWEEN date_trunc('month', $1::date) AND date_trunc('month', $2::date)
  GROUP BY 1, 2
)
SELECT to_char(cohort, 'YYYY-MM') AS cohort,
       month_offset,
       customers,
       FIRST_VALUE(customers) OVER cohort_w AS cohort_size,
       ROUND(100.0 * customers / FIRST_VALUE(customers) OVER cohort_w, 1) AS retention_pct
FROM cohort_activity
WHERE month_offset <= $3
WINDOW cohort_w AS (PARTITION BY cohort ORDER BY month_offset)
ORDER BY cohort, month_offset;
