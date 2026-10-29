-- =============================================================
-- Datos de ejemplo generados con SQL (deterministas gracias a setseed)
-- ~5.000 pedidos entre ene-2025 y sep-2026, con tendencia creciente
-- y estacionalidad en noviembre y diciembre.
-- =============================================================
SELECT setseed(0.42);

INSERT INTO regions (name) VALUES
  ('Valparaíso'), ('Metropolitana'), ('Biobío'), ('Coquimbo'),
  ('Maule'), ('Araucanía'), ('Antofagasta'), ('Los Lagos');

INSERT INTO categories (name) VALUES
  ('Computación'), ('Celulares'), ('Audio'), ('Hogar inteligente'), ('Accesorios');

INSERT INTO products (name, category_id, unit_price, popularity) VALUES
  ('Notebook 14" Ryzen 5',        1, 549990, 1.2),
  ('Notebook 15" Core i7',        1, 899990, 0.6),
  ('Monitor 24" IPS',             1, 129990, 1.5),
  ('Monitor 27" 2K',              1, 229990, 0.8),
  ('Teclado mecánico',            1,  39990, 2.0),
  ('Mouse inalámbrico',           1,  14990, 3.0),
  ('SSD NVMe 1TB',                1,  64990, 1.8),
  ('Smartphone gama media',       2, 249990, 2.2),
  ('Smartphone gama alta',        2, 799990, 0.7),
  ('Smartwatch deportivo',        2, 119990, 1.1),
  ('Cargador rápido 30W',         2,  19990, 3.2),
  ('Funda antigolpes',            2,   9990, 3.5),
  ('Audífonos bluetooth',         3,  49990, 2.6),
  ('Audífonos con cancelación',   3, 179990, 0.9),
  ('Parlante portátil',           3,  69990, 1.6),
  ('Barra de sonido',             3, 159990, 0.6),
  ('Ampolleta inteligente',       4,  12990, 2.4),
  ('Enchufe inteligente',         4,  15990, 2.0),
  ('Cámara de seguridad Wi-Fi',   4,  39990, 1.3),
  ('Asistente de voz',            4,  59990, 1.0),
  ('Cable USB-C 2m',              5,   7990, 3.8),
  ('Hub USB-C 7 en 1',            5,  29990, 1.4),
  ('Mochila para notebook',       5,  34990, 1.2),
  ('Soporte para notebook',       5,  24990, 1.0);

INSERT INTO customers (name, region_id)
SELECT 'Cliente ' || LPAD(g::text, 4, '0'),
       -- Más clientes en Metropolitana y Valparaíso.
       CASE
         WHEN r < 0.40 THEN 2
         WHEN r < 0.60 THEN 1
         ELSE 3 + FLOOR(random() * 6)::int
       END
FROM generate_series(1, 900) AS g, LATERAL (SELECT random() + g * 0 AS r) AS x;

-- Cantidad de pedidos por día = base + tendencia + estacionalidad + ruido.
WITH days AS (
  SELECT d::date AS day,
         (d::date - DATE '2025-01-01')::numeric / (DATE '2026-09-30' - DATE '2025-01-01') AS progress
  FROM generate_series(DATE '2025-01-01', DATE '2026-09-30', INTERVAL '1 day') AS d
)
INSERT INTO orders (customer_id, ordered_at, status)
SELECT 1 + FLOOR(POWER(random(), 1.6) * 900)::int, -- algunos clientes compran mucho más
       day + INTERVAL '8 hours' + random() * INTERVAL '14 hours',
       CASE WHEN random() < 0.05 THEN 'cancelled' ELSE 'completed' END
FROM days,
     LATERAL generate_series(
       1,
       (4 + 4 * progress
          + CASE WHEN EXTRACT(MONTH FROM day) IN (11, 12) THEN 3 ELSE 0 END
          + FLOOR(random() * 4))::int
     ) AS n
ORDER BY day;

-- 1 a 3 productos distintos por pedido, elegidos con muestreo ponderado por popularidad
-- (técnica "exponential race": ORDER BY -ln(random()) / peso).
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1 + FLOOR(random() * 2)::int, p.unit_price
FROM orders AS o
CROSS JOIN LATERAL (
  SELECT id, unit_price
  FROM products
  ORDER BY -LN(random()) / popularity + o.id * 0
  LIMIT 1 + FLOOR(random() * 3)::int
) AS p;

ANALYZE;
