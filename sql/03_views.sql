-- =============================================================
-- Vista base para análisis: una fila por línea de pedido completado,
-- con todas las dimensiones ya unidas. Las consultas del dashboard
-- parten de aquí para no repetir JOINs.
-- =============================================================
CREATE OR REPLACE VIEW v_order_lines AS
SELECT o.id                      AS order_id,
       o.ordered_at,
       o.ordered_at::date        AS order_date,
       o.customer_id,
       r.name                    AS region,
       p.id                      AS product_id,
       p.name                    AS product,
       c.name                    AS category,
       oi.quantity,
       oi.quantity * oi.unit_price AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
JOIN categories c   ON c.id = p.category_id
JOIN customers cu   ON cu.id = o.customer_id
JOIN regions r      ON r.id = cu.region_id
WHERE o.status = 'completed';
