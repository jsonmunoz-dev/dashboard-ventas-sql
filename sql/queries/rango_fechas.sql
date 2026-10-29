-- Primer y último día con ventas (para inicializar el filtro del dashboard).
SELECT to_char(MIN(ordered_at), 'YYYY-MM-DD') AS min_date,
       to_char(MAX(ordered_at), 'YYYY-MM-DD') AS max_date
FROM v_order_lines;
